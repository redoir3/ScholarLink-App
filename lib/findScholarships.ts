// @/lib/findScholarships.ts
import { createSupabaseClient } from '@/lib/supabaseClient';

export interface StudentProfile {
  school: string;
  hometown: string;
  excellence_areas: string[];
  military?: boolean;
  first_gen?: boolean;
  pell?: boolean;
  name?: string;
  year?: string;
}

function calculateMatchScore(sch: any, profile: StudentProfile): number {
  let score = 15; // generous base

  const name = (sch["Scholarship Name"] || '').toLowerCase();
  const provider = (sch["Provider/Org"] || '').toLowerCase();
  const tags = (sch["Eligibility Tags"] || '').toLowerCase();
  const why = (sch["Why Obtainable"] || '').toLowerCase();
  const notes = (sch["Notes (for Email Builder Personalization)"] || '').toLowerCase();

  const searchText = `${name} ${provider} ${tags} ${why} ${notes}`;

  // Location first (local = real & attainable)
  if (profile.hometown) {
    const h = profile.hometown.toLowerCase();
    if (searchText.includes(h)) score += 45;
  }
  if (profile.school) {
    const s = profile.school.toLowerCase();
    if (searchText.includes(s)) score += 40;
  }

  // Excellence areas
  profile.excellence_areas.forEach(area => {
    if (area && searchText.includes(area.toLowerCase())) score += 22;
  });

  // Background flags
  if (profile.military && (tags.includes('military') || tags.includes('veteran') || tags.includes('dependent'))) score += 35;
  if (profile.first_gen && (tags.includes('first') || tags.includes('first-gen') || tags.includes('first gen'))) score += 32;
  if (profile.pell && tags.includes('pell')) score += 28;

  // Keyword boosts
  const words = [...profile.excellence_areas, profile.hometown, profile.school]
    .join(' ').toLowerCase().split(/\s+/).filter(w => w.length > 2);
  words.forEach(word => {
    const count = (searchText.match(new RegExp(`\\b${word}\\b`, 'gi')) || []).length;
    score += count * 9;
  });

  return Math.round(score);
}

export async function findScholarships(profile: StudentProfile) {
  console.log('🔍 Starting smart search for profile:', profile);

  const supabase = createSupabaseClient(); // created in browser context

  const { data, error } = await supabase
    .from('scholarships')
    .select('*')
    .limit(80);

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Supabase query failed: ${error.message || JSON.stringify(error)}`);
  }

  if (!data || data.length === 0) {
    console.warn('No data in "scholarships" table. Check table name, RLS policies, or import script.');
    return [];
  }

  const scored = data
    .map((sch: any) => ({ ...sch, match_score: calculateMatchScore(sch, profile) }))
    .sort((a: any, b: any) => b.match_score - a.match_score);

  console.log(`📊 Found ${scored.length} scholarships. Top 6 scores:`);
  scored.slice(0, 6).forEach((s: any) => {
    console.log(`   • ${s["Scholarship Name"]} (${s["Provider/Org"]}) → ${s.match_score}`);
  });

  // Only return scholarships with a real contact person/org — so students can reach out and build relationships
  return scored.filter((s: any) => 
    s["Scholarship Name"] && s["Contact Name / Email / Phone / URL"]
  );
}