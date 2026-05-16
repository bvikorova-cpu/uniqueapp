
-- #34 Endorsements
CREATE TABLE IF NOT EXISTS public.talent_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  talent_user_id UUID NOT NULL,
  endorser_id UUID NOT NULL,
  skill TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (talent_user_id, endorser_id, skill)
);
CREATE INDEX IF NOT EXISTS idx_endorsements_talent ON public.talent_endorsements(talent_user_id);
CREATE INDEX IF NOT EXISTS idx_endorsements_category ON public.talent_endorsements(category);
ALTER TABLE public.talent_endorsements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "endorsements_select_all" ON public.talent_endorsements FOR SELECT USING (true);
CREATE POLICY "endorsements_insert_self" ON public.talent_endorsements FOR INSERT WITH CHECK (auth.uid() = endorser_id);
CREATE POLICY "endorsements_delete_self" ON public.talent_endorsements FOR DELETE USING (auth.uid() = endorser_id);

-- #35 Comments
CREATE TABLE IF NOT EXISTS public.talent_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL,
  user_id UUID NOT NULL,
  body TEXT NOT NULL CHECK (length(body) > 0 AND length(body) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_comments_submission ON public.talent_comments(submission_id, created_at DESC);
ALTER TABLE public.talent_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_select_all" ON public.talent_comments FOR SELECT USING (true);
CREATE POLICY "comments_insert_self" ON public.talent_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_self_or_admin" ON public.talent_comments FOR DELETE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));

-- #36 Clip of the Day
CREATE TABLE IF NOT EXISTS public.talent_clip_of_day (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  for_date DATE NOT NULL,
  category TEXT NOT NULL,
  submission_id UUID NOT NULL,
  votes_count INTEGER NOT NULL DEFAULT 0,
  awarded_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (for_date, category)
);
CREATE INDEX IF NOT EXISTS idx_clip_date ON public.talent_clip_of_day(for_date DESC);
ALTER TABLE public.talent_clip_of_day ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clip_select_all" ON public.talent_clip_of_day FOR SELECT USING (true);

CREATE OR REPLACE FUNCTION public.pick_clip_of_day(_category TEXT, _for_date DATE DEFAULT CURRENT_DATE)
RETURNS public.talent_clip_of_day
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing public.talent_clip_of_day;
  v_submission_id UUID;
  v_user_id UUID;
  v_votes INTEGER;
  v_row public.talent_clip_of_day;
BEGIN
  SELECT * INTO existing FROM public.talent_clip_of_day WHERE for_date = _for_date AND category = _category LIMIT 1;
  IF FOUND THEN RETURN existing; END IF;

  SELECT ts.id, ts.user_id, COALESCE(ts.votes_count, 0)
    INTO v_submission_id, v_user_id, v_votes
  FROM public.talent_submissions ts
  WHERE ts.category = _category
    AND ts.created_at::date <= _for_date
    AND ts.created_at::date >= (_for_date - INTERVAL '1 day')
  ORDER BY COALESCE(ts.votes_count, 0) DESC, ts.created_at DESC
  LIMIT 1;

  IF v_submission_id IS NULL THEN RETURN NULL; END IF;

  INSERT INTO public.talent_clip_of_day (for_date, category, submission_id, votes_count, awarded_user_id)
  VALUES (_for_date, _category, v_submission_id, v_votes, v_user_id)
  RETURNING * INTO v_row;

  BEGIN PERFORM public.award_xp(v_user_id, 50, 'clip_of_day', v_row.id::text);
  EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN v_row;
END;
$$;

-- #37 Talent Shop
CREATE TABLE IF NOT EXISTS public.talent_shop_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  cost_xp INTEGER NOT NULL CHECK (cost_xp > 0),
  item_type TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.talent_shop_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop_items_select_active_or_admin" ON public.talent_shop_items FOR SELECT USING (active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "shop_items_admin_insert" ON public.talent_shop_items FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "shop_items_admin_update" ON public.talent_shop_items FOR UPDATE USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "shop_items_admin_delete" ON public.talent_shop_items FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

CREATE TABLE IF NOT EXISTS public.talent_shop_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  item_id UUID NOT NULL REFERENCES public.talent_shop_items(id) ON DELETE CASCADE,
  cost_xp INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_shop_purch_user ON public.talent_shop_purchases(user_id, created_at DESC);
ALTER TABLE public.talent_shop_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "shop_purch_select_self" ON public.talent_shop_purchases FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.purchase_shop_item(_item_id UUID)
RETURNS public.talent_shop_purchases
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_item public.talent_shop_items;
  v_user UUID := auth.uid();
  v_balance INTEGER;
  v_row public.talent_shop_purchases;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO v_item FROM public.talent_shop_items WHERE id = _item_id AND active = true;
  IF NOT FOUND THEN RAISE EXCEPTION 'item_not_found'; END IF;

  SELECT COALESCE(total_xp, 0) INTO v_balance FROM public.user_xp WHERE user_id = v_user;
  IF v_balance IS NULL THEN v_balance := 0; END IF;
  IF v_balance < v_item.cost_xp THEN RAISE EXCEPTION 'insufficient_xp'; END IF;

  UPDATE public.user_xp SET total_xp = total_xp - v_item.cost_xp, updated_at = now() WHERE user_id = v_user;
  INSERT INTO public.xp_events (user_id, amount, source, ref_id) VALUES (v_user, -v_item.cost_xp, 'shop_purchase', _item_id::text);
  INSERT INTO public.talent_shop_purchases (user_id, item_id, cost_xp) VALUES (v_user, _item_id, v_item.cost_xp) RETURNING * INTO v_row;
  RETURN v_row;
END;
$$;

-- #38 Referrals
CREATE TABLE IF NOT EXISTS public.talent_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL,
  code TEXT NOT NULL UNIQUE,
  referred_id UUID,
  rewarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  redeemed_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.talent_referrals(referrer_id);
ALTER TABLE public.talent_referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "referrals_select_self" ON public.talent_referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "referrals_insert_self" ON public.talent_referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);

