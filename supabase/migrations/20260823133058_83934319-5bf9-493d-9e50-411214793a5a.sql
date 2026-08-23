CREATE OR REPLACE FUNCTION public.rewards_xp_leaderboard_full(_period text DEFAULT 'alltime', _limit integer DEFAULT 50)
RETURNS TABLE(
  user_id uuid,
  total bigint,
  display_name text,
  avatar_url text,
  level integer,
  login_streak integer,
  badges integer
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _since timestamptz;
BEGIN
  IF _limit IS NULL OR _limit <= 0 OR _limit > 100 THEN
    _limit := 50;
  END IF;

  IF _period = 'alltime' THEN
    RETURN QUERY
    WITH tot AS (
      SELECT up.user_id AS uid, COALESCE(up.total_points,0)::bigint AS total
      FROM public.user_points up
      WHERE COALESCE(up.total_points,0) > 0
        AND up.user_id <> '00000000-0000-0000-0000-000000000000'::uuid
      ORDER BY up.total_points DESC NULLS LAST
      LIMIT _limit
    )
    SELECT t.uid,
           t.total,
           COALESCE(NULLIF(TRIM(p.full_name), ''), NULLIF(TRIM(p.username), ''), 'Unique member')::text,
           p.avatar_url::text,
           COALESCE(up2.level, 1)::integer,
           COALESCE(up2.login_streak, 0)::integer,
           COALESCE((SELECT COUNT(*) FROM public.user_badges ub WHERE ub.user_id = t.uid), 0)::integer
    FROM tot t
    LEFT JOIN public.profiles p ON p.id = t.uid
    LEFT JOIN public.user_points up2 ON up2.user_id = t.uid
    ORDER BY t.total DESC;
    RETURN;
  END IF;

  _since := now() - (CASE WHEN _period = 'weekly' THEN interval '7 days' ELSE interval '30 days' END);

  RETURN QUERY
  WITH tot AS (
    SELECT e.user_id AS uid, SUM(e.amount)::bigint AS total
    FROM public.xp_events e
    WHERE e.created_at >= _since
      AND e.amount > 0
      AND e.user_id <> '00000000-0000-0000-0000-000000000000'::uuid
    GROUP BY e.user_id
    HAVING SUM(e.amount) > 0
    ORDER BY SUM(e.amount) DESC
    LIMIT _limit
  )
  SELECT t.uid,
         t.total,
         COALESCE(NULLIF(TRIM(p.full_name), ''), NULLIF(TRIM(p.username), ''), 'Unique member')::text,
         p.avatar_url::text,
         COALESCE(up2.level, 1)::integer,
         COALESCE(up2.login_streak, 0)::integer,
         COALESCE((SELECT COUNT(*) FROM public.user_badges ub WHERE ub.user_id = t.uid), 0)::integer
  FROM tot t
  LEFT JOIN public.profiles p ON p.id = t.uid
  LEFT JOIN public.user_points up2 ON up2.user_id = t.uid
  ORDER BY t.total DESC;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.rewards_xp_leaderboard_full(text, integer) TO authenticated, anon, service_role;