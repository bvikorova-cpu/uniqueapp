CREATE OR REPLACE FUNCTION public.badge_hunters_leaderboard(_limit integer DEFAULT 20)
RETURNS TABLE(
  rank integer,
  user_id uuid,
  full_name text,
  avatar_url text,
  badge_count integer,
  total_points integer,
  level integer,
  last_badge_at timestamptz
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH counts AS (
    SELECT ub.user_id,
           COUNT(*)::int AS badge_count,
           MAX(ub.earned_at) AS last_badge_at
    FROM user_badges ub
    WHERE ub.user_id <> '00000000-0000-0000-0000-000000000000'::uuid
    GROUP BY ub.user_id
  )
  SELECT ROW_NUMBER() OVER (ORDER BY c.badge_count DESC, c.last_badge_at ASC NULLS LAST)::int AS rank,
         c.user_id,
         COALESCE(NULLIF(TRIM(p.full_name), ''), p.username, 'Unique member') AS full_name,
         p.avatar_url,
         c.badge_count,
         COALESCE(up.total_points, 0)::int AS total_points,
         COALESCE(up.level, 1)::int AS level,
         c.last_badge_at
  FROM counts c
  JOIN profiles p ON p.id = c.user_id
  LEFT JOIN user_points up ON up.user_id = c.user_id
  ORDER BY c.badge_count DESC, c.last_badge_at ASC NULLS LAST
  LIMIT GREATEST(1, LEAST(COALESCE(_limit, 20), 100));
$$;

REVOKE ALL ON FUNCTION public.badge_hunters_leaderboard(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.badge_hunters_leaderboard(integer) TO authenticated, service_role;