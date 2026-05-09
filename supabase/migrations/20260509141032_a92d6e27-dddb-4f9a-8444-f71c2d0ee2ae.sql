CREATE TABLE IF NOT EXISTS public.bazaar_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.bazaar_items(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, item_id)
);
CREATE INDEX IF NOT EXISTS idx_bazaar_favorites_user ON public.bazaar_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_bazaar_favorites_item ON public.bazaar_favorites(item_id);

ALTER TABLE public.bazaar_favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User views own favorites"
  ON public.bazaar_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "User adds own favorites"
  ON public.bazaar_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User removes own favorites"
  ON public.bazaar_favorites FOR DELETE USING (auth.uid() = user_id);