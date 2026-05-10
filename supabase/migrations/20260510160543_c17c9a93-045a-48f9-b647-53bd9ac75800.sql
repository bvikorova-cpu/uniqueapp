
-- Sprint 1: Trust & social proof

-- 1) Verifications (Worked / Didn't work)
CREATE TABLE public.coupon_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupon_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('worked','didnt_work')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (coupon_id, user_id)
);
CREATE INDEX idx_coupon_verifications_coupon ON public.coupon_verifications(coupon_id);
ALTER TABLE public.coupon_verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "verifications readable by all"
  ON public.coupon_verifications FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "users insert own verification"
  ON public.coupon_verifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users update own verification"
  ON public.coupon_verifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own verification"
  ON public.coupon_verifications FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 2) Public success counter helper (RPC)
CREATE OR REPLACE FUNCTION public.coupon_verification_stats(p_coupon_id UUID)
RETURNS TABLE (worked BIGINT, didnt_work BIGINT, success_pct INT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT
    COUNT(*) FILTER (WHERE status = 'worked') AS worked,
    COUNT(*) FILTER (WHERE status = 'didnt_work') AS didnt_work,
    CASE WHEN COUNT(*) = 0 THEN 0
         ELSE (COUNT(*) FILTER (WHERE status = 'worked') * 100 / COUNT(*))::INT
    END AS success_pct
  FROM public.coupon_verifications WHERE coupon_id = p_coupon_id;
$$;

-- 3) Comments / Q&A
CREATE TABLE public.coupon_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID NOT NULL REFERENCES public.coupon_listings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  parent_id UUID REFERENCES public.coupon_comments(id) ON DELETE CASCADE,
  body TEXT NOT NULL CHECK (char_length(body) BETWEEN 1 AND 2000),
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_coupon_comments_coupon ON public.coupon_comments(coupon_id, created_at DESC);
ALTER TABLE public.coupon_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "comments readable by all"
  ON public.coupon_comments FOR SELECT TO authenticated, anon USING (true);
CREATE POLICY "auth insert own comment"
  ON public.coupon_comments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users edit own comment"
  ON public.coupon_comments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users delete own comment"
  ON public.coupon_comments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- 4) Verified seller badge (computed via RPC from coupon_seller_analytics)
CREATE OR REPLACE FUNCTION public.is_verified_coupon_seller(p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((
    SELECT orders_completed >= 10
       AND COALESCE(dispute_rate_pct, 0) < 2
       AND COALESCE(avg_rating, 0) >= 4.5
    FROM public.coupon_seller_analytics WHERE seller_id = p_user_id
  ), false);
$$;
