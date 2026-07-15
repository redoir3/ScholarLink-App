/**
 * Import HUMAN-CURATED scholarships from CSV.
 * Ethical use only: data must come from org submissions, primary-source research,
 * partners, or public agencies — never from scrapers or third-party DB dumps.
 *
 * Usage:
 *   node scripts/import-curated-csv.js data/imports/my-batch.csv
 *   node scripts/import-curated-csv.js data/imports/my-batch.csv --dry-run
 */
require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const ALLOWED_METHODS = new Set([
  'org_submission',
  'human_primary_source',
  'partner',
  'public_agency',
]);

function parseCsv(text) {
  const rows = [];
  let i = 0;
  let field = '';
  let row = [];
  let inQuotes = false;

  while (i < text.length) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 2;
          continue;
        }
        inQuotes = false;
        i++;
        continue;
      }
      field += c;
      i++;
      continue;
    }
    if (c === '"') {
      inQuotes = true;
      i++;
      continue;
    }
    if (c === ',') {
      row.push(field);
      field = '';
      i++;
      continue;
    }
    if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
      i++;
      continue;
    }
    field += c;
    i++;
  }
  if (field.length || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== '')) rows.push(row);
  }
  return rows;
}

function normalizeHeader(h) {
  return String(h || '')
    .replace(/^\uFEFF/, '')
    .trim();
}

function rowToObject(headers, cells) {
  const obj = {};
  headers.forEach((h, idx) => {
    obj[h] = (cells[idx] ?? '').trim();
  });
  return obj;
}

function isExampleRow(obj) {
  const name = (obj['Scholarship Name'] || '').toLowerCase();
  const org = (obj['Provider/Org'] || '').toLowerCase();
  return name.includes('example ') || org.includes('example ');
}

function validate(obj, lineNo) {
  const errors = [];
  if (!obj['Scholarship Name']) errors.push('missing Scholarship Name');
  if (!obj['Provider/Org']) errors.push('missing Provider/Org');
  if (!obj.state || !/^[A-Za-z]{2}$/.test(obj.state)) errors.push('state must be 2-letter code');
  if (!obj.city) errors.push('missing city (required for local matching)');
  if (!obj['Eligibility Tags'] && !obj.eligibility_tags) errors.push('missing Eligibility Tags');
  const contact =
    obj['Contact Name / Email / Phone / URL'] ||
    obj.contact_email ||
    obj.contact_person ||
    obj['Application Link'];
  if (!contact) errors.push('need contact field or Application Link');
  const method = obj.source_method || 'human_primary_source';
  if (!ALLOWED_METHODS.has(method)) {
    errors.push(`source_method must be one of: ${[...ALLOWED_METHODS].join(', ')}`);
  }
  if (errors.length) {
    return { ok: false, errors: errors.map((e) => `line ${lineNo}: ${e}`) };
  }
  return { ok: true, method };
}

function toDbRow(obj, method) {
  const amountRaw = obj.Amount || obj.amount || '';
  const contactCombined =
    obj['Contact Name / Email / Phone / URL'] ||
    [obj.contact_person, obj.contact_email].filter(Boolean).join(' – ') ||
    obj['Application Link'] ||
    '';

  return {
    'Scholarship Name': obj['Scholarship Name'],
    'Provider/Org': obj['Provider/Org'],
    city: obj.city || null,
    state: (obj.state || '').toUpperCase(),
    Amount: amountRaw || null,
    amount: parseAmount(amountRaw),
    Deadline: obj.Deadline || obj.deadline || null,
    deadline: parseDate(obj.Deadline || obj.deadline),
    'Eligibility Tags': obj['Eligibility Tags'] || obj.eligibility_tags || null,
    eligibility_tags: obj['Eligibility Tags'] || obj.eligibility_tags || null,
    'Contact Name / Email / Phone / URL': contactCombined,
    contact_person: obj.contact_person || null,
    contact_email: obj.contact_email || null,
    contact_url: obj.contact_url || obj['Application Link'] || null,
    'Application Link': obj['Application Link'] || null,
    'Why Obtainable / Relationship Angle':
      obj['Why Obtainable / Relationship Angle'] || obj.why_obtainable || null,
    why_obtainable: obj['Why Obtainable / Relationship Angle'] || obj.why_obtainable || null,
    'Notes (for Email Builder Personalization)':
      obj['Notes (for Email Builder Personalization)'] || obj.notes_for_email || null,
    notes_for_email:
      obj['Notes (for Email Builder Personalization)'] || obj.notes_for_email || null,
    'Last Verified Date': obj['Last Verified Date'] || new Date().toISOString().slice(0, 10),
    source_url: obj.source_url || obj['Application Link'] || null,
    source_method: method,
  };
}

