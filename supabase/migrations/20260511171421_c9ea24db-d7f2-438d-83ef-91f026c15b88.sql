CREATE OR REPLACE FUNCTION public.get_iq_milestones()
RETURNS TABLE (
  total_tests INTEGER,
  first_test_at TIMESTAMPTZ,
  best_iq INTEGER,
  best_iq_at TIMESTAMPTZ,
  first_120_at TIMESTAMPTZ,
  first_130_at TIMESTAMPTZ,
  first_140_at TIMESTAMPTZ,
  longest_daily_streak INTEGER,
  categories_tried INTEGER
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _streak INTEGER := 0;
  _best_streak INTEGER := 0;
  _prev DATE;
  _row RECORD;
BEGIN
  IF _uid IS NULL THEN RETURN; END IF;

  FOR _row IN
    SELECT DISTINCT date_trunc('day', created_at)::DATE AS d
    FROM iq_test_results WHERE user_id = _uid ORDER BY d
  LOOP
    IF _prev IS NULL OR _row.d = _prev + 1 THEN
      _streak := _streak + 1;
    ELSE
      _streak := 1;
    END IF;
    IF _streak > _best_streak THEN _best_streak := _streak; END IF;
    _prev := _row.d;
  END LOOP;

  RETURN QUERY
  SELECT
    COALESCE(COUNT(*), 0)::INTEGER,
    MIN(created_at),
    COALESCE(MAX(iq_score), 0)::INTEGER,
    (SELECT created_at FROM iq_test_results WHERE user_id = _uid ORDER BY iq_score DESC, created_at ASC LIMIT 1),
    (SELECT MIN(created_at) FROM iq_test_results WHERE user_id = _uid AND iq_score >= 120),
    (SELECT MIN(created_at) FROM iq_test_results WHERE user_id = _uid AND iq_score >= 130),
    (SELECT MIN(created_at) FROM iq_test_results WHERE user_id = _uid AND iq_score >= 140),
    _best_streak,
    COALESCE((SELECT COUNT(DISTINCT category)::INTEGER FROM iq_test_results WHERE user_id = _uid), 0)
  FROM iq_test_results
  WHERE user_id = _uid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_iq_milestones() TO authenticated;