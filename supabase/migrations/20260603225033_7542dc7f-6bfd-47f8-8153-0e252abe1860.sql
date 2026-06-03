CREATE OR REPLACE FUNCTION public.record_daily_activity(_xp integer DEFAULT 0)
 RETURNS TABLE(current_streak integer, longest_streak integer, total_xp integer, is_new_day boolean)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  _uid UUID := auth.uid();
  _today DATE := (now() AT TIME ZONE 'UTC')::date;
  _last DATE;
  _cur INTEGER;
  _long INTEGER;
  _new_day BOOLEAN := false;
  _total INTEGER;
BEGIN
  IF _uid IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  INSERT INTO public.user_activity_days (user_id, activity_date, xp_earned)
  VALUES (_uid, _today, GREATEST(_xp, 0))
  ON CONFLICT (user_id, activity_date)
  DO UPDATE SET xp_earned = public.user_activity_days.xp_earned + GREATEST(_xp, 0);

  INSERT INTO public.user_streaks (user_id) VALUES (_uid)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT us.last_active_date, us.current_streak, us.longest_streak
    INTO _last, _cur, _long
    FROM public.user_streaks us WHERE us.user_id = _uid;

  IF _last IS NULL OR _last < _today THEN
    _new_day := true;
    IF _last = _today - INTERVAL '1 day' THEN
      _cur := _cur + 1;
    ELSE
      _cur := 1;
    END IF;
    _long := GREATEST(COALESCE(_long, 0), _cur);
  END IF;

  UPDATE public.user_streaks us
    SET current_streak = _cur,
        longest_streak = _long,
        last_active_date = _today,
        total_xp = us.total_xp + GREATEST(_xp, 0),
        updated_at = now()
    WHERE us.user_id = _uid;

  SELECT us.total_xp INTO _total FROM public.user_streaks us WHERE us.user_id = _uid;

  current_streak := _cur;
  longest_streak := _long;
  total_xp := _total;
  is_new_day := _new_day;
  RETURN NEXT;
END;
$function$;