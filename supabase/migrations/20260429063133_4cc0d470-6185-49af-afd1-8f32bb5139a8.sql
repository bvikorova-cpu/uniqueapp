-- Admin-only RPCs for XP audit investigation.
-- Returns merged XP events for any user and a reconciliation summary
-- (sum of recorded XP events vs user_points.total_points).

-- 1) Merged XP events for a target user
CREATE OR REPLACE FUNCTION public.admin_get_xp_events(_target_user_id uuid)
RETURNS TABLE (
  event_id text,
  source text,
  event_type text,
  description text,
  xp integer,
  occurred_at timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;

  RETURN QUERY
  SELECT
    ('ad-' || r.id::text)               AS event_id,
    'ad'::text                          AS source,
    'Rewarded ad view'::text            AS event_type,
    ('Section: ' || COALESCE(r.section_key, 'unknown')) AS description,
    COALESCE(r.xp_awarded, 0)           AS xp,
    r.created_at                        AS occurred_at
  FROM public.rewarded_ad_views r
  WHERE r.user_id = _target_user_id

  UNION ALL
  SELECT
    ('dxp-' || d.id::text),
    'daily',
    'Daily XP claim',
    CASE WHEN d.ad_watched THEN 'Daily claim (ad-boosted)' ELSE 'Daily claim' END,
    COALESCE(d.xp_earned, 0),
    d.claimed_at
  FROM public.daily_xp_claims d
  WHERE d.user_id = _target_user_id

  UNION ALL
  SELECT
    ('dr-' || dr.id::text),
    CASE WHEN COALESCE(dr.day_streak, 1) > 1 THEN 'streak' ELSE 'daily' END,
    CASE WHEN COALESCE(dr.day_streak, 1) > 1 THEN 'Login streak bonus' ELSE 'Daily login reward' END,
    ('Day ' || COALESCE(dr.day_streak, 1)::text || ' of streak'),
    COALESCE(dr.points_earned, 0),
    dr.claimed_at
  FROM public.daily_rewards dr
  WHERE dr.user_id = _target_user_id

  UNION ALL
  SELECT
    ('act-' || a.id::text),
    'activity',
    a.activity_type,
    REPLACE(a.activity_type, '_', ' '),
    COALESCE(a.points_earned, 0),
    a.created_at
  FROM public.activity_logs a
  WHERE a.user_id = _target_user_id
    AND COALESCE(a.points_earned, 0) > 0

  ORDER BY occurred_at DESC
  LIMIT 2000;
END;
$$;

-- 2) Reconciliation summary: per-source totals + comparison to user_points
CREATE OR REPLACE FUNCTION public.admin_get_xp_reconciliation(_target_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ad int := 0;
  v_daily_xp int := 0;
  v_daily_rewards int := 0;
  v_activity int := 0;
  v_total_recorded int := 0;
  v_user_points int := 0;
  v_level int := 1;
  v_streak int := 0;
  v_event_count int := 0;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;

  SELECT COALESCE(SUM(xp_awarded), 0), COUNT(*)
    INTO v_ad, v_event_count
    FROM public.rewarded_ad_views WHERE user_id = _target_user_id;

  SELECT COALESCE(SUM(xp_earned), 0) INTO v_daily_xp
    FROM public.daily_xp_claims WHERE user_id = _target_user_id;

  SELECT COALESCE(SUM(points_earned), 0) INTO v_daily_rewards
    FROM public.daily_rewards WHERE user_id = _target_user_id;

  SELECT COALESCE(SUM(points_earned), 0) INTO v_activity
    FROM public.activity_logs
    WHERE user_id = _target_user_id AND COALESCE(points_earned, 0) > 0;

  v_total_recorded := v_ad + v_daily_xp + v_daily_rewards + v_activity;

  SELECT COALESCE(total_points, 0), COALESCE(level, 1), COALESCE(login_streak, 0)
    INTO v_user_points, v_level, v_streak
    FROM public.user_points WHERE user_id = _target_user_id;

  RETURN jsonb_build_object(
    'user_id', _target_user_id,
    'sources', jsonb_build_object(
      'rewarded_ads_xp', v_ad,
      'daily_xp_claims_xp', v_daily_xp,
      'daily_rewards_xp', v_daily_rewards,
      'activity_logs_xp', v_activity
    ),
    'total_recorded_xp', v_total_recorded,
    'user_points_total', v_user_points,
    'level', v_level,
    'login_streak', v_streak,
    'mismatch', v_user_points - v_total_recorded,
    'is_consistent', (v_user_points = v_total_recorded),
    'rewarded_ad_view_count', v_event_count
  );
END;
$$;

-- 3) Admin-only profile search (by name / id) — limited to public columns
CREATE OR REPLACE FUNCTION public.admin_search_users_for_xp_audit(_query text)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  total_points integer,
  level integer
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin'::public.app_role) THEN
    RAISE EXCEPTION 'forbidden: admin role required';
  END IF;

  RETURN QUERY
  SELECT
    p.id            AS user_id,
    p.full_name,
    p.avatar_url,
    COALESCE(up.total_points, 0) AS total_points,
    COALESCE(up.level, 1)        AS level
  FROM public.profiles p
  LEFT JOIN public.user_points up ON up.user_id = p.id
  WHERE _query IS NOT NULL
    AND length(trim(_query)) >= 2
    AND (
      p.id::text ILIKE '%' || _query || '%'
      OR COALESCE(p.full_name, '') ILIKE '%' || _query || '%'
    )
  ORDER BY COALESCE(up.total_points, 0) DESC
  LIMIT 50;
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_get_xp_events(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_xp_reconciliation(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_search_users_for_xp_audit(text) TO authenticated;