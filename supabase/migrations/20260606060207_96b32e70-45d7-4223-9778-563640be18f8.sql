
ALTER TABLE public.dating_messages
  ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE public.dating_profiles
  ADD COLUMN IF NOT EXISTS incognito BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS read_receipts_enabled BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX IF NOT EXISTS idx_dating_profiles_incognito ON public.dating_profiles(incognito) WHERE incognito = FALSE;
