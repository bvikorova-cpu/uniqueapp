CREATE OR REPLACE FUNCTION public.convert_xp_to_credits(p_xp_amount integer, p_target text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_current_xp bigint;
  v_locked_xp bigint;
  v_credits integer;
  v_rate constant integer := 10000;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'NOT_AUTHENTICATED';
  END IF;
  IF p_xp_amount IS NULL OR p_xp_amount < v_rate THEN
    RAISE EXCEPTION 'MIN_XP_REQUIRED';
  END IF;
  IF p_xp_amount % v_rate <> 0 THEN
    RAISE EXCEPTION 'XP_MUST_BE_MULTIPLE_OF_10000';
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

  UPDATE public.user_xp
  SET total_xp = total_xp - p_xp_amount,
      locked_xp = LEAST(locked_xp, total_xp - p_xp_amount),
      updated_at = now()
  WHERE user_id = v_user;

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
$$;