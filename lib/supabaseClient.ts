// Single browser Supabase client — avoid multiple GoTrueClient instances
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export function createSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    // Server: always create a fresh lightweight client (no shared browser storage)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('Missing Supabase env vars — check .env.local / Vercel settings.');
    }
    return createBrowserClient(url, key);
  }

  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    throw new Error('Missing Supabase env vars — check .env.local / Vercel settings.');
  }

  supabaseInstance = createBrowserClient(url, key);
  return supabaseInstance;
}

export function getSupabase() {
  return createSupabaseClient();
}

/**
 * Named export for legacy code: `import { supabase } from '...'`
 * Must expose `.auth` correctly (plain object, not a broken Proxy).
 */
export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop: string | symbol) {
    const client = createSupabaseClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
