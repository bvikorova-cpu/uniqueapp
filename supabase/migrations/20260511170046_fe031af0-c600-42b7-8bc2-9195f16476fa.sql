CREATE OR REPLACE FUNCTION public.get_iq_performance_insights()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _by_category JSONB;
  _avg_7  NUMERIC;
  _avg_30 NUMERIC;
  _avg_prev_30 NUMERIC;
  _avg_time NUMERIC;
  _total INT;
  _focus TEXT;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('error', 'unauthorized');
  END IF;

  SELECT COUNT(*)::INT INTO _total
  FROM public.iq_test_results
  WHERE user_id = _uid;

  IF _total = 0 THEN
    RETURN jsonb_build_object('total_tests', 0);
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'category', category,
    'avg_iq', ROUND(avg_iq::NUMERIC, 1),
    'tests', tests,
    'accuracy', ROUND(accuracy::NUMERIC, 1)
  ) ORDER BY avg_iq DESC)
  INTO _by_category
  FROM (
    SELECT
      COALESCE(category, 'general') AS category,
      AVG(iq_score) AS avg_iq,
      COUNT(*) AS tests,
      AVG(
        CASE WHEN total_questions > 0
          THEN (correct_count::NUMERIC / total_questions::NUMERIC) * 100
          ELSE 0 END
      ) AS accuracy
    FROM public.iq_test_results
    WHERE user_id = _uid
    GROUP BY COALESCE(category, 'general')
  ) c;

  SELECT AVG(iq_score) INTO _avg_7
  FROM public.iq_test_results
  WHERE user_id = _uid AND completed_at >= now() - INTERVAL '7 days';

  SELECT AVG(iq_score) INTO _avg_30
  FROM public.iq_test_results
  WHERE user_id = _uid AND completed_at >= now() - INTERVAL '30 days';

  SELECT AVG(iq_score) INTO _avg_prev_30
  FROM public.iq_test_results
  WHERE user_id = _uid
    AND completed_at >= now() - INTERVAL '60 days'
    AND completed_at <  now() - INTERVAL '30 days';

  SELECT AVG(time_taken::NUMERIC / NULLIF(total_questions, 0))
  INTO _avg_time
  FROM public.iq_test_results
  WHERE user_id = _uid AND total_questions > 0;

  SELECT category INTO _focus
  FROM (
    SELECT COALESCE(category,'general') AS category, AVG(iq_score) AS a
    FROM public.iq_test_results
    WHERE user_id = _uid
    GROUP BY COALESCE(category,'general')
    HAVING COUNT(*) >= 1
    ORDER BY a ASC
    LIMIT 1
  ) f;

  RETURN jsonb_build_object(
    'total_tests', _total,
    'avg_7d',  ROUND(COALESCE(_avg_7, 0)::NUMERIC, 1),
    'avg_30d', ROUND(COALESCE(_avg_30, 0)::NUMERIC, 1),
    'trend_30d', ROUND(COALESCE(_avg_30, 0)::NUMERIC - COALESCE(_avg_prev_30, 0)::NUMERIC, 1),
    'avg_seconds_per_question', ROUND(COALESCE(_avg_time, 0)::NUMERIC, 1),
    'by_category', COALESCE(_by_category, '[]'::JSONB),
    'recommended_focus', _focus
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_iq_performance_insights() TO authenticated;
