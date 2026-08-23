CREATE OR REPLACE FUNCTION public.claim_daily_reward_atomic(_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user uuid := COALESCE(_user_id, auth.uid());
  v_last_streak int;
  v_last_date date;
  v_streak int := 1;
  v_points int := 10;
  v_available int := 0;
  v_last_freeze timestamptz;
  v_freeze_used boolean := false;
  v_gap int;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT day_streak, claimed_date INTO v_last_streak, v_last_date
  FROM public.daily_rewards
  WHERE user_id = v_user
  ORDER BY claimed_at DESC
  LIMIT 1;

  IF v_last_date = (current_date - 1) THEN
    v_streak := COALESCE(v_last_streak, 0) + 1;
  ELSIF v_last_date IS NOT NULL AND v_last_date < (current_date - 1) THEN
    v_gap := (current_date - v_last_date) - 1; -- missed days
    SELECT COALESCE(available_count, 0) INTO v_available
    FROM public.user_streak_freezes WHERE user_id = v_user FOR UPDATE;

    SELECT max(created_at) INTO v_last_freeze
    FROM public.streak_freeze_history
    WHERE user_id = v_user AND action = 'used';

    IF v_gap = 1 AND COALESCE(v_available, 0) > 0
       AND (v_last_freeze IS NULL OR v_last_freeze < now() - interval '7 days') THEN
      UPDATE public.user_streak_freezes
         SET available_count = available_count - 1,
             total_used = COALESCE(total_used, 0) + 1,
             last_used_at = now()
       WHERE user_id = v_user;
      INSERT INTO public.streak_freeze_history (user_id, action, quantity, cost_xp)
        VALUES (v_user, 'used', 1, 0);
      v_streak := COALESCE(v_last_streak, 0) + 1;
      v_freeze_used := true;
    END IF;
  END IF;

  BEGIN
    INSERT INTO public.daily_rewards (user_id, day_streak, points_earned)
    VALUES (v_user, v_streak, v_points);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END;

  UPDATE public.user_points
     SET login_streak = v_streak, updated_at = now()
   WHERE user_id = v_user;

  PERFORM public.award_xp(v_user, v_points, 'daily_reward', v_user::text || ':' || current_date::text);

  RETURN jsonb_build_object('ok', true, 'pointsEarned', v_points, 'streak', v_streak, 'freezeUsed', v_freeze_used);
END;
$function$;