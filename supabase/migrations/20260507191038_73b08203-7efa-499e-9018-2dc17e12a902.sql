CREATE TABLE public.stock_lightboxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  cover_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE public.stock_lightbox_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lightbox_id UUID NOT NULL REFERENCES public.stock_lightboxes(id) ON DELETE CASCADE,
  content_item_id UUID NOT NULL REFERENCES public.stock_content_items(id) ON DELETE CASCADE,
  notes TEXT,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(lightbox_id, content_item_id)
);

ALTER TABLE public.stock_lightboxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_lightbox_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own lightboxes" ON public.stock_lightboxes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public lightboxes viewable" ON public.stock_lightboxes
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users manage items in own lightboxes" ON public.stock_lightbox_items
  FOR ALL USING (EXISTS (SELECT 1 FROM public.stock_lightboxes l WHERE l.id = lightbox_id AND l.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.stock_lightboxes l WHERE l.id = lightbox_id AND l.user_id = auth.uid()));

CREATE POLICY "Items in public lightboxes viewable" ON public.stock_lightbox_items
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.stock_lightboxes l WHERE l.id = lightbox_id AND l.is_public = true));

CREATE INDEX idx_stock_lightboxes_user ON public.stock_lightboxes(user_id);
CREATE INDEX idx_stock_lightbox_items_lb ON public.stock_lightbox_items(lightbox_id);
CREATE INDEX idx_stock_lightbox_items_ci ON public.stock_lightbox_items(content_item_id);

CREATE TRIGGER update_stock_lightboxes_updated_at
  BEFORE UPDATE ON public.stock_lightboxes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();