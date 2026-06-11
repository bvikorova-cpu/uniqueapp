
CREATE TABLE public.favorite_sections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  path TEXT NOT NULL,
  title TEXT,
  category TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, path)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.favorite_sections TO authenticated;
GRANT ALL ON public.favorite_sections TO service_role;
ALTER TABLE public.favorite_sections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorite sections"
  ON public.favorite_sections FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_favorite_sections_user ON public.favorite_sections(user_id, position);
