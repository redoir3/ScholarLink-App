// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("DEBUG - Supabase URL exists?", !!supabaseUrl);
console.log("DEBUG - Supabase ANON_KEY exists?", !!supabaseAnonKey);
console.log("DEBUG - Actual URL value:", supabaseUrl ? supabaseUrl.substring(0, 30) + "..." : "MISSING");

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Make sure .env.local AND Vercel settings contain:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://vlkwlfauexrxmqwqfgpc.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);