CREATE OR REPLACE FUNCTION public.admin_get_xp_reconciliation_report(
  _only_mismatches boolean DEFAULT true,
  _min_abs_mismatch integer DEFAULT 1,
  _limit integer DEFAULT 200
)
RETURNS TABLE (
  user_id uuid,
  full_name text,
  avatar_url text,
  rewarded_ads_xp bigint,
  daily_xp_claims_xp bigint,
  daily_rewards_xp bigint,
  activity_logs_xp bigint,
  total_recorded_xp bigint,
  user_points_total integer,
  level integer,
  mismatch bigint,
  is_consistent boolean,
  last_event_at timestamptz
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
  WITH ad AS (
    SELECT user_id, COALESCE(SUM(xp_awarded), 0)::bigint AS xp, MAX(created_at) AS last_at
    FROM public.rewarded_ad_views GROUP BY user_id
  ),
  dxp AS (
    SELECT user_id, COALESCE(SUM(xp_earned), 0)::bigint AS xp, MAX(claimed_at) AS last_at
    FROM public.daily_xp_claims GROUP BY user_id
  ),
  dr AS (
    SELECT user_id, COALESCE(SUM(points_earned), 0)::bigint AS xp, MAX(claimed_at) AS last_at
    FROM public.daily_rewards GROUP BY user_id
  ),
  act AS (
    SELECT user_id, COALESCE(SUM(points_earned), 0)::bigint AS xp, MAX(created_at) AS last_at
    FROM public.activity_logs WHERE COALESCE(points_earned, 0) > 0 GROUP BY user_id
  ),
  combined AS (
    SELECT u.user_id FROM ad u
    UNION SELECT u.user_id FROM dxp u
    UNION SELECT u.user_id FROM dr u
    UNION SELECT u.user_id FROM act u
    UNION SELECT up.user_id FROM public.user_points up WHERE up.total_points > 0
  ),
  joined AS (
    SELECT
      c.user_id,
      COALESCE(ad.xp, 0)  AS rewarded_ads_xp,
      COALESCE(dxp.xp, 0) AS daily_xp_claims_xp,
      COALESCE(dr.xp, 0)  AS daily_rewards_xp,
      COALESCE(act.xp, 0) AS activity_logs_xp,
      (COALESCE(ad.xp,0) + COALESCE(dxp.xp,0) + COALESCE(dr.xp,0) + COALESCE(act.xp,0))::bigint AS total_recorded_xp,
      COALESCE(up.total_points, 0) AS user_points_total,
      COALESCE(up.level, 1)        AS level,
      GREATEST(
        COALESCE(ad.last_at,  'epoch'::timestamptz),
        COALESCE(dxp.last_at, 'epoch'::timestamptz),
        COALESCE(dr.last_at,  'epoch'::timestamptz),
        COALESCE(act.last_at, 'epoch'::timestamptz)
      ) AS last_event_at
    FROM combined c
    LEFT JOIN ad  ON ad.user_id  = c.user_id
    LEFT JOIN dxp ON dxp.user_id = c.user_id
    LEFT JOIN dr  ON dr.user_id  = c.user_id
    LEFT JOIN act ON act.user_id = c.user_id
    LEFT JOIN public.user_points up ON up.user_id = c.user_id
  )
  SELECT
    j.user_id,
    p.full_name,
    p.avatar_url,
    j.rewarded_ads_xp,
    j.daily_xp_claims_xp,
    j.daily_rewards_xp,
    j.activity_logs_xp,
    j.total_recorded_xp,
    j.user_points_total,
    j.level,
    (j.user_points_total - j.total_recorded_xp)::bigint AS mismatch,
    (j.user_points_total = j.total_recorded_xp)        AS is_consistent,
    NULLIF(j.last_event_at, 'epoch'::timestamptz)      AS last_event_at
  FROM joined j
  LEFT JOIN public.profiles p ON p.id = j.user_id
  WHERE
    (NOT _only_mismatches OR j.user_points_total <> j.total_recorded_xp)
    AND ABS(j.user_points_total - j.total_recorded_xp) >= GREATEST(_min_abs_mismatch, 0)
  ORDER BY ABS(j.user_points_total - j.total_recorded_xp) DESC, j.user_points_total DESC
  LIMIT GREATEST(LEAST(_limit, 1000), 1);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_get_xp_reconciliation_report(boolean, integer, integer) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.admin_get_xp_reconciliation_report(boolean, integer, integer) TO authenticated;