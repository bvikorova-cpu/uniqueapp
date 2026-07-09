CREATE OR REPLACE FUNCTION public.claim_daily_reward_atomic(_user_id uuid DEFAULT NULL)
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
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT day_streak, claimed_date
    INTO v_last_streak, v_last_date
  FROM public.daily_rewards
  WHERE user_id = v_user
  ORDER BY claimed_at DESC
  LIMIT 1;

  IF v_last_date = (current_date - 1) THEN
    v_streak := COALESCE(v_last_streak, 0) + 1;
  END IF;

  BEGIN
    INSERT INTO public.daily_rewards (user_id, day_streak, points_earned)
    VALUES (v_user, v_streak, v_points);
  EXCEPTION WHEN unique_violation THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END;

  INSERT INTO public.user_points (user_id, total_points, current_level_points, level)
  VALUES (v_user, v_points, v_points, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = public.user_points.total_points + v_points,
        current_level_points = public.user_points.current_level_points + v_points,
        updated_at = now();

  RETURN jsonb_build_object('ok', true, 'pointsEarned', v_points, 'streak', v_streak);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.claim_daily_reward_atomic(uuid) TO authenticated, service_role;