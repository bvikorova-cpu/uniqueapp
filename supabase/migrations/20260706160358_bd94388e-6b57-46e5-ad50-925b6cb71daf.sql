CREATE TABLE IF NOT EXISTS public.roadmap_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);

GRANT SELECT ON public.roadmap_votes TO anon;
GRANT SELECT, INSERT, DELETE ON public.roadmap_votes TO authenticated;
GRANT ALL ON public.roadmap_votes TO service_role;

ALTER TABLE public.roadmap_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roadmap votes"
  ON public.roadmap_votes FOR SELECT USING (true);

CREATE POLICY "Users can add their own roadmap vote"
  ON public.roadmap_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own roadmap vote"
  ON public.roadmap_votes FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_roadmap_votes_item ON public.roadmap_votes(item_id);