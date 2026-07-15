// Re-export singleton only — never create a second GoTrueClient
export { createSupabaseClient as createClient, createSupabaseClient, supabase } from '@/lib/supabaseClient';
