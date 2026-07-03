
-- Challenge PRO subscribers (€3/month) — grants 2x prize + gold badge in Eco & Healthy Challenge
CREATE TABLE public.challenge_pro_subscribers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_until TIMESTAMPTZ NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.challenge_pro_subscribers TO anon, authenticated;
GRANT ALL  ON public.challenge_pro_subscribers TO service_role;

ALTER TABLE public.challenge_pro_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read so the PRO gold-leaf badge is visible on other users' submissions & leaderboards.
CREATE POLICY "challenge_pro_public_read"
  ON public.challenge_pro_subscribers FOR SELECT USING (true);

-- Only service role (edge fn) writes.
CREATE POLICY "challenge_pro_service_write"
  ON public.challenge_pro_subscribers FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_challenge_pro_active_until ON public.challenge_pro_subscribers(active_until DESC);

CREATE TRIGGER challenge_pro_subscribers_updated_at
  BEFORE UPDATE ON public.challenge_pro_subscribers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Helper: is user PRO right now?
CREATE OR REPLACE FUNCTION public.is_challenge_pro(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.challenge_pro_subscribers
    WHERE user_id = _user_id AND active_until > now()
  );
$$;
GRANT EXECUTE ON FUNCTION public.is_challenge_pro(UUID) TO anon, authenticated;

-- Replace ECO winner award to grant 2x prize (200000 XP) for PRO subscribers
CREATE OR REPLACE FUNCTION public.award_eco_monthly_winner()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _month TEXT := to_char((now() - INTERVAL '1 day')::date, 'YYYY-MM');
  _winner RECORD;
  _xp INT;
  _is_pro BOOLEAN;
BEGIN
  IF EXISTS (SELECT 1 FROM public.eco_monthly_winners WHERE month_key = _month) THEN
    RETURN jsonb_build_object('status', 'already_awarded', 'month', _month);
  END IF;

  SELECT user_id, days_completed, total_votes
  INTO _winner
  FROM public.get_eco_leaderboard(_month, 1);

  IF _winner.user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'no_participants', 'month', _month);
  END IF;

  _is_pro := public.is_challenge_pro(_winner.user_id);
  _xp := CASE WHEN _is_pro THEN 200000 ELSE 100000 END;

  INSERT INTO public.eco_monthly_winners(month_key, user_id, days_completed, total_votes, xp_awarded)
  VALUES (_month, _winner.user_id, _winner.days_completed, _winner.total_votes, _xp);

  INSERT INTO public.user_xp(user_id, total_xp) VALUES (_winner.user_id, _xp)
  ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + _xp;

  INSERT INTO public.notifications(user_id, type, title, message, data)
  VALUES (_winner.user_id, 'eco_winner', '🏆 Eco Champion of the Month!',
    CASE WHEN _is_pro
      THEN 'You won 200,000 XP (PRO 2× bonus) for being the top eco warrior!'
      ELSE 'You won 100,000 XP for being the top eco warrior! Upgrade to PRO for 2× prizes.'
    END,
    jsonb_build_object('month', _month, 'xp', _xp, 'pro', _is_pro));

  RETURN jsonb_build_object('status', 'awarded', 'month', _month, 'user_id', _winner.user_id, 'xp', _xp, 'pro', _is_pro);
END; $$;

-- Replace HEALTHY winner award to grant 2x prize for PRO subscribers
CREATE OR REPLACE FUNCTION public.award_healthy_monthly_winner(_month_key TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  winner RECORD;
  _xp INT;
  _is_pro BOOLEAN;
BEGIN
  SELECT * INTO winner FROM public.get_healthy_leaderboard(_month_key, 1);
  IF winner.user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no submissions');
  END IF;

  _is_pro := public.is_challenge_pro(winner.user_id);
  _xp := CASE WHEN _is_pro THEN 200000 ELSE 100000 END;

  INSERT INTO public.healthy_monthly_winners (month_key, user_id, days_completed, total_votes, xp_awarded)
  VALUES (_month_key, winner.user_id, winner.days_completed, winner.total_votes, _xp)
  ON CONFLICT (month_key) DO NOTHING;

  BEGIN
    PERFORM public.record_daily_activity_for_user(winner.user_id, _xp);
  EXCEPTION WHEN undefined_function THEN
    INSERT INTO public.user_xp(user_id, total_xp) VALUES (winner.user_id, _xp)
    ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + _xp;
  END;

  RETURN jsonb_build_object('success', true, 'user_id', winner.user_id, 'xp', _xp, 'pro', _is_pro);
END $$;
