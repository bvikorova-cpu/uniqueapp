-- Allow XP conversions into the unified AI credit pool.
ALTER TABLE public.xp_conversions
  DROP CONSTRAINT IF EXISTS xp_conversions_target_pool_check,
  ADD CONSTRAINT xp_conversions_target_pool_check
    CHECK (target_pool IN ('free_tier','tutoring','brand_votes','ai_credits'));

CREATE OR REPLACE FUNCTION public.convert_xp_to_credits(p_xp_amount integer, p_target text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_current_xp integer;
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

  SELECT total_xp INTO v_current_xp FROM public.user_xp WHERE user_id = v_user FOR UPDATE;
  IF v_current_xp IS NULL OR v_current_xp < p_xp_amount THEN
    RAISE EXCEPTION 'INSUFFICIENT_XP';
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
    PERFORM set_config('app.credit_source', 'kitchenstars', true);
    INSERT INTO public.ai_credits (user_id, credits_remaining)
    VALUES (v_user, v_credits)
    ON CONFLICT (user_id) DO UPDATE SET credits_remaining = public.ai_credits.credits_remaining + v_credits, updated_at = now();
  END IF;

  INSERT INTO public.xp_conversions (user_id, xp_spent, credits_received, target_pool)
  VALUES (v_user, p_xp_amount, v_credits, p_target);

  RETURN jsonb_build_object('success', true, 'xp_spent', p_xp_amount, 'credits_received', v_credits, 'target', p_target);
END;
$$;

GRANT EXECUTE ON FUNCTION public.convert_xp_to_credits(integer, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.convert_xp_to_credits(integer, text) TO service_role;

-- KitchenStars competitions now award 10 XP to the winner instead of 10 ai_credits.
CREATE OR REPLACE FUNCTION public.settle_kitchen_competitions()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_battle record;
  v_winner record;
  v_settled integer := 0;
BEGIN
  FOR v_battle IN
    SELECT id
    FROM public.kitchen_battles
    WHERE status = 'open'
      AND deadline <= now()
      AND winner_participant_id IS NULL
    ORDER BY deadline
    FOR UPDATE SKIP LOCKED
  LOOP
    SELECT id, user_id, vote_count
    INTO v_winner
    FROM public.kitchen_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC
    LIMIT 1;

    IF v_winner.id IS NULL THEN
      UPDATE public.kitchen_battles
      SET status = 'completed', prize_pool = 0
      WHERE id = v_battle.id;
      CONTINUE;
    END IF;

    -- Award 10 KitchenStars hub XP and unified user XP.
    INSERT INTO public.hub_xp (user_id, hub, xp)
    VALUES (v_winner.user_id, 'kitchenstars', 10)
    ON CONFLICT (user_id, hub) DO UPDATE
      SET xp = public.hub_xp.xp + 10, updated_at = now();

    INSERT INTO public.user_xp (user_id, total_xp)
    VALUES (v_winner.user_id, 10)
    ON CONFLICT (user_id) DO UPDATE
      SET total_xp = public.user_xp.total_xp + 10, updated_at = now();

    UPDATE public.kitchen_battles
    SET status = 'completed',
        winner_participant_id = v_winner.id,
        prize_pool = 10
    WHERE id = v_battle.id
      AND winner_participant_id IS NULL;

    IF FOUND THEN
      v_settled := v_settled + 1;
    END IF;
  END LOOP;

  RETURN v_settled;
END;
$$;

REVOKE ALL ON FUNCTION public.settle_kitchen_competitions() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.settle_kitchen_competitions() TO service_role;
