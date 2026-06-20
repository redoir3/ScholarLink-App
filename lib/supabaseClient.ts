// lib/supabaseClient.ts — Hybrid for compatibility + stability
import { createBrowserClient } from '@supabase/ssr';

let supabaseInstance: any = null;

export function createSupabaseClient() {
  if (!supabaseInstance) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error('Missing Supabase env vars — check Vercel settings.');
    supabaseInstance = createBrowserClient(url, key);
  }
  return supabaseInstance;
}

// For files importing { supabase } (e.g. SavedScholarships)
export const supabase = {
  from: (...args: any[]) => createSupabaseClient().from(...args),
  // Proxy other common methods if needed, or just use creator in new code
};