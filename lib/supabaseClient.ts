// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("🚨 Missing Supabase env vars");
  // For local development fallback
  throw new Error('Missing Supabase environment variables. Check Vercel settings.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);