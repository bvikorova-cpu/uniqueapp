-- IQ user badges table
CREATE TABLE IF NOT EXISTS public.iq_user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  code TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, code)
);

CREATE INDEX IF NOT EXISTS idx_iq_user_badges_user ON public.iq_user_badges(user_id);

ALTER TABLE public.iq_user_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own iq badges" ON public.iq_user_badges;
CREATE POLICY "Users view own iq badges"
ON public.iq_user_badges FOR SELECT
USING (auth.uid() = user_id);

-- Award a single badge (idempotent) for current user
CREATE OR REPLACE FUNCTION public.award_iq_badge(_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _inserted BOOLEAN := false;
BEGIN
  IF _uid IS NULL THEN RETURN false; END IF;

  INSERT INTO public.iq_user_badges (user_id, code)
  VALUES (_uid, _code)
  ON CONFLICT (user_id, code) DO NOTHING
  RETURNING true INTO _inserted;

  RETURN COALESCE(_inserted, false);
END;
$$;

-- Auto-check + award all earned badges based on user stats
CREATE OR REPLACE FUNCTION public.check_and_award_iq_badges()
RETURNS TEXT[]
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _awarded TEXT[] := ARRAY[]::TEXT[];
  _best INT := 0;
  _total INT := 0;
  _streak INT := 0;
  _duel_wins INT := 0;
  _tools_used INT := 0;
  _has_tournament BOOLEAN := false;
  _won_tournament BOOLEAN := false;
BEGIN
  IF _uid IS NULL THEN RETURN _awarded; END IF;

  -- Pull stats (best effort; tables may not all exist in every env)
  BEGIN
    SELECT COALESCE(best_iq,0), COALESCE(total_tests,0), COALESCE(longest_streak,0)
      INTO _best, _total, _streak
    FROM public.iq_user_stats WHERE user_id = _uid;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN
    SELECT GREATEST(_streak, COALESCE(longest_streak,0))
      INTO _streak
    FROM public.iq_daily_streaks WHERE user_id = _uid;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  -- Helper to award + track
  IF _total >= 1 THEN
    IF public.award_iq_badge('first_test') THEN _awarded := _awarded || 'first_test'; END IF;
  END IF;
  IF _total >= 10 THEN
    IF public.award_iq_badge('scholar') THEN _awarded := _awarded || 'scholar'; END IF;
  END IF;
  IF _best >= 100 THEN
    IF public.award_iq_badge('iq_100') THEN _awarded := _awarded || 'iq_100'; END IF;
  END IF;
  IF _best >= 120 THEN
    IF public.award_iq_badge('iq_120') THEN _awarded := _awarded || 'iq_120'; END IF;
  END IF;
  IF _best >= 140 THEN
    IF public.award_iq_badge('iq_140') THEN _awarded := _awarded || 'iq_140'; END IF;
  END IF;
  IF _best >= 160 THEN
    IF public.award_iq_badge('iq_160') THEN _awarded := _awarded || 'iq_160'; END IF;
  END IF;
  IF _streak >= 7 THEN
    IF public.award_iq_badge('streak_7') THEN _awarded := _awarded || 'streak_7'; END IF;
  END IF;
  IF _streak >= 30 THEN
    IF public.award_iq_badge('streak_30') THEN _awarded := _awarded || 'streak_30'; END IF;
  END IF;
  IF _streak >= 100 THEN
    IF public.award_iq_badge('streak_100') THEN _awarded := _awarded || 'streak_100'; END IF;
  END IF;

  RETURN _awarded;
END;
$$;