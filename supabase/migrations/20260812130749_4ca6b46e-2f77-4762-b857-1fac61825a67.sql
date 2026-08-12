CREATE OR REPLACE FUNCTION public.get_arena_leaderboard(limit_count integer DEFAULT 20)
RETURNS TABLE (
  user_id uuid,
  display_name text,
  avatar_url text,
  wins bigint,
  matches bigint,
  points bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH gifts AS (
    SELECT g.recipient_id AS user_id,
           COALESCE(SUM(g.credits_spent), 0)::bigint AS gift_credits
    FROM public.shadow_gift_sends g
    WHERE g.recipient_id IS NOT NULL
    GROUP BY g.recipient_id
  ),
  stories AS (
    SELECT s.user_id,
           COUNT(*)::bigint AS story_count,
           COALESCE(SUM(s.votes_count), 0)::bigint AS votes
    FROM public.shadow_stories s
    WHERE s.user_id IS NOT NULL
    GROUP BY s.user_id
  ),
  duels AS (
    SELECT u.user_id,
           COUNT(*) FILTER (WHERE d.winner_id = u.user_id)::bigint AS wins,
           COUNT(*)::bigint AS matches
    FROM public.shadow_duet_battles d
    CROSS JOIN LATERAL (VALUES (d.creator_a), (d.creator_b)) AS u(user_id)
    WHERE u.user_id IS NOT NULL
    GROUP BY u.user_id
  ),
  agg AS (
    SELECT x.user_id,
           COALESCE(d.matches, 0) AS matches,
           COALESCE(d.wins, 0) AS wins,
           (COALESCE(g.gift_credits, 0) * 10
            + COALESCE(st.votes, 0) * 5
            + COALESCE(st.story_count, 0) * 20
            + COALESCE(d.wins, 0) * 100)::bigint AS points
    FROM (
      SELECT user_id FROM gifts
      UNION SELECT user_id FROM stories
      UNION SELECT user_id FROM duels
    ) x
    LEFT JOIN gifts g ON g.user_id = x.user_id
    LEFT JOIN stories st ON st.user_id = x.user_id
    LEFT JOIN duels d ON d.user_id = x.user_id
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
$$;
