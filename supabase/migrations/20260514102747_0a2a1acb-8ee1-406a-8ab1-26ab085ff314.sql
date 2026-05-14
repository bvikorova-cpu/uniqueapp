-- Phase 9: background-style text posts + memories widget support
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS background_style text;

COMMENT ON COLUMN public.posts.background_style IS 'Optional preset key for colored text posts (e.g. gradient-purple, solid-rose). Renders as full-bleed text card when no media is attached.';

-- Index for "On This Day" memories lookup
CREATE INDEX IF NOT EXISTS idx_posts_user_created_doy
  ON public.posts (user_id, created_at);

-- RPC: posts from same calendar day in previous years for the given user
CREATE OR REPLACE FUNCTION public.get_post_memories(_user_id uuid, _limit int DEFAULT 10)
RETURNS SETOF public.posts
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT *
  FROM public.posts
  WHERE user_id = _user_id
    AND created_at < date_trunc('day', now())
    AND extract(month from created_at) = extract(month from now())
    AND extract(day   from created_at) = extract(day   from now())
  ORDER BY created_at DESC
  LIMIT _limit;
$$;