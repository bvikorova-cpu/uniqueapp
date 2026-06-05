CREATE INDEX IF NOT EXISTS idx_xp_events_created_user ON public.xp_events (created_at DESC, user_id);

CREATE OR REPLACE FUNCTION public.rewards_xp_leaderboard(_period text, _limit int DEFAULT 50)
RETURNS TABLE(user_id uuid, total bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _since timestamptz;
BEGIN
  IF _period = 'alltime' THEN
    RETURN QUERY
      SELECT up.user_id, COALESCE(up.total_points, 0)::bigint AS total
      FROM public.user_points up
      WHERE COALESCE(up.total_points, 0) > 0
      ORDER BY up.total_points DESC NULLS LAST
      LIMIT _limit;
    RETURN;
  END IF;

  _since := now() - (CASE WHEN _period = 'weekly' THEN interval '7 days' ELSE interval '30 days' END);

  RETURN QUERY
    SELECT e.user_id, SUM(e.amount)::bigint AS total
    FROM public.xp_events e
    WHERE e.created_at >= _since AND e.amount > 0
    GROUP BY e.user_id
    HAVING SUM(e.amount) > 0
    ORDER BY total DESC
    LIMIT _limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rewards_xp_leaderboard(text, int) TO anon, authenticated, service_role;