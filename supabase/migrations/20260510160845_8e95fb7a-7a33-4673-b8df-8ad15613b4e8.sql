
-- Sprint 2

-- 1) Votes
CREATE TABLE public.coupon_votes (
  coupon_id UUID NOT NULL REFERENCES public.coupon_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  value SMALLINT NOT NULL CHECK (value IN (-1, 1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (coupon_id, user_id)
);
CREATE INDEX idx_coupon_votes_coupon ON public.coupon_votes(coupon_id);
ALTER TABLE public.coupon_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "votes readable" ON public.coupon_votes FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "users insert own vote" ON public.coupon_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own vote" ON public.coupon_votes FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own vote" ON public.coupon_votes FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2) Hot ranking helpers (Reddit-style)
CREATE OR REPLACE FUNCTION public.coupon_hot_score(p_coupon_id UUID)
RETURNS NUMERIC LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  WITH v AS (
    SELECT COALESCE(SUM(value), 0)::NUMERIC AS score FROM public.coupon_votes WHERE coupon_id = p_coupon_id
  ), c AS (
    SELECT created_at FROM public.coupon_listings WHERE id = p_coupon_id
  )
  SELECT
    LOG(GREATEST(ABS((SELECT score FROM v)), 1)) * SIGN((SELECT score FROM v))
    + (EXTRACT(EPOCH FROM (SELECT created_at FROM c)) - 1577836800) / 45000.0;
$$;

CREATE OR REPLACE FUNCTION public.coupon_top_hot(p_limit INT DEFAULT 10)
RETURNS TABLE (id UUID, hot_score NUMERIC, upvotes BIGINT, downvotes BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT cl.id,
    public.coupon_hot_score(cl.id) AS hot_score,
    (SELECT COUNT(*) FROM public.coupon_votes v WHERE v.coupon_id = cl.id AND v.value = 1) AS upvotes,
    (SELECT COUNT(*) FROM public.coupon_votes v WHERE v.coupon_id = cl.id AND v.value = -1) AS downvotes
  FROM public.coupon_listings cl
  WHERE cl.is_active = true AND cl.is_sold = false
  ORDER BY hot_score DESC
  LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.coupon_trending_stores(p_limit INT DEFAULT 10, p_days INT DEFAULT 7)
RETURNS TABLE (store_name TEXT, orders BIGINT, gross_eur NUMERIC)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT cl.store_name,
    COUNT(*) AS orders,
    COALESCE(SUM(co.amount), 0)::NUMERIC AS gross_eur
  FROM public.coupon_orders co
  JOIN public.coupon_listings cl ON cl.id = co.coupon_id
  WHERE co.created_at > now() - (p_days || ' days')::INTERVAL
  GROUP BY cl.store_name
  ORDER BY orders DESC
  LIMIT p_limit;
$$;

-- 3) Daily Deal
CREATE TABLE public.coupon_daily_deal (
  deal_date DATE PRIMARY KEY DEFAULT CURRENT_DATE,
  coupon_id UUID NOT NULL REFERENCES public.coupon_listings(id) ON DELETE CASCADE,
  picked_by UUID,
  picked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupon_daily_deal ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily deal readable" ON public.coupon_daily_deal FOR SELECT TO authenticated, anon USING (true);

-- Auto-pick today's deal: top hot-ranked active coupon
CREATE OR REPLACE FUNCTION public.get_or_pick_daily_deal()
RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_id UUID;
BEGIN
  SELECT coupon_id INTO v_id FROM public.coupon_daily_deal WHERE deal_date = CURRENT_DATE;
  IF v_id IS NOT NULL THEN RETURN v_id; END IF;
  SELECT id INTO v_id FROM public.coupon_top_hot(1) LIMIT 1;
  IF v_id IS NOT NULL THEN
    INSERT INTO public.coupon_daily_deal (deal_date, coupon_id) VALUES (CURRENT_DATE, v_id)
      ON CONFLICT (deal_date) DO NOTHING;
  END IF;
  RETURN v_id;
END;
$$;

-- 4) Filter chip tags
ALTER TABLE public.coupon_listings ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';
CREATE INDEX IF NOT EXISTS idx_coupon_listings_tags ON public.coupon_listings USING GIN(tags);

-- 5) Wishlist folders
CREATE TABLE public.coupon_wishlist_folders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 60),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.coupon_wishlist_folders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users see own folders" ON public.coupon_wishlist_folders FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own folders" ON public.coupon_wishlist_folders FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own folders" ON public.coupon_wishlist_folders FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own folders" ON public.coupon_wishlist_folders FOR DELETE TO authenticated USING (auth.uid() = user_id);

ALTER TABLE public.coupon_wishlist ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.coupon_wishlist_folders(id) ON DELETE SET NULL;
