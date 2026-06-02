// scripts/import-scholarships.js
require('dotenv').config({ path: '.env.local' });

console.log('=== ENV DEBUG ===');
console.log('URL exists?', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('KEY exists?', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('KEY length:', process.env.SUPABASE_SERVICE_ROLE_KEY ? process.env.SUPABASE_SERVICE_ROLE_KEY.length : 0);
console.log('================');

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Still missing one or both keys');
  process.exit(1);
}

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function importScholarships() {
  console.log('🚀 Starting import...');

  const sampleData = [{
    "Scholarship Name": "Glenshaw Community Scholarship",
    "Provider/Org": "Glenshaw Rotary Club",
    "state": "PA",
    "amount": 2000,
    "deadline": "2026-06-15",
    "eligibility_tags": "Local, PA, High School Senior",
    "why_obtainable": "Open to students from Glenshaw area",
    "notes_for_email": "They value personal stories and building real relationships",
    "contact_person": "Sarah Thompson",
    "contact_email": "scholarships@glenshawrotary.org",
  }];

  const { error } = await supabase
    .from('scholarships')
    .upsert(sampleData, { onConflict: 'Scholarship Name' });

  if (error) console.error('Import failed:', error);
  else console.log('✅ Import successful!');
}

importScholarships().catch(console.error);