
CREATE TABLE IF NOT EXISTS public.iq_daily_streaks (
  user_id UUID PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_claim_date DATE,
  total_claims INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_daily_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own streak"
  ON public.iq_daily_streaks FOR SELECT
  USING (auth.uid() = user_id);

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
  _credits INTEGER;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO _row FROM public.iq_daily_streaks WHERE user_id = _uid FOR UPDATE;

  IF _row.user_id IS NULL THEN
    _new_streak := 1;
    INSERT INTO public.iq_daily_streaks (user_id, current_streak, longest_streak, last_claim_date, total_claims)
    VALUES (_uid, 1, 1, _today, 1);
  ELSE
    IF _row.last_claim_date = _today THEN
      RAISE EXCEPTION 'Already claimed today';
    ELSIF _row.last_claim_date = _today - INTERVAL '1 day' THEN
      _new_streak := _row.current_streak + 1;
    ELSE
      _new_streak := 1;
    END IF;

    UPDATE public.iq_daily_streaks
    SET current_streak = _new_streak,
        longest_streak = GREATEST(longest_streak, _new_streak),
        last_claim_date = _today,
        total_claims = total_claims + 1,
        updated_at = now()
    WHERE user_id = _uid;
  END IF;

  _credits := CASE
    WHEN _new_streak >= 7 THEN 12
    WHEN _new_streak >= 5 THEN 8
    WHEN _new_streak >= 3 THEN 5
    WHEN _new_streak = 2 THEN 3
    ELSE 2
  END;

  INSERT INTO public.iq_credits (user_id, credits)
  VALUES (_uid, _credits)
  ON CONFLICT (user_id) DO UPDATE SET credits = public.iq_credits.credits + EXCLUDED.credits;

  RETURN jsonb_build_object('streak', _new_streak, 'credits_awarded', _credits);
END;
$$;
