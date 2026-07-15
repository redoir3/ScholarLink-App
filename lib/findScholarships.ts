// @/lib/findScholarships.ts
import { createSupabaseClient } from '@/lib/supabaseClient';

export interface StudentProfile {
  name?: string;
  school?: string;
  schoolType?: string;
  year?: string;
  city?: string;
  state?: string;
  zip?: string;
  /** @deprecated prefer city; kept for email draft compatibility */
  hometown?: string;
  gpa?: string;
  fieldsOfStudy?: string[];
  excellence_areas: string[];
  backgrounds?: string[];
  goals?: string[];
  notes?: string;
  military?: boolean;
  first_gen?: boolean;
  pell?: boolean;
  low_income?: boolean;
  rural?: boolean;
}

/** Synonyms / related terms so "Computer Science" still matches "STEM", "coding", etc. */
const FIELD_SYNONYMS: Record<string, string[]> = {
  'computer science': ['cs', 'computing', 'software', 'programming', 'coding', 'stem', 'technology', 'tech', 'it', 'information technology', 'ai', 'artificial intelligence', 'data science', 'cyber'],
  'engineering': ['stem', 'mechanical', 'electrical', 'civil', 'chemical', 'biomedical', 'aerospace', 'tech'],
  'biology': ['life science', 'biomedical', 'pre-med', 'premed', 'health', 'science', 'stem'],
  'pre-med': ['medical', 'medicine', 'health', 'biology', 'nursing', 'healthcare', 'premed'],
  'nursing': ['health', 'healthcare', 'medical', 'nurse'],
  'business': ['finance', 'accounting', 'entrepreneur', 'management', 'marketing', 'economics', 'commerce'],
  'education': ['teaching', 'teacher', 'pedagogy'],
  'arts': ['fine arts', 'visual arts', 'creative', 'design', 'music', 'theater', 'theatre', 'performing'],
  'humanities': ['english', 'history', 'philosophy', 'literature', 'liberal arts', 'writing'],
  'social sciences': ['psychology', 'sociology', 'political', 'anthropology', 'public policy'],
  'law': ['legal', 'pre-law', 'prelaw', 'justice', 'criminal justice'],
  'agriculture': ['farming', 'ag', 'veterinary', 'animal science', 'food science'],
  'trades': ['vocational', 'technical', 'trade', 'apprentice', 'hvac', 'welding', 'electrician', 'plumbing'],
};

const BACKGROUND_SYNONYMS: Record<string, string[]> = {
  'first-generation': ['first gen', 'first-gen', 'first generation', 'firstgeneration', 'first gen college'],
  'military': ['veteran', 'armed forces', 'armed service', 'rotc', 'military dependent', 'active duty', 'national guard', 'reservist'],
  'low-income': ['pell', 'need-based', 'financial need', 'low income', 'economically disadvantaged', 'underserved', 'fafsa'],
  'pell': ['pell grant', 'financial need', 'need-based', 'low-income', 'low income'],
  'rural': ['rural', 'small town', 'farming community', 'agricultural community'],
  'underrepresented': ['minority', 'diversity', 'bipoc', 'underrepresented', 'students of color'],
  'disability': ['disabled', 'disability', 'disabilities', 'accessible', 'ada'],
  'lgbtq': ['lgbt', 'lgbtq', 'lgbtqia', 'queer', 'pride'],
  'immigrant': ['immigrant', 'refugee', 'daca', 'undocumented', 'new american', 'international'],
  'single parent': ['single parent', 'single mother', 'single father'],
  'foster': ['foster', 'ward of the state', 'orphan', 'adopted'],
};

const ACHIEVEMENT_SYNONYMS: Record<string, string[]> = {
  'honor roll': ['gpa', 'academic excellence', 'high achieving', 'dean', 'merit', 'honor'],
  'research': ['research', 'lab', 'symposium', 'publication', 'thesis'],
  'leadership': ['leader', 'president', 'officer', 'student government', 'eagle scout', 'captain'],
  'athletics': ['sport', 'athlete', 'athletic', 'varsity', 'team'],
  'community service': ['volunteer', 'service', 'community', 'civic', 'nonprofit', 'charity'],
  'arts': ['music', 'band', 'orchestra', 'theater', 'theatre', 'art', 'creative', 'dance'],
  'debate': ['speech', 'debate', 'forensics', 'public speaking'],
  'work experience': ['internship', 'employment', 'work', 'job', 'career'],
  'stem competition': ['robotics', 'science fair', 'olympiad', 'hackathon', 'coding competition'],
};

const SCHOOL_TYPE_KEYWORDS: Record<string, string[]> = {
  'High School': ['high school', 'high-school', 'secondary', 'senior', 'graduating senior', '12th', 'hs '],
  '2-Year / Community College': ['community college', 'two-year', '2-year', 'junior college', 'associate', 'transfer'],
  '4-Year College / University': ['university', 'four-year', '4-year', 'undergraduate', 'bachelor', 'college'],
  'Vocational / Trade School': ['vocational', 'trade', 'technical school', 'career school', 'certificate'],
  'Graduate / Professional': ['graduate', 'masters', 'master\'s', 'phd', 'doctoral', 'professional school', 'law school', 'med school', 'mba'],
};

