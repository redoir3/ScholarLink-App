// Re-export singleton — do not create a second GoTrueClient
export { createSupabaseClient as createClient, createSupabaseClient, supabase } from '@/lib/supabaseClient';
