// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

// These two lines read from your environment variables (the proper way)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Make sure .env.local AND Vercel settings contain:\n' +
    'NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co\n' +
    'NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);