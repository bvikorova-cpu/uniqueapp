
CREATE TABLE IF NOT EXISTS public.creator_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  tier_id UUID NOT NULL REFERENCES public.creator_subscription_tiers(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (subscriber_id, tier_id)
);
ALTER TABLE public.creator_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "subs viewable by parties" ON public.creator_subscriptions;
CREATE POLICY "subs viewable by parties" ON public.creator_subscriptions FOR SELECT USING (subscriber_id = auth.uid() OR creator_id = auth.uid());
DROP POLICY IF EXISTS "subscriber inserts own" ON public.creator_subscriptions;
CREATE POLICY "subscriber inserts own" ON public.creator_subscriptions FOR INSERT WITH CHECK (subscriber_id = auth.uid());
DROP POLICY IF EXISTS "parties update own" ON public.creator_subscriptions;
CREATE POLICY "parties update own" ON public.creator_subscriptions FOR UPDATE USING (subscriber_id = auth.uid() OR creator_id = auth.uid());
CREATE INDEX IF NOT EXISTS idx_cs_subscriber ON public.creator_subscriptions(subscriber_id);
CREATE INDEX IF NOT EXISTS idx_cs_creator ON public.creator_subscriptions(creator_id);

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS branded_partner_id UUID;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS branded_partner_name TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS branded_disclosure TEXT;

CREATE TABLE IF NOT EXISTS public.post_product_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  product_url TEXT NOT NULL,
  product_name TEXT NOT NULL,
  price_eur NUMERIC(10,2),
  currency TEXT DEFAULT 'EUR',
  image_url TEXT,
  position_x NUMERIC(5,2),
  position_y NUMERIC(5,2),
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.post_product_tags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "product tags public read" ON public.post_product_tags;
CREATE POLICY "product tags public read" ON public.post_product_tags FOR SELECT USING (true);
DROP POLICY IF EXISTS "owner manages tags" ON public.post_product_tags;
CREATE POLICY "owner manages tags" ON public.post_product_tags FOR ALL USING (created_by = auth.uid()) WITH CHECK (created_by = auth.uid());
CREATE INDEX IF NOT EXISTS idx_ppt_post ON public.post_product_tags(post_id);

CREATE TABLE IF NOT EXISTS public.creator_fund_visibility (
  user_id UUID PRIMARY KEY,
  show_total_earned BOOLEAN DEFAULT false,
  show_subscriber_count BOOLEAN DEFAULT true,
  show_tip_count BOOLEAN DEFAULT true,
  total_earned_eur NUMERIC(12,2) DEFAULT 0,
  subscriber_count INT DEFAULT 0,
  tip_count INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.creator_fund_visibility ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "fund metrics public read" ON public.creator_fund_visibility;
CREATE POLICY "fund metrics public read" ON public.creator_fund_visibility FOR SELECT USING (true);
DROP POLICY IF EXISTS "owner manages fund vis" ON public.creator_fund_visibility;
CREATE POLICY "owner manages fund vis" ON public.creator_fund_visibility FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE IF NOT EXISTS public.user_login_streaks (
  user_id UUID PRIMARY KEY,
  current_streak INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  last_claim_date DATE,
  total_claims INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.user_login_streaks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "streaks owner read" ON public.user_login_streaks;
CREATE POLICY "streaks owner read" ON public.user_login_streaks FOR SELECT USING (user_id = auth.uid());
DROP POLICY IF EXISTS "streaks owner manage" ON public.user_login_streaks;
CREATE POLICY "streaks owner manage" ON public.user_login_streaks FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.claim_daily_login_reward()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_row public.user_login_streaks%ROWTYPE;
  v_today DATE := CURRENT_DATE;
  v_bonus INT := 1;
  v_new_streak INT;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_row FROM public.user_login_streaks WHERE user_id = v_user FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_login_streaks (user_id, current_streak, longest_streak, last_claim_date, total_claims)
    VALUES (v_user, 1, 1, v_today, 1);
    RETURN jsonb_build_object('claimed', true, 'streak', 1, 'bonus', v_bonus);
  END IF;

  IF v_row.last_claim_date = v_today THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_claimed_today', 'streak', v_row.current_streak);
  END IF;

  IF v_row.last_claim_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_row.current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_bonus := LEAST(10, 1 + (v_new_streak / 7));

  UPDATE public.user_login_streaks
  SET current_streak = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      last_claim_date = v_today,
      total_claims = total_claims + 1,
      updated_at = now()
  WHERE user_id = v_user;

  RETURN jsonb_build_object('claimed', true, 'streak', v_new_streak, 'bonus', v_bonus);
END;
$$;
