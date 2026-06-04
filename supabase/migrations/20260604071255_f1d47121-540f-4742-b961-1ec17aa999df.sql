
CREATE TABLE IF NOT EXISTS public.user_job_streaks (
  user_id uuid PRIMARY KEY,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_check_in_date date,
  total_check_ins integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.user_job_streaks TO authenticated;
GRANT ALL ON public.user_job_streaks TO service_role;

ALTER TABLE public.user_job_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own job streak"
  ON public.user_job_streaks FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own job streak"
  ON public.user_job_streaks FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own job streak"
  ON public.user_job_streaks FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.record_job_checkin()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _today date := (now() AT TIME ZONE 'UTC')::date;
  _row public.user_job_streaks;
  _new_streak integer;
  _new_longest integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('error', 'not_authenticated');
  END IF;

  SELECT * INTO _row FROM public.user_job_streaks WHERE user_id = _uid;

  IF _row.user_id IS NULL THEN
    INSERT INTO public.user_job_streaks (user_id, current_streak, longest_streak, last_check_in_date, total_check_ins)
    VALUES (_uid, 1, 1, _today, 1)
    RETURNING * INTO _row;
    PERFORM public.record_daily_activity(5);
    RETURN jsonb_build_object(
      'current_streak', _row.current_streak,
      'longest_streak', _row.longest_streak,
      'total_check_ins', _row.total_check_ins,
      'already_checked', false,
      'xp_awarded', 5
    );
  END IF;

  IF _row.last_check_in_date = _today THEN
    RETURN jsonb_build_object(
      'current_streak', _row.current_streak,
      'longest_streak', _row.longest_streak,
      'total_check_ins', _row.total_check_ins,
      'already_checked', true,
      'xp_awarded', 0
    );
  END IF;

  IF _row.last_check_in_date = _today - 1 THEN
    _new_streak := _row.current_streak + 1;
  ELSE
    _new_streak := 1;
  END IF;

  _new_longest := GREATEST(_row.longest_streak, _new_streak);

  UPDATE public.user_job_streaks
    SET current_streak = _new_streak,
        longest_streak = _new_longest,
        last_check_in_date = _today,
        total_check_ins = total_check_ins + 1,
        updated_at = now()
    WHERE user_id = _uid
    RETURNING * INTO _row;

  PERFORM public.record_daily_activity(5);

  RETURN jsonb_build_object(
    'current_streak', _row.current_streak,
    'longest_streak', _row.longest_streak,
    'total_check_ins', _row.total_check_ins,
    'already_checked', false,
    'xp_awarded', 5
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_job_checkin() TO authenticated;
