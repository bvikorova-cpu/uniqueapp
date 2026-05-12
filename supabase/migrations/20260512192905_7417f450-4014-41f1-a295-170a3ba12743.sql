
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS open_to_work boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS open_to_work_details jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_music_url text,
  ADD COLUMN IF NOT EXISTS profile_music_title text,
  ADD COLUMN IF NOT EXISTS bio_score integer,
  ADD COLUMN IF NOT EXISTS bio_score_feedback text,
  ADD COLUMN IF NOT EXISTS bio_score_updated_at timestamptz,
  ADD COLUMN IF NOT EXISTS bio_variants jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bio_translations jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text;
