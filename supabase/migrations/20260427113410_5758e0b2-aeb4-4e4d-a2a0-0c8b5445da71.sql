-- DAU / MAU / WAU + denný časový rad pre admin dashboard.
-- Aktívny user = user, ktorý má aspoň jeden záznam v activity_feed
-- ALEBO last_seen v user_activity v danom okne.

CREATE OR REPLACE FUNCTION public.get_engagement_metrics(p_days int DEFAULT 30)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_dau int;
  v_wau int;
  v_mau int;
  v_total_users int;
  v_new_users int;
  v_active_users int;
  v_stickiness numeric;
BEGIN
  -- Iba admin smie čítať
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  WITH active AS (
    SELECT user_id, created_at::date AS day FROM public.activity_feed
    WHERE created_at >= now() - (p_days || ' days')::interval
    UNION
    SELECT user_id, last_seen::date AS day FROM public.user_activity
    WHERE last_seen >= now() - (p_days || ' days')::interval
  )
  SELECT
    count(DISTINCT user_id) FILTER (WHERE day >= (now() - interval '1 day')::date),
    count(DISTINCT user_id) FILTER (WHERE day >= (now() - interval '7 days')::date),
    count(DISTINCT user_id) FILTER (WHERE day >= (now() - interval '30 days')::date),
    count(DISTINCT user_id)
  INTO v_dau, v_wau, v_mau, v_active_users
  FROM active;

  SELECT count(*) INTO v_total_users FROM public.profiles;
  SELECT count(*) INTO v_new_users FROM public.profiles
    WHERE created_at >= now() - (p_days || ' days')::interval;

  v_stickiness := CASE WHEN v_mau > 0 THEN round((v_dau::numeric / v_mau::numeric) * 100, 2) ELSE 0 END;

  RETURN jsonb_build_object(
    'dau', COALESCE(v_dau, 0),
    'wau', COALESCE(v_wau, 0),
    'mau', COALESCE(v_mau, 0),
    'total_users', COALESCE(v_total_users, 0),
    'new_users', COALESCE(v_new_users, 0),
    'active_users_window', COALESCE(v_active_users, 0),
    'stickiness_pct', v_stickiness,
    'window_days', p_days,
    'generated_at', now()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_dau_series(p_days int DEFAULT 30)
RETURNS TABLE(day date, active_users int, new_users int)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'Forbidden: admin role required';
  END IF;

  RETURN QUERY
  WITH days AS (
    SELECT generate_series(
      (now() - (p_days || ' days')::interval)::date,
      now()::date,
      interval '1 day'
    )::date AS d
  ),
  active AS (
    SELECT user_id, created_at::date AS day FROM public.activity_feed
    WHERE created_at >= now() - (p_days || ' days')::interval
    UNION
    SELECT user_id, last_seen::date AS day FROM public.user_activity
    WHERE last_seen >= now() - (p_days || ' days')::interval
  ),
  signups AS (
    SELECT created_at::date AS day, count(*)::int AS n
    FROM public.profiles
    WHERE created_at >= now() - (p_days || ' days')::interval
    GROUP BY 1
  )
  SELECT
    days.d,
    COALESCE((SELECT count(DISTINCT a.user_id)::int FROM active a WHERE a.day = days.d), 0),
    COALESCE((SELECT n FROM signups s WHERE s.day = days.d), 0)
  FROM days
  ORDER BY days.d;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_engagement_metrics(int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_dau_series(int) TO authenticated;