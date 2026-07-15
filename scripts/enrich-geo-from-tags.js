/**
 * Fills missing city/state on EXISTING scholarships using text already in your DB
 * (Eligibility Tags, Provider, Why Obtainable, etc.). Does not call the web.
 *
 * Usage:
 *   node scripts/enrich-geo-from-tags.js --dry-run
 *   node scripts/enrich-geo-from-tags.js
 */
require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

/** Conservative maps from phrases already common in LocalLink data → geo */
const CITY_HINTS = [
  { re: /\bphiladelphia\b/i, city: 'Philadelphia', state: 'PA' },
  { re: /\bphilly\b/i, city: 'Philadelphia', state: 'PA' },
  { re: /\bharrisburg\b/i, city: 'Harrisburg', state: 'PA' },
  { re: /\bpittsburgh\b/i, city: 'Pittsburgh', state: 'PA' },
  { re: /\bglenshaw\b/i, city: 'Glenshaw', state: 'PA' },
  { re: /\bchester county\b/i, city: 'West Chester', state: 'PA' },
  { re: /\bdelaware county\b/i, city: 'Media', state: 'PA' },
  { re: /\bmontgomery county\b/i, city: 'Norristown', state: 'PA' },
  { re: /\bbucks county\b/i, city: 'Doylestown', state: 'PA' },
  { re: /\bdauphin\b/i, city: 'Harrisburg', state: 'PA' },
  { re: /\bcumberland\b/i, city: 'Carlisle', state: 'PA' },
  { re: /\bperry county\b/i, city: 'New Bloomfield', state: 'PA' },
  { re: /\btemple\b/i, city: 'Philadelphia', state: 'PA' },
];

const STATE_HINTS = [
  { re: /\bpennsylvania\b|\bPA\b|, PA\b| PA,/i, state: 'PA' },
  { re: /\bnew jersey\b|\bNJ\b|, NJ\b/i, state: 'NJ' },
  { re: /\bdelaware\b(?! county)|\bDE\b|, DE\b/i, state: 'DE' },
  { re: /\bmaryland\b|\bMD\b|, MD\b/i, state: 'MD' },
  { re: /\bnew york\b|\bNY\b|, NY\b/i, state: 'NY' },
  { re: /\bohio\b|\bOH\b|, OH\b/i, state: 'OH' },
  { re: /\btexas\b|\bTX\b|, TX\b/i, state: 'TX' },
];

function inferGeo(row) {
  const blob = [
    row['Scholarship Name'],
    row['Provider/Org'],
    row['Eligibility Tags'],
    row.eligibility_tags,
    row['Why Obtainable / Relationship Angle'],
    row.why_obtainable,
    row['Contact Name / Email / Phone / URL'],
    row['Application Link'],
  ]
    .filter(Boolean)
    .join(' | ');

  let city = row.city || null;
  let state = row.state || null;

  for (const h of CITY_HINTS) {
    if (h.re.test(blob)) {
      if (!city) city = h.city;
      if (!state) state = h.state;
      break;
    }
  }

  if (!state) {
    for (const h of STATE_HINTS) {
      if (h.re.test(blob)) {
        state = h.state;
        break;
      }
    }
  }

  return { city, state };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase.from('scholarships').select('*');
  if (error) {
    console.error(error);
    process.exit(1);
  }

  let updated = 0;
  let skipped = 0;

  for (const row of data) {
    const needsCity = !row.city;
    const needsState = !row.state;
    if (!needsCity && !needsState) {
      skipped++;
      continue;
    }

    const inferred = inferGeo(row);
    const patch = {};
    if (needsCity && inferred.city) patch.city = inferred.city;
    if (needsState && inferred.state) patch.state = inferred.state;

    if (!Object.keys(patch).length) {
      skipped++;
      continue;
    }

    console.log(
      `#${row.id} ${row['Scholarship Name']}: set`,
      patch
    );

    if (!dryRun) {
      const { error: upErr } = await supabase.from('scholarships').update(patch).eq('id', row.id);
      if (upErr) {
        console.error('Failed id', row.id, upErr.message);
        continue;
      }
    }
    updated++;
  }

  console.log(
    `${dryRun ? '[dry-run] ' : ''}Would update/updated ${updated} row(s); left unchanged ${skipped}.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
