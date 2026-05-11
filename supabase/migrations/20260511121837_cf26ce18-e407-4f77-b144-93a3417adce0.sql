
CREATE TABLE IF NOT EXISTS public.iq_daily_streaks (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_claim_date DATE,
  total_credits_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.iq_daily_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own iq streak"
  ON public.iq_daily_streaks FOR SELECT
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.claim_iq_daily_streak()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_today DATE := (now() AT TIME ZONE 'UTC')::DATE;
  v_row public.iq_daily_streaks;
  v_new_streak INTEGER;
  v_reward INTEGER;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_row FROM public.iq_daily_streaks WHERE user_id = v_user;

  IF v_row.user_id IS NULL THEN
    v_new_streak := 1;
  ELSIF v_row.last_claim_date = v_today THEN
    RETURN jsonb_build_object('claimed', false, 'reason', 'already_claimed', 'streak', v_row.current_streak);
  ELSIF v_row.last_claim_date = v_today - INTERVAL '1 day' THEN
    v_new_streak := v_row.current_streak + 1;
  ELSE
    v_new_streak := 1;
  END IF;

  v_reward := CASE
    WHEN v_new_streak >= 30 THEN 10
    WHEN v_new_streak >= 14 THEN 5
    WHEN v_new_streak >= 7 THEN 3
    WHEN v_new_streak >= 3 THEN 2
    ELSE 1
  END;

  INSERT INTO public.iq_daily_streaks (user_id, current_streak, longest_streak, last_claim_date, total_credits_earned)
  VALUES (v_user, v_new_streak, v_new_streak, v_today, v_reward)
  ON CONFLICT (user_id) DO UPDATE SET
    current_streak = v_new_streak,
    longest_streak = GREATEST(public.iq_daily_streaks.longest_streak, v_new_streak),
    last_claim_date = v_today,
    total_credits_earned = public.iq_daily_streaks.total_credits_earned + v_reward,
    updated_at = now();

  INSERT INTO public.iq_credits (user_id, balance)
  VALUES (v_user, v_reward)
  ON CONFLICT (user_id) DO UPDATE SET balance = public.iq_credits.balance + v_reward;

  RETURN jsonb_build_object('claimed', true, 'streak', v_new_streak, 'reward', v_reward);
END;
$$;

CREATE TRIGGER trg_iq_daily_streaks_updated
  BEFORE UPDATE ON public.iq_daily_streaks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
