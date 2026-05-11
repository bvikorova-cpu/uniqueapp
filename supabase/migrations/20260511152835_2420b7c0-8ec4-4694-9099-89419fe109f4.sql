
ALTER TABLE public.iq_daily_streaks
  ADD COLUMN IF NOT EXISTS total_credits_earned INTEGER NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.claim_iq_daily_streak()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _today DATE := CURRENT_DATE;
  _row public.iq_daily_streaks;
  _new_streak INTEGER;
  _reward INTEGER;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _row FROM public.iq_daily_streaks WHERE user_id = _uid FOR UPDATE;

  IF _row.user_id IS NOT NULL AND _row.last_claim_date = _today THEN
    RETURN jsonb_build_object(
      'claimed', false,
      'reason', 'already_claimed',
      'streak', _row.current_streak,
      'reward', 0
    );
  END IF;

  IF _row.user_id IS NULL THEN
    _new_streak := 1;
  ELSIF _row.last_claim_date = _today - INTERVAL '1 day' THEN
    _new_streak := _row.current_streak + 1;
  ELSE
    _new_streak := 1;
  END IF;

  _reward := CASE
    WHEN _new_streak >= 30 THEN 10
    WHEN _new_streak >= 14 THEN 5
    WHEN _new_streak >= 7 THEN 3
    WHEN _new_streak >= 3 THEN 2
    ELSE 1
  END;

  IF _row.user_id IS NULL THEN
    INSERT INTO public.iq_daily_streaks (user_id, current_streak, longest_streak, last_claim_date, total_claims, total_credits_earned)
    VALUES (_uid, 1, 1, _today, 1, _reward);
  ELSE
    UPDATE public.iq_daily_streaks
    SET current_streak = _new_streak,
        longest_streak = GREATEST(longest_streak, _new_streak),
        last_claim_date = _today,
        total_claims = total_claims + 1,
        total_credits_earned = total_credits_earned + _reward,
        updated_at = now()
    WHERE user_id = _uid;
  END IF;

  INSERT INTO public.iq_credits (user_id, credits)
  VALUES (_uid, _reward)
  ON CONFLICT (user_id) DO UPDATE SET credits = public.iq_credits.credits + EXCLUDED.credits;

  RETURN jsonb_build_object(
    'claimed', true,
    'streak', _new_streak,
    'reward', _reward
  );
END;
$$;
