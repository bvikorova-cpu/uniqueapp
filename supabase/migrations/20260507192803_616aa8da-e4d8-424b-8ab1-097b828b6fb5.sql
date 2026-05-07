CREATE TABLE public.stock_editors_picks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_item_id UUID NOT NULL REFERENCES public.stock_content_items(id) ON DELETE CASCADE,
  week_start DATE NOT NULL DEFAULT date_trunc('week', now())::date,
  position INT NOT NULL DEFAULT 0,
  editor_note TEXT,
  featured_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(content_item_id, week_start)
);

ALTER TABLE public.stock_editors_picks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view editor picks"
ON public.stock_editors_picks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can insert editor picks"
ON public.stock_editors_picks FOR INSERT TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update editor picks"
ON public.stock_editors_picks FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete editor picks"
ON public.stock_editors_picks FOR DELETE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_editors_picks_week ON public.stock_editors_picks(week_start DESC, position ASC);

CREATE TRIGGER update_stock_editors_picks_updated_at
BEFORE UPDATE ON public.stock_editors_picks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();