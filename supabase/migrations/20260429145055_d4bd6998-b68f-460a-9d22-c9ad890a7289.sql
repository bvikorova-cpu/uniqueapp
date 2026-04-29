
-- Gallery favorites (Magic Library) — generic favorites by item type
CREATE TABLE IF NOT EXISTS public.kids_gallery_favorites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  item_id TEXT NOT NULL,
  item_type TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_id, item_type)
);
ALTER TABLE public.kids_gallery_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own gallery favorites select" ON public.kids_gallery_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own gallery favorites insert" ON public.kids_gallery_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own gallery favorites delete" ON public.kids_gallery_favorites FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_kgf_user ON public.kids_gallery_favorites(user_id);

-- Bedtime progress: visited stories, ratings, streak
CREATE TABLE IF NOT EXISTS public.kids_bedtime_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  story_id TEXT NOT NULL,
  rating INTEGER DEFAULT 0,
  listened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);
ALTER TABLE public.kids_bedtime_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own bedtime select" ON public.kids_bedtime_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own bedtime insert" ON public.kids_bedtime_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own bedtime update" ON public.kids_bedtime_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_kbp_user ON public.kids_bedtime_progress(user_id);
