CREATE OR REPLACE FUNCTION public.get_kitchenstars_leaderboard(_limit int DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  duels bigint,
  total_votes bigint,
  wins bigint,
  kitchen_xp int
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH stats AS (
    SELECT
      p.user_id,
      COUNT(DISTINCT p.battle_id) AS duels,
      COALESCE(SUM(p.vote_count), 0)::bigint AS total_votes,
      COUNT(DISTINCT b.id) FILTER (WHERE b.winner_participant_id = p.id) AS wins
    FROM public.kitchen_battle_participants p
    LEFT JOIN public.kitchen_battles b ON b.id = p.battle_id
    GROUP BY p.user_id
  )
  SELECT
    s.user_id,
    COALESCE(NULLIF(pr.username, ''), NULLIF(pr.full_name, ''), 'Chef') AS display_name,
    pr.avatar_url,
    s.duels,
    s.total_votes,
    s.wins,
    COALESCE(hx.xp, 0) AS kitchen_xp
  FROM stats s
  LEFT JOIN public.profiles pr ON pr.id = s.user_id
  LEFT JOIN public.hub_xp hx ON hx.user_id = s.user_id AND hx.hub = 'kitchenstars'
  ORDER BY s.wins DESC, s.total_votes DESC, COALESCE(hx.xp, 0) DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
$$;

GRANT EXECUTE ON FUNCTION public.get_kitchenstars_leaderboard(int) TO authenticated, anon;