function normalizeScholarship(sch: Record<string, unknown>) {
  const get = (...keys: string[]) => {
    for (const k of keys) {
      const v = sch[k];
      if (v != null && String(v).trim() !== '') return String(v);
    }
    return '';
  };

  return {
    ...sch,
    name: get('Scholarship Name', 'scholarship_name', 'name', 'title'),
    provider: get('Provider/Org', 'provider', 'organization', 'org'),
    tags: get('Eligibility Tags', 'eligibility_tags', 'tags', 'eligibility').toLowerCase(),
    why: get('Why Obtainable', 'why_obtainable', 'description', 'summary').toLowerCase(),
    notes: get(
      'Notes (for Email Builder Personalization)',
      'notes_for_email',
      'notes',
      'email_notes'
    ).toLowerCase(),
    city: get('city', 'City', 'location_city').toLowerCase(),
    state: get('state', 'State', 'location_state').toUpperCase(),
    zip: get('zip', 'zip_code', 'postal_code', 'Zip').toLowerCase(),
    contact: get(
      'Contact Name / Email / Phone / URL',
      'contact_email',
      'contact_person',
      'contact_url',
      'contact'
    ),
    amount: sch.amount ?? sch['Amount'] ?? null,
  };
}

function textIncludesAny(haystack: string, needles: string[]): boolean {
  return needles.some((n) => n && haystack.includes(n.toLowerCase()));
}

function expandTerms(value: string, synonymMap: Record<string, string[]>): string[] {
  const lower = value.toLowerCase().trim();
  const terms = new Set<string>([lower]);

  // strip common prefixes like "Other: "
  const cleaned = lower.replace(/^other:\s*/i, '').trim();
  if (cleaned) terms.add(cleaned);

  for (const [key, syns] of Object.entries(synonymMap)) {
    if (lower.includes(key) || syns.some((s) => lower.includes(s))) {
      terms.add(key);
      syns.forEach((s) => terms.add(s));
    }
  }

  // individual significant words
  cleaned
    .split(/[\s,/|&]+/)
    .filter((w) => w.length > 2)
    .forEach((w) => terms.add(w));

  return [...terms];
}

