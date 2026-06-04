// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("🚨 Missing Supabase env vars during build or runtime");
    // Return dummy for build safety
    return {
      from: () => ({
        select: () => Promise.resolve({ data: [], error: null }),
      }),
    } as any;
  }

  return createClient(supabaseUrl, supabaseAnonKey);
};

export const supabase = getSupabase();