ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS music_url text,
  ADD COLUMN IF NOT EXISTS music_start_seconds integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS music_end_seconds integer;