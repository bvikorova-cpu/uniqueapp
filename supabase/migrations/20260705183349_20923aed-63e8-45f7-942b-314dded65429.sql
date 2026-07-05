
-- Add prize columns to winners tables
ALTER TABLE public.eco_monthly_winners
  ADD COLUMN IF NOT EXISTS credits_awarded BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cash_prize_cents BIGINT NOT NULL DEFAULT 0;

ALTER TABLE public.healthy_monthly_winners
  ADD COLUMN IF NOT EXISTS credits_awarded BIGINT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS cash_prize_cents BIGINT NOT NULL DEFAULT 0;

-- Helper: compute 5% of active monthly subscription revenue (cents).
-- PRO = 300 cents/mo, TOP = 500 cents/mo. Counts subscribers with active_until > now().
CREATE OR REPLACE FUNCTION public.challenge_monthly_prize_pool_cents()
RETURNS BIGINT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(FLOOR(
    (SUM(CASE WHEN tier = 'top' THEN 500 WHEN tier = 'pro' THEN 300 ELSE 0 END) * 0.05)
  ), 0)::BIGINT
  FROM public.challenge_pro_subscribers
  WHERE active_until > now();
$$;
GRANT EXECUTE ON FUNCTION public.challenge_monthly_prize_pool_cents() TO anon, authenticated;

-- Eco winner: 1M credits for ALL winners + 5% pool + tier-based XP
CREATE OR REPLACE FUNCTION public.award_eco_monthly_winner()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _month TEXT := to_char((now() - INTERVAL '1 day')::date, 'YYYY-MM');
  _winner RECORD;
  _xp INT;
  _tier TEXT;
  _credits BIGINT := 1000000;
  _pool BIGINT;
BEGIN
  IF EXISTS (SELECT 1 FROM public.eco_monthly_winners WHERE month_key = _month) THEN
    RETURN jsonb_build_object('status', 'already_awarded', 'month', _month);
  END IF;
  SELECT user_id, days_completed, total_votes INTO _winner FROM public.get_eco_leaderboard(_month, 1);
  IF _winner.user_id IS NULL THEN
    RETURN jsonb_build_object('status', 'no_participants', 'month', _month);
  END IF;
  _tier := public.challenge_tier(_winner.user_id);
  _xp := CASE WHEN _tier = 'top' THEN 500000 WHEN _tier = 'pro' THEN 200000 ELSE 100000 END;
  _pool := public.challenge_monthly_prize_pool_cents();

  INSERT INTO public.eco_monthly_winners(month_key, user_id, days_completed, total_votes, xp_awarded, credits_awarded, cash_prize_cents)
  VALUES (_month, _winner.user_id, _winner.days_completed, _winner.total_votes, _xp, _credits, _pool);

  INSERT INTO public.user_xp(user_id, total_xp) VALUES (_winner.user_id, _xp)
  ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + _xp;

  PERFORM set_config('app.credit_reason', 'challenge_monthly_winner_prize', true);
  PERFORM set_config('app.credit_source', 'award_eco_monthly_winner', true);
  INSERT INTO public.ai_credits(user_id, credits_remaining, total_credits_purchased)
  VALUES (_winner.user_id, _credits, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET credits_remaining = public.ai_credits.credits_remaining + _credits, updated_at = now();

  INSERT INTO public.notifications(user_id, type, title, message, data)
  VALUES (_winner.user_id, 'eco_winner', '🏆 Eco Champion of the Month!',
    'You won ' || _xp || ' XP + 1,000,000 AI credits + a cash prize of €' || (_pool::NUMERIC / 100)::TEXT || ' (5% of monthly subscription pool)!',
    jsonb_build_object('month', _month, 'xp', _xp, 'tier', _tier, 'credits', _credits, 'cash_prize_cents', _pool));

  RETURN jsonb_build_object('status', 'awarded', 'month', _month, 'user_id', _winner.user_id,
    'xp', _xp, 'tier', _tier, 'credits', _credits, 'cash_prize_cents', _pool);
END; $$;

-- Healthy winner: 1M credits for ALL winners + 5% pool + tier-based XP
CREATE OR REPLACE FUNCTION public.award_healthy_monthly_winner(_month_key TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  winner RECORD; _xp INT; _tier TEXT; _credits BIGINT := 1000000; _pool BIGINT;
BEGIN
  SELECT * INTO winner FROM public.get_healthy_leaderboard(_month_key, 1);
  IF winner.user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no submissions');
  END IF;
  _tier := public.challenge_tier(winner.user_id);
  _xp := CASE WHEN _tier = 'top' THEN 500000 WHEN _tier = 'pro' THEN 200000 ELSE 100000 END;
  _pool := public.challenge_monthly_prize_pool_cents();

  INSERT INTO public.healthy_monthly_winners (month_key, user_id, days_completed, total_votes, xp_awarded, credits_awarded, cash_prize_cents)
  VALUES (_month_key, winner.user_id, winner.days_completed, winner.total_votes, _xp, _credits, _pool)
  ON CONFLICT (month_key) DO NOTHING;

  BEGIN
    PERFORM public.record_daily_activity_for_user(winner.user_id, _xp);
  EXCEPTION WHEN undefined_function THEN
    INSERT INTO public.user_xp(user_id, total_xp) VALUES (winner.user_id, _xp)
    ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + _xp;
  END;

  PERFORM set_config('app.credit_reason', 'challenge_monthly_winner_prize', true);
  PERFORM set_config('app.credit_source', 'award_healthy_monthly_winner', true);
  INSERT INTO public.ai_credits(user_id, credits_remaining, total_credits_purchased)
  VALUES (winner.user_id, _credits, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET credits_remaining = public.ai_credits.credits_remaining + _credits, updated_at = now();

  INSERT INTO public.notifications(user_id, type, title, message, data)
  VALUES (winner.user_id, 'healthy_winner', '🏆 Healthy Champion of the Month!',
    'You won ' || _xp || ' XP + 1,000,000 AI credits + a cash prize of €' || (_pool::NUMERIC / 100)::TEXT || ' (5% of monthly subscription pool)!',
    jsonb_build_object('month', _month_key, 'xp', _xp, 'tier', _tier, 'credits', _credits, 'cash_prize_cents', _pool));

  RETURN jsonb_build_object('success', true, 'user_id', winner.user_id,
    'xp', _xp, 'tier', _tier, 'credits', _credits, 'cash_prize_cents', _pool);
END $$;
