/**
 * PA niche scholarship collection → Supabase `scholarships` table.
 *
 * Scope (intentional, counsel-approved approach):
 *  - Pennsylvania first, with emphasis on Pittsburgh + Philadelphia niche sources
 *  - Public primary-source pages only (community foundations, colleges, agencies)
 *  - Same field shape as curated CSV imports
 *  - Does NOT target commercial aggregators (Fastweb, Scholarships.com, etc.)
 *
 * Usage:
 *   npm run scrape:pa
 *   node scripts/scrape-pa-niche.js --dry-run
 *   node scripts/scrape-pa-niche.js --seed-only
 *   node scripts/scrape-pa-niche.js --live-only
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const SEED_PATH = path.join(
  __dirname,
  '..',
  'data',
  'imports',
  'pa-pittsburgh-philadelphia-niche.json'
);

/** Allowlisted public pages we may fetch (primary sources / public agencies). */
const LIVE_SOURCES = [
  {
    id: 'pittsburgh-foundation',
    url: 'https://pittsburghfoundation.org/scholarships',
    city: 'Pittsburgh',
    state: 'PA',
    provider: 'The Pittsburgh Foundation',
    nameHint: 'The Pittsburgh Foundation Scholarships (Common Application)',
    tags: 'Pittsburgh, Allegheny County, Western PA, local, community foundation',
    why: 'Primary Pittsburgh community foundation portal with many niche donor funds.',
  },
  {
    id: 'philadelphia-foundation',
    url: 'https://www.philafound.org/students/apply-for-a-scholarship/',
    city: 'Philadelphia',
    state: 'PA',
    provider: 'Philadelphia Foundation',
    nameHint: 'Philadelphia Foundation Common Scholarship Application',
    tags: 'Philadelphia, Greater Philly, local, community foundation, need-based',
    why: 'Common app for many Greater Philadelphia donor-advised scholarship funds.',
  },
  {
    id: 'tfec',
    url: 'https://www.tfec.org/scholarships/',
    city: 'Harrisburg',
    state: 'PA',
    provider: 'The Foundation for Enhancing Communities (TFEC)',
    nameHint: 'TFEC Central PA Scholarship Funds (multi-fund portal)',
    tags: 'Harrisburg, Dauphin, Cumberland, Perry, Central PA, local',
    why: 'Central PA multi-fund scholarship portal.',
  },
  {
    id: 'pheaa-state-grant',
    url: 'https://www.pheaa.org/funding-opportunities/state-grant-program/',
    city: 'Harrisburg',
    state: 'PA',
    provider: 'Pennsylvania Higher Education Assistance Agency (PHEAA)',
    nameHint: 'PHEAA PA State Grant Program',
    tags: 'Pennsylvania, PA resident, need-based, state grant, PHEAA',
    why: 'Official PA state grant program — public agency source.',
  },
  {
    id: 'chescocf',
    url: 'https://chescocf.org/receive/apply-for-scholarships/',
    city: 'West Chester',
    state: 'PA',
    provider: 'Chester County Community Foundation',
    nameHint: 'Chester County Community Foundation Scholarships',
    tags: 'Chester County, Philadelphia suburbs, local',
    why: 'County foundation awards for Chester County students.',
  },
  {
    id: 'delco',
    url: 'https://delcofoundation.org/',
    city: 'Media',
    state: 'PA',
    provider: 'Foundation for Delaware County',
    nameHint: 'Foundation for Delaware County Scholarships',
    tags: 'Delaware County, Delco, Philadelphia suburbs, local',
    why: 'Delaware County community foundation scholarship programs.',
  },
];

const ALLOWED_METHODS = new Set([
  'org_submission',
  'human_primary_source',
  'partner',
  'public_agency',
  'public_web_scrape',
]);

function stripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function extractTitle(html) {
  const m = String(html).match(/<title[^>]*>([^<]+)<\/title>/i);
  return m ? m[1].replace(/\s+/g, ' ').trim() : '';
}

