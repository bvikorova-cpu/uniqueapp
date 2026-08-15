CREATE TABLE IF NOT EXISTS public.escape_room_scene_cache (
  cache_key text PRIMARY KEY,
  image_url text NOT NULL,
  theme text,
  room_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.escape_room_scene_cache TO anon, authenticated;
GRANT ALL ON public.escape_room_scene_cache TO service_role;

ALTER TABLE public.escape_room_scene_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read cached escape scenes"
ON public.escape_room_scene_cache FOR SELECT USING (true);