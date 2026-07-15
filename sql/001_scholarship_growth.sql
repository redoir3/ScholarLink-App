-- LocalLink ethical growth schema
-- Run in Supabase SQL editor (safe to re-run).

-- Research / outreach queue — NOT live awards. Humans contact orgs; only verified facts go into scholarships.
CREATE TABLE IF NOT EXISTS public.scholarship_leads (
  id bigserial PRIMARY KEY,
  org_type text NOT NULL,
  org_name_hint text,
  metro text NOT NULL,
  city text,
  state char(2) NOT NULL,
  county text,
  why_target text,
  suggested_search_terms text,
  outreach_email_template text,
  status text NOT NULL DEFAULT 'open'
    CHECK (status IN ('open', 'contacted', 'responded', 'listed', 'no_award', 'skip')),
  owner text,
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS scholarship_leads_status_idx ON public.scholarship_leads (status);
CREATE INDEX IF NOT EXISTS scholarship_leads_state_idx ON public.scholarship_leads (state);
CREATE INDEX IF NOT EXISTS scholarship_leads_metro_idx ON public.scholarship_leads (metro);

COMMENT ON TABLE public.scholarship_leads IS
  'Outreach research queue. Does not contain scraped scholarship data. Only verified awards go into scholarships.';

-- Optional provenance columns on scholarships (no-op if already present)
ALTER TABLE public.scholarships
  ADD COLUMN IF NOT EXISTS source_url text,
  ADD COLUMN IF NOT EXISTS source_method text,
  ADD COLUMN IF NOT EXISTS verified_by text;

COMMENT ON COLUMN public.scholarships.source_method IS
  'How this row was obtained: org_submission | human_primary_source | partner | public_agency | public_web_scrape';

-- Helpful indexes for matcher / local search
CREATE INDEX IF NOT EXISTS scholarships_state_idx ON public.scholarships (state);
CREATE INDEX IF NOT EXISTS scholarships_city_idx ON public.scholarships (city);
