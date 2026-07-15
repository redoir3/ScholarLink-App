/**
 * Match a student's network (companies / people / orgs from LinkedIn export or manual entry)
 * against scholarships in our database. No LinkedIn scraping — only data the student provides.
 */

export type NetworkEntity = {
  name: string;
  company?: string;
  title?: string;
  source: 'linkedin_csv' | 'manual' | 'linkedin_profile';
};

export type NetworkMatch = {
  scholarship: Record<string, unknown>;
  score: number;
  reasons: string[];
  matchedOn: string[];
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^\w\s&./-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Strip common legal suffixes for looser company matching */
function coreOrgName(s: string): string {
  return normalize(s)
    .replace(
      /\b(inc|llc|ltd|corp|corporation|company|co|foundation|fund|scholarship|club|post|branch|chapter|association|society|auxiliary|trust|of)\b/g,
      ' '
    )
    .replace(/\s+/g, ' ')
    .trim();
}

function significantTokens(s: string): string[] {
  return coreOrgName(s)
    .split(' ')
    .filter((t) => t.length > 2);
}

function scholarshipSearchBlob(sch: Record<string, unknown>): string {
  return [
    sch['Scholarship Name'],
    sch['Provider/Org'],
    sch['Eligibility Tags'],
    sch.eligibility_tags,
    sch['Contact Name / Email / Phone / URL'],
    sch.contact_person,
    sch.contact_email,
    sch['Why Obtainable / Relationship Angle'],
    sch.why_obtainable,
    sch['Application Link'],
    sch.city,
    sch.state,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

export function scoreNetworkAgainstScholarship(
  entities: NetworkEntity[],
  sch: Record<string, unknown>
): NetworkMatch | null {
  const provider = String(sch['Provider/Org'] || '');
  const contact = String(
    sch.contact_person || sch['Contact Name / Email / Phone / URL'] || ''
  );
  const blob = scholarshipSearchBlob(sch);
  const providerCore = coreOrgName(provider);

  let score = 0;
  const reasons: string[] = [];
  const matchedOn: string[] = [];

  for (const entity of entities) {
    const person = normalize(entity.name);
    const company = normalize(entity.company || '');
    const companyCore = coreOrgName(entity.company || '');
    const personTokens = person.split(' ').filter((t) => t.length > 2);

    // Company ↔ provider org
    if (companyCore && providerCore) {
      if (companyCore === providerCore || providerCore.includes(companyCore) || companyCore.includes(providerCore)) {
        score += 55;
        reasons.push(`Your network includes ${entity.company}, which matches the awarding organization.`);
        matchedOn.push(entity.company || entity.name);
      } else {
        const cTokens = significantTokens(entity.company || '');
        const pTokens = significantTokens(provider);
        const overlap = cTokens.filter((t) => pTokens.includes(t));
        if (overlap.length >= 2 || (overlap.length === 1 && overlap[0].length > 5)) {
          score += 35;
          reasons.push(
            `Company “${entity.company}” shares keywords with provider “${provider}”.`
          );
          matchedOn.push(entity.company || entity.name);
        }
      }
    }

    // Company mentioned anywhere in scholarship text
    if (company && company.length > 3 && blob.includes(company)) {
      score += 25;
      if (!matchedOn.includes(entity.company || '')) {
        reasons.push(`“${entity.company}” appears in this scholarship’s details.`);
        matchedOn.push(entity.company || entity.name);
      }
    }

    // Person name vs contact person (full name or last name if distinctive)
    if (personTokens.length >= 2) {
      const full = personTokens.join(' ');
      if (blob.includes(full) || normalize(contact).includes(full)) {
        score += 70;
        reasons.push(
          `${entity.name} may be listed as a contact or related to this award — a warm intro opportunity.`
        );
        matchedOn.push(entity.name);
      } else {
        const last = personTokens[personTokens.length - 1];
        if (last.length > 4 && normalize(contact).includes(last)) {
          score += 30;
          reasons.push(
            `Contact name may relate to ${entity.name} (shared last name) — verify before outreach.`
          );
          matchedOn.push(entity.name);
        }
      }
    }
  }

  if (score < 25) return null;

  return {
    scholarship: sch,
    score: Math.min(99, score),
    reasons: [...new Set(reasons)].slice(0, 3),
    matchedOn: [...new Set(matchedOn)].slice(0, 5),
  };
}

export function matchNetworkToScholarships(
  entities: NetworkEntity[],
  scholarships: Record<string, unknown>[]
): NetworkMatch[] {
  if (!entities.length) return [];

  return scholarships
    .map((sch) => scoreNetworkAgainstScholarship(entities, sch))
    .filter((m): m is NetworkMatch => m != null)
    .sort((a, b) => b.score - a.score);
}

/**
 * Parse LinkedIn "Connections.csv" export (user-downloaded from LinkedIn settings).
 * Typical headers: First Name, Last Name, Email Address, Company, Position, Connected On
 */
export function parseLinkedInConnectionsCsv(text: string): NetworkEntity[] {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  // LinkedIn sometimes puts notes in the first lines — find header row
  let headerIdx = 0;
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    if (/first name/i.test(lines[i]) && /last name/i.test(lines[i])) {
      headerIdx = i;
      break;
    }
  }

  const headers = splitCsvLine(lines[headerIdx]).map((h) => h.trim().toLowerCase());
  const idx = (names: string[]) => headers.findIndex((h) => names.some((n) => h === n || h.includes(n)));

  const firstI = idx(['first name']);
  const lastI = idx(['last name']);
  const companyI = idx(['company']);
  const positionI = idx(['position', 'title']);

  const entities: NetworkEntity[] = [];
  for (let i = headerIdx + 1; i < lines.length; i++) {
    const cols = splitCsvLine(lines[i]);
    const first = firstI >= 0 ? cols[firstI]?.trim() : '';
    const last = lastI >= 0 ? cols[lastI]?.trim() : '';
    const company = companyI >= 0 ? cols[companyI]?.trim() : '';
    const title = positionI >= 0 ? cols[positionI]?.trim() : '';
    const name = [first, last].filter(Boolean).join(' ');
    if (!name && !company) continue;
    entities.push({
      name: name || company,
      company: company || undefined,
      title: title || undefined,
      source: 'linkedin_csv',
    });
  }
  return entities;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (q) {
      if (c === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else q = false;
      } else cur += c;
    } else if (c === '"') q = true;
    else if (c === ',') {
      out.push(cur);
      cur = '';
    } else cur += c;
  }
  out.push(cur);
  return out;
}

export function parseManualNetworkInput(text: string): NetworkEntity[] {
  return text
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .map((entry) => {
      // "Jane Doe @ Rotary Club of Dallas" or "Acme Law Firm"
      const at = entry.match(/^(.+?)\s+@\s+(.+)$/);
      if (at) {
        return {
          name: at[1].trim(),
          company: at[2].trim(),
          source: 'manual' as const,
        };
      }
      return {
        name: entry,
        company: entry,
        source: 'manual' as const,
      };
    });
}
