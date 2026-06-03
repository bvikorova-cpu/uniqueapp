
-- User streaks table
CREATE TABLE public.user_streaks (
  user_id UUID NOT NULL PRIMARY KEY,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_streaks TO authenticated;
GRANT ALL ON public.user_streaks TO service_role;

ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own streak" ON public.user_streaks
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own streak" ON public.user_streaks
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own streak" ON public.user_streaks
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Daily activity log (one row per user per active day)
CREATE TABLE public.user_activity_days (
  user_id UUID NOT NULL,
  activity_date DATE NOT NULL,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, activity_date)
);

GRANT SELECT, INSERT, UPDATE ON public.user_activity_days TO authenticated;
GRANT ALL ON public.user_activity_days TO service_role;

ALTER TABLE public.user_activity_days ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own activity days" ON public.user_activity_days
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own activity days" ON public.user_activity_days
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own activity days" ON public.user_activity_days
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- RPC: record_daily_activity — call on any meaningful user action
CREATE OR REPLACE FUNCTION public.record_daily_activity(_xp INTEGER DEFAULT 0)
RETURNS TABLE(current_streak INTEGER, longest_streak INTEGER, total_xp INTEGER, is_new_day BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _today DATE := (now() AT TIME ZONE 'UTC')::date;
  _last DATE;
  _cur INTEGER;
  _long INTEGER;
  _new_day BOOLEAN := false;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  -- Upsert activity day
  INSERT INTO public.user_activity_days (user_id, activity_date, xp_earned)
  VALUES (_uid, _today, GREATEST(_xp, 0))
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET xp_earned = public.user_activity_days.xp_earned + GREATEST(_xp, 0);

  -- Init streak row
  INSERT INTO public.user_streaks (user_id) VALUES (_uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT last_active_date, current_streak, longest_streak
    INTO _last, _cur, _long
    FROM public.user_streaks WHERE user_id = _uid;

  IF _last IS NULL OR _last < _today THEN
    _new_day := true;
    IF _last = _today - INTERVAL '1 day' THEN
      _cur := _cur + 1;
    ELSE
      _cur := 1;
    END IF;
    _long := GREATEST(_long, _cur);
  END IF;

  UPDATE public.user_streaks
    SET current_streak = _cur,
        longest_streak = _long,
        last_active_date = _today,
        total_xp = total_xp + GREATEST(_xp, 0),
        updated_at = now()
    WHERE user_id = _uid;

  RETURN QUERY
    SELECT _cur, _long, (SELECT total_xp FROM public.user_streaks WHERE user_id = _uid), _new_day;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_daily_activity(INTEGER) TO authenticated;

-- RPC: get_streak_week — returns last 7 days (Mon..Sun of current week) with active flag
CREATE OR REPLACE FUNCTION public.get_streak_week()
RETURNS TABLE(day_date DATE, is_active BOOLEAN, xp_earned INTEGER)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _today DATE := (now() AT TIME ZONE 'UTC')::date;
  _monday DATE := _today - ((EXTRACT(ISODOW FROM _today)::INT - 1));
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  RETURN QUERY
  SELECT d::date AS day_date,
         EXISTS(SELECT 1 FROM public.user_activity_days
                WHERE user_id = _uid AND activity_date = d::date) AS is_active,
         COALESCE((SELECT xp_earned FROM public.user_activity_days
                   WHERE user_id = _uid AND activity_date = d::date), 0) AS xp_earned
  FROM generate_series(_monday, _monday + INTERVAL '6 days', INTERVAL '1 day') d;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_streak_week() TO authenticated;