function parseGpa(value?: string): number | null {
  if (!value) return null;
  const m = String(value).match(/(\d+\.?\d*)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  if (Number.isNaN(n) || n < 0 || n > 5) return null;
  return n;
}

export function calculateMatchScore(
  schRaw: Record<string, unknown>,
  profile: StudentProfile
): number {
  const sch = normalizeScholarship(schRaw);
  const searchText = [
    sch.name,
    sch.provider,
    sch.tags,
    sch.why,
    sch.notes,
    sch.city,
    sch.state,
    sch.zip,
  ]
    .join(' ')
    .toLowerCase();

  let raw = 0;
  let maxPossible = 0;

  // —— Location (highest weight for local scholarships) ——
  maxPossible += 40;
  const city = (profile.city || profile.hometown || '').toLowerCase().trim();
  const state = (profile.state || '').toUpperCase().trim();
  const zip = (profile.zip || '').trim();

  if (city && (sch.city.includes(city) || searchText.includes(city))) {
    raw += 28;
  }
  if (state && (sch.state === state || searchText.includes(state.toLowerCase()))) {
    raw += 12;
  }
  if (zip && zip.length >= 5 && (sch.zip.includes(zip.slice(0, 5)) || searchText.includes(zip.slice(0, 5)))) {
    raw += 8;
  }

  // —— School name / type ——
  maxPossible += 20;
  if (profile.school) {
    const schoolLower = profile.school.toLowerCase();
    if (searchText.includes(schoolLower)) raw += 14;
  }
  if (profile.schoolType) {
    const kws = SCHOOL_TYPE_KEYWORDS[profile.schoolType] || [profile.schoolType.toLowerCase()];
    if (textIncludesAny(searchText, kws)) raw += 10;
  }

  // —— Fields of study ——
  maxPossible += 25;
  const fields = profile.fieldsOfStudy?.length
    ? profile.fieldsOfStudy
    : [];
  let fieldHits = 0;
  fields.forEach((field) => {
    const terms = expandTerms(field, FIELD_SYNONYMS);
    if (textIncludesAny(searchText, terms)) fieldHits += 1;
  });
  if (fields.length > 0) {
    raw += Math.min(25, (fieldHits / Math.max(fields.length, 1)) * 25 + (fieldHits > 0 ? 5 : 0));
  }

  // —— Achievements / excellence ——
  maxPossible += 20;
  let achHits = 0;
  (profile.excellence_areas || []).forEach((area) => {
    const terms = expandTerms(area, ACHIEVEMENT_SYNONYMS);
    if (textIncludesAny(searchText, terms)) achHits += 1;
  });
  if (profile.excellence_areas?.length) {
    raw += Math.min(20, achHits * 7);
  }

  // —— Background / equity flags ——
  maxPossible += 25;
  const backgrounds = [
    ...(profile.backgrounds || []),
    profile.military ? 'military' : '',
    profile.first_gen ? 'first-generation' : '',
    profile.pell ? 'pell' : '',
    profile.low_income ? 'low-income' : '',
    profile.rural ? 'rural' : '',
  ].filter(Boolean);

  let bgHits = 0;
  backgrounds.forEach((bg) => {
    const terms = expandTerms(bg, BACKGROUND_SYNONYMS);
    if (textIncludesAny(searchText, terms)) bgHits += 1;
  });
  if (backgrounds.length > 0) {
    raw += Math.min(25, bgHits * 10);
  }

  // —— Goals ——
  maxPossible += 12;
  let goalHits = 0;
  (profile.goals || []).forEach((goal) => {
    const terms = expandTerms(goal, FIELD_SYNONYMS);
    if (textIncludesAny(searchText, terms)) goalHits += 1;
  });
  if (profile.goals?.length) {
    raw += Math.min(12, goalHits * 5);
  }

  // —— Free-text notes ——
  maxPossible += 8;
  if (profile.notes) {
    const words = profile.notes
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    let noteHits = 0;
    words.forEach((w) => {
      if (searchText.includes(w)) noteHits += 1;
    });
    raw += Math.min(8, noteHits * 2);
  }

  // —— GPA soft signal (boost merit awards if strong GPA) ——
  maxPossible += 5;
  const gpa = parseGpa(profile.gpa);
  if (gpa != null) {
    const meritMention =
      searchText.includes('gpa') ||
      searchText.includes('merit') ||
      searchText.includes('academic excellence') ||
      searchText.includes('honor');
    if (meritMention && gpa >= 3.0) raw += 3;
    if (meritMention && gpa >= 3.5) raw += 2;
  }

  // Soft base so broadly open awards still surface slightly
  const openAward =
    searchText.includes('all students') ||
    searchText.includes('open to all') ||
    searchText.includes('no restriction') ||
    (sch.tags.includes('general') && !sch.tags.includes('local'));
  if (openAward) raw += 4;

  // Normalize to 0–100
  const normalized = maxPossible > 0 ? (raw / maxPossible) * 100 : 0;
  // Slight curve so good partial matches still look useful
  const curved = Math.pow(Math.min(normalized, 100) / 100, 0.85) * 100;
  return Math.max(1, Math.min(99, Math.round(curved)));
}

export async function findScholarships(profile: StudentProfile) {
  console.log('🔍 Starting smart search for profile:', profile);

  const supabase = createSupabaseClient();

  const { data, error } = await supabase.from('scholarships').select('*').limit(120);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Supabase query failed: ${error.message || JSON.stringify(error)}`);
  }

  if (!data || data.length === 0) {
    console.warn('No data in "scholarships" table. Check table name, RLS policies, or import script.');
    return [];
  }

  const scored = data
    .map((sch: Record<string, unknown>) => {
      const norm = normalizeScholarship(sch);
      return {
        ...sch,
        // Ensure cards can read common display fields regardless of DB column style
        'Scholarship Name': norm.name || sch['Scholarship Name'],
        'Provider/Org': norm.provider || sch['Provider/Org'],
        'Eligibility Tags':
          sch['Eligibility Tags'] || sch['eligibility_tags'] || sch['tags'] || '',
        'Why Obtainable':
          sch['Why Obtainable'] || sch['why_obtainable'] || sch['description'] || '',
        'Notes (for Email Builder Personalization)':
          sch['Notes (for Email Builder Personalization)'] ||
          sch['notes_for_email'] ||
          sch['notes'] ||
          '',
        'Contact Name / Email / Phone / URL':
          sch['Contact Name / Email / Phone / URL'] ||
          sch['contact_email'] ||
          sch['contact_person'] ||
          sch['contact_url'] ||
          '',
        contact_email: sch['contact_email'] || sch['Contact Email'] || undefined,
        contact_person: sch['contact_person'] || sch['Contact Person'] || undefined,
        contact_url: sch['contact_url'] || sch['Contact URL'] || undefined,
        amount: sch.amount ?? sch['Amount'] ?? null,
        match_score: calculateMatchScore(sch, profile),
        _hasContact: Boolean(norm.contact),
      };
    })
    .sort(
      (a: { match_score: number }, b: { match_score: number }) =>
        b.match_score - a.match_score
    );

  console.log(`📊 Found ${scored.length} scholarships. Top 6 scores:`);
  scored.slice(0, 6).forEach((s) => {
    console.log(`   • ${String(s['Scholarship Name'])} (${String(s['Provider/Org'])}) → ${s.match_score}`);
  });

  // Prefer scholarships with contact info (relationship-building), but don't hide good matches without it
  const withContact = scored.filter((s: { _hasContact: boolean }) => s._hasContact);
  const withoutContact = scored.filter((s: { _hasContact: boolean }) => !s._hasContact);

  const ranked = [...withContact, ...withoutContact]
    // drop near-zero relevance noise
    .filter((s: { match_score: number }) => s.match_score >= 8)
    .slice(0, 24);

  return ranked.map(({ _hasContact, ...rest }: { _hasContact: boolean; [key: string]: unknown }) => rest);
}
