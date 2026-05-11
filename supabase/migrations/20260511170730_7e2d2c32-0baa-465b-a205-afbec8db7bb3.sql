CREATE OR REPLACE FUNCTION public.get_iq_weekly_recap()
RETURNS TABLE (
  tests_this_week INTEGER,
  tests_last_week INTEGER,
  avg_iq_this_week NUMERIC,
  best_iq_this_week INTEGER,
  iq_delta NUMERIC,
  top_category TEXT,
  total_time_seconds INTEGER,
  week_start DATE
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _week_start DATE := date_trunc('week', CURRENT_DATE)::DATE;
  _prev_start DATE := _week_start - 7;
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;

  RETURN QUERY
  WITH this_week AS (
    SELECT * FROM iq_test_results
    WHERE user_id = _uid AND created_at >= _week_start
  ),
  last_week AS (
    SELECT * FROM iq_test_results
    WHERE user_id = _uid
      AND created_at >= _prev_start
      AND created_at < _week_start
  ),
  cat AS (
    SELECT category, AVG(iq_score) AS avg_iq
    FROM this_week
    GROUP BY category
    ORDER BY avg_iq DESC
    LIMIT 1
  )
  SELECT
    COALESCE((SELECT COUNT(*) FROM this_week), 0)::INTEGER,
    COALESCE((SELECT COUNT(*) FROM last_week), 0)::INTEGER,
    COALESCE((SELECT ROUND(AVG(iq_score)::NUMERIC, 1) FROM this_week), 0),
    COALESCE((SELECT MAX(iq_score) FROM this_week), 0)::INTEGER,
    COALESCE((SELECT ROUND(AVG(iq_score)::NUMERIC, 1) FROM this_week), 0)
      - COALESCE((SELECT ROUND(AVG(iq_score)::NUMERIC, 1) FROM last_week), 0),
    (SELECT category FROM cat),
    COALESCE((SELECT SUM(time_taken)::INTEGER FROM this_week), 0),
    _week_start;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_iq_weekly_recap() TO authenticated;