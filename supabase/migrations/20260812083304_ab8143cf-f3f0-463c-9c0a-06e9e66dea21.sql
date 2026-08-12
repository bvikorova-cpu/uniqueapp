DROP FUNCTION IF EXISTS public.get_arena_leaderboard(integer);

CREATE FUNCTION public.get_arena_leaderboard(limit_count integer DEFAULT 20)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, wins bigint, matches bigint, points bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  WITH participation AS (
    SELECT p.user_id,
           COUNT(DISTINCT p.battle_id) AS matches,
           COALESCE(SUM(p.total_gifts_received), 0) AS gift_credits
    FROM public.shadow_battle_participants p
    WHERE p.user_id IS NOT NULL
    GROUP BY p.user_id
  ),
  wins AS (
    SELECT b.winner_id AS user_id, COUNT(*) AS wins
    FROM public.shadow_battles b
    WHERE b.winner_id IS NOT NULL
    GROUP BY b.winner_id
  ),
  placements AS (
    SELECT pl.user_id,
           COALESCE(SUM(pl.prize_amount), 0) AS prize_points,
           COUNT(*) FILTER (WHERE pl.placement <= 3) AS podiums
    FROM public.shadow_battle_placements pl
    WHERE pl.user_id IS NOT NULL
    GROUP BY pl.user_id
  ),
  agg AS (
    SELECT u.user_id,
           COALESCE(pa.matches, 0)::bigint AS matches,
           COALESCE(w.wins, 0)::bigint AS wins,
           (COALESCE(pa.matches, 0) * 10
            + COALESCE(pa.gift_credits, 0) * 10
            + COALESCE(w.wins, 0) * 100
            + COALESCE(pl.prize_points, 0)
            + COALESCE(pl.podiums, 0) * 25)::bigint AS points
    FROM (
      SELECT user_id FROM participation
      UNION SELECT user_id FROM wins
      UNION SELECT user_id FROM placements
    ) u
    LEFT JOIN participation pa ON pa.user_id = u.user_id
    LEFT JOIN wins w ON w.user_id = u.user_id
    LEFT JOIN placements pl ON pl.user_id = u.user_id
  )
  SELECT a.user_id,
         COALESCE(pr.username, pr.full_name, 'Warrior') AS display_name,
         pr.avatar_url,
         a.wins,
         a.matches,
         a.points
  FROM agg a
  LEFT JOIN public.profiles pr ON pr.id = a.user_id
  WHERE a.points > 0
  ORDER BY a.points DESC, a.wins DESC
  LIMIT GREATEST(1, LEAST(limit_count, 100));
$function$;

GRANT EXECUTE ON FUNCTION public.get_arena_leaderboard(integer) TO authenticated, anon;