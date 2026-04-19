
ALTER TABLE public.story_highlights
  ADD COLUMN IF NOT EXISTS cover_url TEXT,
  ADD COLUMN IF NOT EXISTS image_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS order_index INT DEFAULT 0;
UPDATE public.story_highlights SET cover_url = cover_image WHERE cover_url IS NULL AND cover_image IS NOT NULL;
