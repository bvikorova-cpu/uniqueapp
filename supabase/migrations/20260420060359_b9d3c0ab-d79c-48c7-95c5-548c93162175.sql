
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cover_url text,
  ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS skills jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS languages text[] DEFAULT ARRAY[]::text[],
  ADD COLUMN IF NOT EXISTS accent_color text,
  ADD COLUMN IF NOT EXISTS profile_theme text DEFAULT 'default',
  ADD COLUMN IF NOT EXISTS field_visibility jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS headline text;
