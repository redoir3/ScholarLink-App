-- Profiles, saved scholarships, RLS
-- Run in Supabase SQL editor.

-- User profiles (role from app metadata + this table)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  role text NOT NULL DEFAULT 'student'
    CHECK (role IN ('student', 'organization', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- NOTE: Do NOT query profiles inside a profiles policy (infinite recursion → HTTP 500).
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Saved scholarships (students)
CREATE TABLE IF NOT EXISTS public.saved_scholarships (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_id text,
  scholarship_name text NOT NULL,
  scholarship_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, scholarship_name)
);

CREATE INDEX IF NOT EXISTS saved_scholarships_user_idx ON public.saved_scholarships (user_id);

ALTER TABLE public.saved_scholarships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "saved_select_own" ON public.saved_scholarships;
CREATE POLICY "saved_select_own" ON public.saved_scholarships
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_insert_own" ON public.saved_scholarships;
CREATE POLICY "saved_insert_own" ON public.saved_scholarships
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_delete_own" ON public.saved_scholarships;
CREATE POLICY "saved_delete_own" ON public.saved_scholarships
  FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "saved_update_own" ON public.saved_scholarships;
CREATE POLICY "saved_update_own" ON public.saved_scholarships
  FOR UPDATE USING (auth.uid() = user_id);