function parseAmountFromText(text) {
  const m = text.match(/\$\s?[\d,]+(?:\s*[-–]\s*\$?\s?[\d,]+)?/);
  return m ? m[0].replace(/\s+/g, '') : null;
}

async function fetchSource(src) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(src.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'LocalLinkBot/1.0 (+https://locallink.app; scholarship research; contact admin)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    if (!res.ok) {
      return { ok: false, error: `HTTP ${res.status}`, src };
    }
    const html = await res.text();
    const text = stripHtml(html).slice(0, 4000);
    const pageTitle = extractTitle(html);
    const amount = parseAmountFromText(text);
    const today = new Date().toISOString().slice(0, 10);

    const method = src.provider.includes('PHEAA') ? 'public_agency' : 'public_web_scrape';
    const notes = pageTitle
      ? `Official page title observed: ${pageTitle}. Confirm current deadline before applying. [source: ${method}]`
      : `Confirm current deadline and eligibility on the official page before applying. [source: ${method}]`;
    const row = {
      'Scholarship Name': src.nameHint,
      'Provider/Org': src.provider,
      city: src.city,
      state: src.state,
      Amount: amount || 'Varies — see official page',
      amount: amount ? Number(String(amount).replace(/[^0-9.]/g, '')) || null : null,
      Deadline: 'See official page',
      deadline: null,
      'Eligibility Tags': src.tags,
      eligibility_tags: src.tags,
      'Contact Name / Email / Phone / URL': `${src.provider} – ${src.url}`,
      contact_person: null,
      contact_email: null,
      contact_url: src.url,
      'Application Link': src.url,
      'Why Obtainable / Relationship Angle': src.why,
      why_obtainable: src.why,
      'Notes (for Email Builder Personalization)': notes,
      notes_for_email: notes,
      'Last Verified Date': today,
      _scrape_meta: {
        source_id: src.id,
        http_status: res.status,
        page_title: pageTitle,
        fetched_at: new Date().toISOString(),
        snippet: text.slice(0, 280),
        source_method: method,
      },
    };
    return { ok: true, row, src };
  } catch (e) {
    return { ok: false, error: e.message || String(e), src };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Map to columns that currently exist on public.scholarships.
 * Provenance columns source_url / source_method are optional (sql/001) —
 * Application Link + contact_url carry the official URL either way.
 */
function seedToDbRow(obj) {
  const method = obj.source_method || 'public_web_scrape';
  if (!ALLOWED_METHODS.has(method)) {
    throw new Error(`Invalid source_method for ${obj['Scholarship Name']}: ${method}`);
  }
  const amountRaw = obj.Amount || obj.amount || '';
  const contactCombined =
    obj['Contact Name / Email / Phone / URL'] ||
    [obj.contact_person, obj.contact_email].filter(Boolean).join(' – ') ||
    obj['Application Link'] ||
    '';

  let amountNum = null;
  if (amountRaw) {
    const m = String(amountRaw).replace(/,/g, '').match(/(\d+(\.\d+)?)/);
    if (m) amountNum = Number(m[1]);
  }

  const applyUrl = obj['Application Link'] || obj.contact_url || obj.source_url || null;
  const notesBase =
    obj['Notes (for Email Builder Personalization)'] || obj.notes_for_email || '';
  const notesWithMethod = notesBase
    ? `${notesBase} [source: ${method}]`
    : `Confirm details on official page. [source: ${method}]`;

  return {
    'Scholarship Name': obj['Scholarship Name'],
    'Provider/Org': obj['Provider/Org'],
    city: obj.city || null,
    state: (obj.state || 'PA').toUpperCase(),
    Amount: amountRaw || null,
    amount: amountNum,
    Deadline: obj.Deadline || obj.deadline || null,
    deadline: /^\d{4}-\d{2}-\d{2}$/.test(obj.Deadline || '') ? obj.Deadline : null,
    'Eligibility Tags': obj['Eligibility Tags'] || null,
    eligibility_tags: obj['Eligibility Tags'] || null,
    'Contact Name / Email / Phone / URL': contactCombined,
    contact_person: obj.contact_person || null,
    contact_email: obj.contact_email || null,
    contact_url: applyUrl,
    'Application Link': applyUrl,
    'Why Obtainable / Relationship Angle':
      obj['Why Obtainable / Relationship Angle'] || obj.why_obtainable || null,
    why_obtainable: obj['Why Obtainable / Relationship Angle'] || obj.why_obtainable || null,
    'Notes (for Email Builder Personalization)': notesWithMethod,
    notes_for_email: notesWithMethod,
    'Last Verified Date': obj['Last Verified Date'] || new Date().toISOString().slice(0, 10),
  };
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const seedOnly = process.argv.includes('--seed-only');
  const liveOnly = process.argv.includes('--live-only');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const prepared = [];
  const fetchLog = [];

  if (!liveOnly) {
    if (!fs.existsSync(SEED_PATH)) {
      console.error('Seed file missing:', SEED_PATH);
      process.exit(1);
    }
    const seed = JSON.parse(fs.readFileSync(SEED_PATH, 'utf8'));
    for (const item of seed) {
      prepared.push(seedToDbRow(item));
    }
    console.log(`Loaded ${seed.length} PA niche seed row(s) from JSON.`);
  }

  if (!seedOnly) {
    console.log(`Fetching ${LIVE_SOURCES.length} allowlisted public source(s)…`);
    for (const src of LIVE_SOURCES) {
      const result = await fetchSource(src);
      if (!result.ok) {
        console.warn(`  ✗ ${src.id}: ${result.error}`);
        fetchLog.push({ id: src.id, ok: false, error: result.error });
      } else {
        console.log(`  ✓ ${src.id}: ${result.row['Scholarship Name']}`);
        fetchLog.push({
          id: src.id,
          ok: true,
          title: result.row._scrape_meta?.page_title,
        });
        const { _scrape_meta, ...row } = result.row;
        // Live fetch overwrites seed row with same name when present
        const idx = prepared.findIndex((p) => p['Scholarship Name'] === row['Scholarship Name']);
        if (idx >= 0) prepared[idx] = row;
        else prepared.push(row);
      }
      // Be polite — rate limit
      await sleep(800);
    }
  }

  // Dedupe by scholarship name
  const byName = new Map();
  for (const row of prepared) {
    byName.set(row['Scholarship Name'], row);
  }
  const unique = [...byName.values()];

  console.log(`\nReady to upsert ${unique.length} PA scholarship row(s).${dryRun ? ' (dry-run)' : ''}`);
  unique.forEach((r, i) => {
    console.log(
      `  ${i + 1}. ${r['Scholarship Name']} — ${r['Provider/Org']} (${r.city}, ${r.state}) → ${r['Application Link'] || 'no link'}`
    );
  });

  if (dryRun) {
    console.log('\nDry run complete — no database writes.');
    console.log('Fetch log:', JSON.stringify(fetchLog, null, 2));
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase
    .from('scholarships')
    .upsert(unique, { onConflict: 'Scholarship Name' })
    .select('id, "Scholarship Name"');

  if (error) {
    console.warn('Upsert with onConflict failed, trying plain insert fallback…', error.message);
    const ins = await supabase.from('scholarships').insert(unique).select('id');
    if (ins.error) {
      console.error('Insert also failed:', ins.error.message);
      process.exit(1);
    }
    console.log(`✅ Inserted ${ins.data?.length || unique.length} row(s).`);
    return;
  }

  console.log(`✅ Upserted ${data?.length || unique.length} PA niche scholarship(s) into Supabase.`);
  console.log('Fetch log summary:', fetchLog.filter((f) => f.ok).length, 'ok /', fetchLog.length, 'attempted');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