CREATE OR REPLACE FUNCTION public.redeem_referral(_code TEXT)
RETURNS public.talent_referrals
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_ref public.talent_referrals;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  SELECT * INTO v_ref FROM public.talent_referrals WHERE code = _code FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'invalid_code'; END IF;
  IF v_ref.referrer_id = v_user THEN RAISE EXCEPTION 'self_referral'; END IF;
  IF v_ref.rewarded THEN RAISE EXCEPTION 'already_redeemed'; END IF;

  UPDATE public.talent_referrals
    SET referred_id = v_user, rewarded = true, redeemed_at = now()
    WHERE id = v_ref.id
    RETURNING * INTO v_ref;

  BEGIN
    PERFORM public.award_xp(v_ref.referrer_id, 100, 'referral_referrer', v_ref.id::text);
    PERFORM public.award_xp(v_user, 50, 'referral_referred', v_ref.id::text);
  EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN v_ref;
END;
$$;

-- #39 Judge picks
CREATE TABLE IF NOT EXISTS public.talent_judge_picks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  judge_id UUID NOT NULL,
  submission_id UUID NOT NULL,
  category TEXT,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (judge_id, submission_id)
);
CREATE INDEX IF NOT EXISTS idx_judge_picks_sub ON public.talent_judge_picks(submission_id);
CREATE INDEX IF NOT EXISTS idx_judge_picks_cat ON public.talent_judge_picks(category);
ALTER TABLE public.talent_judge_picks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "judge_picks_select_all" ON public.talent_judge_picks FOR SELECT USING (true);
CREATE POLICY "judge_picks_insert_judge" ON public.talent_judge_picks FOR INSERT WITH CHECK (auth.uid() = judge_id AND public.has_role(auth.uid(), 'judge'));
CREATE POLICY "judge_picks_delete_self" ON public.talent_judge_picks FOR DELETE USING (auth.uid() = judge_id);

-- Seed shop items
INSERT INTO public.talent_shop_items (name, description, cost_xp, item_type, payload)
SELECT * FROM (VALUES
  ('Golden Frame', 'Wrap your submission card in a shimmering gold frame for 7 days.', 250, 'frame', '{"color":"gold","durationDays":7}'::jsonb),
  ('Neon Name', 'Glowing neon-pink username across the platform for 14 days.', 400, 'name_color', '{"color":"hotpink","durationDays":14}'::jsonb),
  ('VIP Badge', 'Permanent VIP badge on your profile.', 1000, 'badge', '{"label":"VIP","icon":"crown"}'::jsonb),
  ('Spotlight Boost', 'Push your latest submission to the top of the feed for 1 hour.', 150, 'boost', '{"durationMinutes":60}'::jsonb),
  ('Confetti Reaction', 'Unlock a confetti burst reaction in chat.', 80, 'reaction', '{"emoji":"🎉"}'::jsonb)
) AS v(name, description, cost_xp, item_type, payload)
WHERE NOT EXISTS (SELECT 1 FROM public.talent_shop_items);
