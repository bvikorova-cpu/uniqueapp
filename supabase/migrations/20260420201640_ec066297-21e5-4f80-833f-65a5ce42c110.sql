
CREATE TABLE public.rewarded_ad_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  section_key TEXT NOT NULL,
  xp_awarded INTEGER NOT NULL DEFAULT 5,
  view_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_rewarded_ad_views_lookup ON public.rewarded_ad_views(user_id, section_key, view_date);

ALTER TABLE public.rewarded_ad_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own rewarded ad views"
  ON public.rewarded_ad_views FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own rewarded ad views"
  ON public.rewarded_ad_views FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