function parseAmount(raw) {
  if (!raw) return null;
  const m = String(raw).replace(/,/g, '').match(/(\d+(\.\d+)?)/);
  return m ? Number(m[1]) : null;
}

function parseDate(raw) {
  if (!raw) return null;
  // Accept ISO dates only for typed deadline column; leave free text in Deadline string
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  return null;
}

async function main() {
  const args = process.argv.slice(2).filter((a) => a !== '--dry-run');
  const dryRun = process.argv.includes('--dry-run');
  const file = args[0];

  if (!file) {
    console.error('Usage: node scripts/import-curated-csv.js <path-to.csv> [--dry-run]');
    process.exit(1);
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
  }

  const abs = path.resolve(file);
  if (!fs.existsSync(abs)) {
    console.error('File not found:', abs);
    process.exit(1);
  }

  const text = fs.readFileSync(abs, 'utf8');
  const table = parseCsv(text);
  if (table.length < 2) {
    console.error('CSV needs a header row and at least one data row.');
    process.exit(1);
  }

  const headers = table[0].map(normalizeHeader);
  const required = ['Scholarship Name', 'Provider/Org', 'city', 'state'];
  for (const r of required) {
    if (!headers.includes(r)) {
      console.error(`CSV missing required column: ${r}`);
      console.error('See data/templates/scholarships-import.csv');
      process.exit(1);
    }
  }

  const prepared = [];
  const allErrors = [];

  for (let r = 1; r < table.length; r++) {
    const obj = rowToObject(headers, table[r]);
    if (isExampleRow(obj)) {
      console.log(`Skipping example row on line ${r + 1}`);
      continue;
    }
    const v = validate(obj, r + 1);
    if (!v.ok) {
      allErrors.push(...v.errors);
      continue;
    }
    prepared.push(toDbRow(obj, v.method));
  }

  if (allErrors.length) {
    console.error('Validation failed:');
    allErrors.forEach((e) => console.error('  •', e));
    process.exit(1);
  }

  if (!prepared.length) {
    console.error('No rows to import (all skipped or empty).');
    process.exit(1);
  }

  console.log(`Ready to import ${prepared.length} curated scholarship(s).${dryRun ? ' (dry-run)' : ''}`);
  prepared.forEach((p, i) => {
    console.log(`  ${i + 1}. ${p['Scholarship Name']} — ${p['Provider/Org']} (${p.city}, ${p.state}) [${p.source_method}]`);
  });

  if (dryRun) {
    console.log('Dry run complete — no database writes.');
    return;
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Upsert by unique name when possible; fall back to insert
  const { data, error } = await supabase
    .from('scholarships')
    .upsert(prepared, { onConflict: 'Scholarship Name' })
    .select('id, "Scholarship Name"');

  if (error) {
    console.error('Import failed:', error.message);
    console.error('If onConflict failed, ensure a unique constraint exists on "Scholarship Name", or insert manually.');
    // Fallback: plain insert
    const ins = await supabase.from('scholarships').insert(prepared).select('id');
    if (ins.error) {
      console.error('Insert fallback also failed:', ins.error.message);
      process.exit(1);
    }
    console.log(`✅ Inserted ${ins.data?.length || prepared.length} row(s) via fallback insert.`);
    return;
  }

  console.log(`✅ Upserted ${data?.length || prepared.length} scholarship(s).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
