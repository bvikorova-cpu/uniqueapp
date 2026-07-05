
CREATE OR REPLACE FUNCTION public.challenge_tier(_user_id UUID)
RETURNS TEXT LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT tier FROM public.challenge_pro_subscribers
  WHERE user_id = _user_id AND active_until > now()
  LIMIT 1;
$$;
GRANT EXECUTE ON FUNCTION public.challenge_tier(UUID) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.award_eco_monthly_winner()
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _month TEXT := to_char((now() - INTERVAL '1 day')::date, 'YYYY-MM');
  _winner RECORD;
  _xp INT;
  _tier TEXT;
  _credits_bonus INT := 0;
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
  IF _tier = 'top' THEN _credits_bonus := 1000000; END IF;
  INSERT INTO public.eco_monthly_winners(month_key, user_id, days_completed, total_votes, xp_awarded)
  VALUES (_month, _winner.user_id, _winner.days_completed, _winner.total_votes, _xp);
  INSERT INTO public.user_xp(user_id, total_xp) VALUES (_winner.user_id, _xp)
  ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + _xp;
  IF _credits_bonus > 0 THEN
    PERFORM set_config('app.credit_reason', 'challenge_top_win_prize', true);
    PERFORM set_config('app.credit_source', 'award_eco_monthly_winner', true);
    INSERT INTO public.ai_credits(user_id, credits_remaining, total_credits_purchased)
    VALUES (_winner.user_id, _credits_bonus, 0)
    ON CONFLICT (user_id) DO UPDATE
      SET credits_remaining = public.ai_credits.credits_remaining + _credits_bonus, updated_at = now();
  END IF;
  INSERT INTO public.notifications(user_id, type, title, message, data)
  VALUES (_winner.user_id, 'eco_winner', '🏆 Eco Champion of the Month!',
    CASE WHEN _tier = 'top' THEN 'You won 500,000 XP + 1,000,000 AI credits (TOP prize) for being the top eco warrior!'
         WHEN _tier = 'pro' THEN 'You won 200,000 XP (PRO 2× bonus) for being the top eco warrior!'
         ELSE 'You won 100,000 XP for being the top eco warrior! Upgrade to PRO or TOP for bigger prizes.' END,
    jsonb_build_object('month', _month, 'xp', _xp, 'tier', _tier, 'credits_bonus', _credits_bonus));
  RETURN jsonb_build_object('status', 'awarded', 'month', _month, 'user_id', _winner.user_id, 'xp', _xp, 'tier', _tier, 'credits_bonus', _credits_bonus);
END; $$;

CREATE OR REPLACE FUNCTION public.award_healthy_monthly_winner(_month_key TEXT)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  winner RECORD; _xp INT; _tier TEXT; _credits_bonus INT := 0;
BEGIN
  SELECT * INTO winner FROM public.get_healthy_leaderboard(_month_key, 1);
  IF winner.user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no submissions');
  END IF;
  _tier := public.challenge_tier(winner.user_id);
  _xp := CASE WHEN _tier = 'top' THEN 500000 WHEN _tier = 'pro' THEN 200000 ELSE 100000 END;
  IF _tier = 'top' THEN _credits_bonus := 1000000; END IF;
  INSERT INTO public.healthy_monthly_winners (month_key, user_id, days_completed, total_votes, xp_awarded)
  VALUES (_month_key, winner.user_id, winner.days_completed, winner.total_votes, _xp)
  ON CONFLICT (month_key) DO NOTHING;
  BEGIN
    PERFORM public.record_daily_activity_for_user(winner.user_id, _xp);
  EXCEPTION WHEN undefined_function THEN
    INSERT INTO public.user_xp(user_id, total_xp) VALUES (winner.user_id, _xp)
    ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + _xp;
  END;
  IF _credits_bonus > 0 THEN
    PERFORM set_config('app.credit_reason', 'challenge_top_win_prize', true);
    PERFORM set_config('app.credit_source', 'award_healthy_monthly_winner', true);
    INSERT INTO public.ai_credits(user_id, credits_remaining, total_credits_purchased)
    VALUES (winner.user_id, _credits_bonus, 0)
    ON CONFLICT (user_id) DO UPDATE
      SET credits_remaining = public.ai_credits.credits_remaining + _credits_bonus, updated_at = now();
  END IF;
  RETURN jsonb_build_object('success', true, 'user_id', winner.user_id, 'xp', _xp, 'tier', _tier, 'credits_bonus', _credits_bonus);
END $$;
