// lib/supabaseClient.ts
// Stabilized for Next.js App Router + Vercel. Uses @supabase/ssr (official recommendation).
// Client creation moved inside functions where possible to guarantee browser context.
import { createBrowserClient } from '@supabase/ssr';

export function createSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. In Vercel: Project Settings → Environment Variables → add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY for Production + Preview.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// Kept for any existing imports (still safe in browser bundle)
export const supabase = createSupabaseClient();