
-- Sprint 3

-- 1) Seasonal hubs
CREATE TABLE public.coupon_seasonal_hubs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  banner_url TEXT,
  accent_color TEXT DEFAULT '#8b5cf6',
  active_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  active_to TIMESTAMPTZ,
  coupon_ids UUID[] NOT NULL DEFAULT '{}',
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_seasonal_hubs_active ON public.coupon_seasonal_hubs(active_from, active_to);
ALTER TABLE public.coupon_seasonal_hubs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone reads active hubs"
  ON public.coupon_seasonal_hubs FOR SELECT TO authenticated, anon
  USING (active_from <= now() AND (active_to IS NULL OR active_to > now()));
CREATE POLICY "admins manage hubs ins" ON public.coupon_seasonal_hubs FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins manage hubs upd" ON public.coupon_seasonal_hubs FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "admins manage hubs del" ON public.coupon_seasonal_hubs FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Compare sessions (per-user, max 4 ids)
CREATE TABLE public.coupon_compare_sessions (
  user_id UUID PRIMARY KEY,
  coupon_ids UUID[] NOT NULL DEFAULT '{}' CHECK (array_length(coupon_ids, 1) IS NULL OR array_length(coupon_ids, 1) <= 4),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupon_compare_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own compare"
  ON public.coupon_compare_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users upsert own compare ins"
  ON public.coupon_compare_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users upsert own compare upd"
  ON public.coupon_compare_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own compare"
  ON public.coupon_compare_sessions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 3) Battle pair RPC
CREATE OR REPLACE FUNCTION public.coupon_battle_pair(p_category TEXT DEFAULT NULL)
RETURNS TABLE (id UUID, title TEXT, store_name TEXT, original_value NUMERIC, selling_price NUMERIC, image_url TEXT, category TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, title, store_name, original_value, selling_price, image_url, category
  FROM public.coupon_listings
  WHERE is_active = true AND is_sold = false
    AND (p_category IS NULL OR category = p_category)
  ORDER BY random()
  LIMIT 2;
$$;

-- 4) Battle votes
CREATE TABLE public.coupon_battle_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  coupon_a UUID NOT NULL REFERENCES public.coupon_listings(id) ON DELETE CASCADE,
  coupon_b UUID NOT NULL REFERENCES public.coupon_listings(id) ON DELETE CASCADE,
  winner UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_battle_votes_user ON public.coupon_battle_votes(user_id, created_at DESC);
ALTER TABLE public.coupon_battle_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users insert own battle vote"
  ON public.coupon_battle_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users see own battle votes"
  ON public.coupon_battle_votes FOR SELECT TO authenticated USING (auth.uid() = user_id);
