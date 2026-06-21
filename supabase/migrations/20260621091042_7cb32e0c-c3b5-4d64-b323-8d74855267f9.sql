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
    RETURN;
  END IF;

  RETURN QUERY
  SELECT d::date AS day_date,
         EXISTS(SELECT 1 FROM public.user_activity_days uad
                WHERE uad.user_id = _uid AND uad.activity_date = d::date) AS is_active,
         COALESCE((SELECT uad.xp_earned FROM public.user_activity_days uad
                   WHERE uad.user_id = _uid AND uad.activity_date = d::date), 0) AS xp_earned
  FROM generate_series(_monday, _monday + INTERVAL '6 days', INTERVAL '1 day') d;
END;
$$;