/**
 * Seeds scholarship_leads — an OUTREACH QUEUE, not awards.
 * Creates "who to contact in which metro" tasks from public org-type knowledge.
 * Does NOT invent scholarship amounts, deadlines, or scrape the web.
 *
 * Prerequisites: run sql/001_scholarship_growth.sql in Supabase.
 * Usage:
 *   node scripts/seed-research-leads.js
 *   node scripts/seed-research-leads.js --states PA,TX
 *   node scripts/seed-research-leads.js --dry-run
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const seedPath = path.join(__dirname, '..', 'data', 'templates', 'research-leads-seed.json');

function parseStatesArg(argv) {
  const idx = argv.indexOf('--states');
  if (idx === -1) return null;
  return (argv[idx + 1] || '')
    .split(',')
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean);
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const onlyStates = parseStatesArg(process.argv);

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env vars in .env.local');
    process.exit(1);
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
  let metros = seed.metros;
  if (onlyStates?.length) {
    metros = metros.filter((m) => onlyStates.includes(m.state));
  }

  const rows = [];
  for (const metro of metros) {
    for (const org of seed.org_types) {
      const terms = org.suggested_search_terms
        .replaceAll('[city]', metro.city)
        .replaceAll('[state]', metro.state)
        .replaceAll('[county]', metro.county || metro.city);

      rows.push({
        org_type: org.org_type,
        org_name_hint: `${org.org_type} in ${metro.metro}`,
        metro: metro.metro,
        city: metro.city,
        state: metro.state,
        county: metro.county || null,
        why_target: org.why_target,
        suggested_search_terms: terms,
        outreach_email_template: [
          `Subject: Listing your local scholarship for students in ${metro.city}`,
          '',
          `Hello Scholarship Chair,`,
          '',
          `I'm with LocalLink, a free tool that helps students find obtainable local scholarships`,
          `and contact organizers directly. We focus on awards from groups like ${org.org_type}.`,
          '',
          `If your organization in ${metro.city}, ${metro.state} offers a student scholarship,`,
          `may we list the name, eligibility, deadline, amount (if public), application link,`,
          `and a contact person? There is no fee.`,
          '',
          `Thank you for supporting local students.`,
        ].join('\n'),
        status: 'open',
      });
    }
  }

  console.log(`Prepared ${rows.length} research lead(s) across ${metros.length} metro(s).`);
  if (dryRun) {
    console.log('Sample:', rows[0]);
    console.log('Dry run — no writes.');
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Insert in chunks
  const chunkSize = 50;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error, data } = await supabase.from('scholarship_leads').insert(chunk).select('id');
    if (error) {
      console.error('Insert failed:', error.message);
      console.error('Did you run sql/001_scholarship_growth.sql in the Supabase SQL editor?');
      process.exit(1);
    }
    inserted += data?.length || chunk.length;
  }

  console.log(`✅ Seeded ${inserted} research leads (status=open).`);
  console.log('Next: work the queue — contact orgs, then import verified awards via CSV or /submit.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
