import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const createSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseAnonKey)
}

// For convenience in server components if needed later
export const supabase = createSupabaseClient()