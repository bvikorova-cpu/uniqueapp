ALTER TABLE public.musician_profiles
  ADD COLUMN IF NOT EXISTS representation_role TEXT,
  ADD COLUMN IF NOT EXISTS legal_signatory_name TEXT,
  ADD COLUMN IF NOT EXISTS legal_declaration_accepted_at TIMESTAMPTZ;