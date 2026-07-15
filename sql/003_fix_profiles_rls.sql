-- Fix recursive RLS on profiles that causes HTTP 500 on SELECT.
-- Paste into Supabase SQL Editor and Run.

-- Drop the recursive policy
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- Simple non-recursive select: users only see their own row
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Optional: service role / admin can use dashboard; app roles use JWT metadata
-- Do NOT reference public.profiles inside a profiles policy (infinite recursion).
