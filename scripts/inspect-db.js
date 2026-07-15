require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

(async () => {
  const { data, error } = await supabase.from('scholarships').select('*').limit(80);
  if (error) {
    console.error(error);
    process.exit(1);
  }
  let withCity = 0;
  let withState = 0;
  const providers = {};
  const geoHints = {};
  for (const r of data) {
    if (r.city) withCity++;
    if (r.state) withState++;
    const p = r['Provider/Org'] || 'unknown';
    providers[p] = (providers[p] || 0) + 1;
    const tags = `${r['Eligibility Tags'] || ''} ${r['Provider/Org'] || ''}`.toLowerCase();
    for (const s of ['pennsylvania', ' pa', 'harrisburg', 'dauphin', 'cumberland', 'perry', 'philadelphia', 'pittsburgh']) {
      if (tags.includes(s.trim())) geoHints[s.trim()] = (geoHints[s.trim()] || 0) + 1;
    }
  }
  console.log(JSON.stringify({ total: data.length, withCity, withState, geoHints, topProviders: Object.entries(providers).sort((a,b)=>b[1]-a[1]).slice(0,20) }, null, 2));
})();
