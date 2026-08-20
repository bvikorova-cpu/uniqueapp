ALTER TABLE public.user_xp ADD COLUMN IF NOT EXISTS locked_xp bigint NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.convertible_xp(_user_id uuid)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT GREATEST(0, COALESCE(total_xp, 0) - COALESCE(locked_xp, 0))
  FROM public.user_xp WHERE user_id = _user_id
$$;

REVOKE ALL ON FUNCTION public.convertible_xp(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.convertible_xp(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.convert_xp_to_credits(p_xp_amount integer, p_target text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := auth.uid();
  v_current_xp bigint;
  v_locked_xp bigint;
  v_credits integer;
  v_rate constant integer := 1000;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;
  IF p_xp_amount IS NULL OR p_xp_amount < v_rate THEN
    RAISE EXCEPTION 'MIN_XP_REQUIRED';
  END IF;
  IF p_xp_amount % v_rate <> 0 THEN
    RAISE EXCEPTION 'XP_MUST_BE_MULTIPLE_OF_1000';
  END IF;
  IF p_target NOT IN ('free_tier','tutoring','brand_votes','ai_credits') THEN
    RAISE EXCEPTION 'INVALID_TARGET';
  END IF;

  v_credits := p_xp_amount / v_rate;

  SELECT total_xp, COALESCE(locked_xp, 0) INTO v_current_xp, v_locked_xp
  FROM public.user_xp WHERE user_id = v_user FOR UPDATE;

  IF v_current_xp IS NULL OR v_current_xp < p_xp_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_XP';
  END IF;
  IF (v_current_xp - v_locked_xp) < p_xp_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_CONVERTIBLE_XP';
  END IF;

  UPDATE public.user_xp SET total_xp = total_xp - p_xp_amount, updated_at = now() WHERE user_id = v_user;

  IF p_target = 'free_tier' THEN
    INSERT INTO public.free_tier_credits (user_id, balance, month_key, granted_at, updated_at)
    VALUES (v_user, v_credits, to_char(now(),'YYYY-MM'), now(), now())
    ON CONFLICT (user_id) DO UPDATE SET balance = public.free_tier_credits.balance + v_credits, updated_at = now();
  ELSIF p_target = 'tutoring' THEN
    INSERT INTO public.tutoring_credits (user_id, credits_remaining, total_credits_purchased)
    VALUES (v_user, v_credits, 0)
    ON CONFLICT (user_id) DO UPDATE SET credits_remaining = public.tutoring_credits.credits_remaining + v_credits, updated_at = now();
  ELSIF p_target = 'brand_votes' THEN
    INSERT INTO public.user_daily_votes (user_id, date, votes_used, votes_purchased)
    VALUES (v_user, CURRENT_DATE, 0, v_credits)
    ON CONFLICT (user_id, date) DO UPDATE SET votes_purchased = public.user_daily_votes.votes_purchased + v_credits;
  ELSIF p_target = 'ai_credits' THEN
    PERFORM set_config('app.credit_reason', 'xp_conversion', true);
    PERFORM set_config('app.credit_source', 'xp_converter', true);
    INSERT INTO public.ai_credits (user_id, credits_remaining)
    VALUES (v_user, v_credits)
    ON CONFLICT (user_id) DO UPDATE SET credits_remaining = public.ai_credits.credits_remaining + v_credits, updated_at = now();
  END IF;

  INSERT INTO public.xp_conversions (user_id, xp_spent, credits_received, target_pool)
  VALUES (v_user, p_xp_amount, v_credits, p_target);

  RETURN jsonb_build_object('success', true, 'xp_spent', p_xp_amount, 'credits_received', v_credits, 'target', p_target);
END;
$function$;

CREATE OR REPLACE FUNCTION public.award_eco_monthly_winner()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.user_xp(user_id, total_xp, locked_xp) VALUES (_winner.user_id, _xp, _xp)
  ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + _xp,
                                      locked_xp = COALESCE(public.user_xp.locked_xp, 0) + _xp;

  PERFORM set_config('app.credit_reason', 'challenge_monthly_winner_prize', true);
  PERFORM set_config('app.credit_source', 'award_eco_monthly_winner', true);
  INSERT INTO public.ai_credits(user_id, credits_remaining, total_credits_purchased)
  VALUES (_winner.user_id, _credits, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET credits_remaining = public.ai_credits.credits_remaining + _credits, updated_at = now();

  INSERT INTO public.notifications(user_id, type, title, message, data)
  VALUES (_winner.user_id, 'eco_winner', '🏆 Eco Champion of the Month!',
    'You won ' || _xp || ' XP (challenge XP cannot be exchanged for credits) + 1,000,000 AI credits + a cash prize of €' || (_pool::NUMERIC / 100)::TEXT || ' (5% of monthly subscription pool)!',
    jsonb_build_object('month', _month, 'xp', _xp, 'tier', _tier, 'credits', _credits, 'cash_prize_cents', _pool));

  RETURN jsonb_build_object('status', 'awarded', 'month', _month, 'user_id', _winner.user_id,
    'xp', _xp, 'tier', _tier, 'credits', _credits, 'cash_prize_cents', _pool);
END; $function$;

CREATE OR REPLACE FUNCTION public.award_healthy_monthly_winner(_month_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
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

  INSERT INTO public.user_xp(user_id, total_xp, locked_xp) VALUES (winner.user_id, _xp, _xp)
  ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + _xp,
                                      locked_xp = COALESCE(public.user_xp.locked_xp, 0) + _xp;

  PERFORM set_config('app.credit_reason', 'challenge_monthly_winner_prize', true);
  PERFORM set_config('app.credit_source', 'award_healthy_monthly_winner', true);
  INSERT INTO public.ai_credits(user_id, credits_remaining, total_credits_purchased)
  VALUES (winner.user_id, _credits, 0)
  ON CONFLICT (user_id) DO UPDATE
    SET credits_remaining = public.ai_credits.credits_remaining + _credits, updated_at = now();

  INSERT INTO public.notifications(user_id, type, title, message, data)
  VALUES (winner.user_id, 'healthy_winner', '🏆 Healthy Champion of the Month!',
    'You won ' || _xp || ' XP (challenge XP cannot be exchanged for credits) + 1,000,000 AI credits + a cash prize of €' || (_pool::NUMERIC / 100)::TEXT || ' (5% of monthly subscription pool)!',
    jsonb_build_object('month', _month_key, 'xp', _xp, 'tier', _tier, 'credits', _credits, 'cash_prize_cents', _pool));

  RETURN jsonb_build_object('success', true, 'user_id', winner.user_id,
    'xp', _xp, 'tier', _tier, 'credits', _credits, 'cash_prize_cents', _pool);
END $function$;

UPDATE public.user_xp ux
SET locked_xp = LEAST(ux.total_xp, COALESCE(w.xp, 0))
FROM (
  SELECT user_id, SUM(xp_awarded) AS xp FROM (
    SELECT user_id, xp_awarded FROM public.eco_monthly_winners
    UNION ALL
    SELECT user_id, xp_awarded FROM public.healthy_monthly_winners
  ) t GROUP BY user_id
) w
WHERE w.user_id = ux.user_id;