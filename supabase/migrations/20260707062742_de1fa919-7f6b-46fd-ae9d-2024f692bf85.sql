CREATE OR REPLACE FUNCTION public.claim_daily_login_reward()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_row public.user_login_streaks%ROWTYPE;
  v_today DATE := (now() AT TIME ZONE 'Europe/Bratislava')::date;
  v_bonus INT := 1;
  v_new_streak INT;
  v_was_reset BOOLEAN := false;
  v_missed_days INT := 0;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT * INTO v_row FROM public.user_login_streaks WHERE user_id = v_user FOR UPDATE;

  IF NOT FOUND THEN
    INSERT INTO public.user_login_streaks (user_id, current_streak, longest_streak, last_claim_date, total_claims)
    VALUES (v_user, 1, 1, v_today, 1);
    RETURN jsonb_build_object('claimed', true, 'streak', 1, 'bonus', v_bonus, 'was_reset', false);
  END IF;

  IF v_row.last_claim_date = v_today THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_claimed_today', 'streak', v_row.current_streak);
  END IF;

  IF v_row.last_claim_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_row.current_streak + 1;
  ELSE
    v_new_streak := 1;
    v_was_reset := true;
    v_missed_days := GREATEST(0, (v_today - v_row.last_claim_date)::int - 1);
  END IF;

  v_bonus := LEAST(10, 1 + (v_new_streak / 7));

  UPDATE public.user_login_streaks
  SET current_streak = v_new_streak,
      longest_streak = GREATEST(longest_streak, v_new_streak),
      last_claim_date = v_today,
      total_claims = total_claims + 1,
      updated_at = now()
  WHERE user_id = v_user;

  RETURN jsonb_build_object(
    'claimed', true,
    'streak', v_new_streak,
    'bonus', v_bonus,
    'was_reset', v_was_reset,
    'missed_days', v_missed_days
  );
END;
$$;