ALTER TABLE public.ai_public_profiles
  ADD COLUMN IF NOT EXISTS watermark_enabled boolean NOT NULL DEFAULT true;