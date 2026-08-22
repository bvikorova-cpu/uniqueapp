-- Existing challenge XP should be locked so it cannot be converted to credits.
-- 1. Cap locked_xp so it never exceeds total_xp (prevents negative convertible XP).
-- 2. Backfill locked_xp for users who received challenge winner XP but still have it in user_xp.
-- 3. Add a trigger to keep locked_xp capped at total_xp after any update.

-- Cap existing locked_xp to total_xp
UPDATE public.user_xp
SET locked_xp = total_xp
WHERE locked_xp > total_xp;

-- Lock existing challenge winner XP that is still present in user_xp
WITH challenge_xp AS (
  SELECT user_id, SUM(xp_awarded) AS xp_awarded
  FROM (
    SELECT user_id, xp_awarded FROM public.eco_monthly_winners
    UNION ALL
    SELECT user_id, xp_awarded FROM public.healthy_monthly_winners
  ) w
  GROUP BY user_id
)
UPDATE public.user_xp u
SET locked_xp = LEAST(u.total_xp, COALESCE(c.xp_awarded, 0))
FROM challenge_xp c
WHERE u.user_id = c.user_id
  AND u.total_xp > 0;

-- Function + trigger to ensure locked_xp never exceeds total_xp
CREATE OR REPLACE FUNCTION public.trg_cap_locked_xp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.locked_xp > NEW.total_xp THEN
    NEW.locked_xp := NEW.total_xp;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cap_locked_xp ON public.user_xp;
CREATE TRIGGER trg_cap_locked_xp
BEFORE INSERT OR UPDATE OF total_xp, locked_xp ON public.user_xp
FOR EACH ROW EXECUTE FUNCTION public.trg_cap_locked_xp();

-- Make conversion function also cap locked_xp after subtraction, so converted locked XP cannot be re-converted
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
$function$;

GRANT EXECUTE ON FUNCTION public.trg_cap_locked_xp() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.convert_xp_to_credits(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_xp_to_credits(integer, text) TO service_role;