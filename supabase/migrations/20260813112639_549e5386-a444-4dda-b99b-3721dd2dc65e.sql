-- Supporting indexes
CREATE INDEX IF NOT EXISTS idx_kitchen_battle_participants_user ON public.kitchen_battle_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_battle_participants_battle ON public.kitchen_battle_participants(battle_id);
CREATE INDEX IF NOT EXISTS idx_kitchen_battles_winner ON public.kitchen_battles(winner_participant_id);
CREATE INDEX IF NOT EXISTS idx_reel_battle_participants_user ON public.reel_battle_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_reel_battle_participants_battle ON public.reel_battle_participants(battle_id);
CREATE INDEX IF NOT EXISTS idx_reel_battles_winner ON public.reel_battles(winner_participant_id);
CREATE INDEX IF NOT EXISTS idx_hub_xp_hub_user ON public.hub_xp(hub, user_id);

-- KitchenStars snapshot
DROP MATERIALIZED VIEW IF EXISTS public.mv_kitchenstars_leaderboard;
CREATE MATERIALIZED VIEW public.mv_kitchenstars_leaderboard AS
WITH stats AS (
  SELECT p.user_id,
         COUNT(DISTINCT p.battle_id)::bigint AS duels,
         COALESCE(SUM(p.vote_count), 0)::bigint AS total_votes,
         COUNT(DISTINCT b.id) FILTER (WHERE b.winner_participant_id = p.id)::bigint AS wins
  FROM public.kitchen_battle_participants p
  LEFT JOIN public.kitchen_battles b ON b.id = p.battle_id
  WHERE p.user_id IS NOT NULL
  GROUP BY p.user_id
)
SELECT s.user_id,
       s.duels,
       s.total_votes,
       s.wins,
       COALESCE(hx.xp, 0)::integer AS points,
       ROW_NUMBER() OVER (ORDER BY COALESCE(hx.xp, 0) DESC, s.wins DESC, s.total_votes DESC, s.user_id)::bigint AS rank
FROM stats s
LEFT JOIN public.hub_xp hx ON hx.user_id = s.user_id AND hx.hub = 'kitchenstars';

CREATE UNIQUE INDEX idx_mv_kitchenstars_leaderboard_user ON public.mv_kitchenstars_leaderboard(user_id);
CREATE INDEX idx_mv_kitchenstars_leaderboard_rank ON public.mv_kitchenstars_leaderboard(rank);

-- Reel Battles snapshot
DROP MATERIALIZED VIEW IF EXISTS public.mv_reel_battles_leaderboard;
CREATE MATERIALIZED VIEW public.mv_reel_battles_leaderboard AS
WITH stats AS (
  SELECT p.user_id,
         COUNT(DISTINCT p.battle_id)::bigint AS duels,
         COALESCE(SUM(p.vote_count), 0)::bigint AS total_votes,
         COUNT(DISTINCT b.id) FILTER (WHERE b.winner_participant_id = p.id)::bigint AS wins
  FROM public.reel_battle_participants p
  LEFT JOIN public.reel_battles b ON b.id = p.battle_id
  WHERE p.user_id IS NOT NULL
  GROUP BY p.user_id
)
SELECT s.user_id,
       s.duels,
       s.total_votes,
       s.wins,
       COALESCE(hx.xp, 0)::integer AS points,
       ROW_NUMBER() OVER (ORDER BY COALESCE(hx.xp, 0) DESC, s.wins DESC, s.total_votes DESC, s.user_id)::bigint AS rank
FROM stats s
LEFT JOIN public.hub_xp hx ON hx.user_id = s.user_id AND hx.hub = 'reel_battles';

CREATE UNIQUE INDEX idx_mv_reel_leaderboard_user ON public.mv_reel_battles_leaderboard(user_id);
CREATE INDEX idx_mv_reel_leaderboard_rank ON public.mv_reel_battles_leaderboard(rank);

REVOKE ALL ON public.mv_kitchenstars_leaderboard FROM anon, authenticated;
REVOKE ALL ON public.mv_reel_battles_leaderboard FROM anon, authenticated;

-- Refresh helper
CREATE OR REPLACE FUNCTION public.refresh_battle_leaderboards()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_kitchenstars_leaderboard;
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.mv_reel_battles_leaderboard;
EXCEPTION WHEN OTHERS THEN
  REFRESH MATERIALIZED VIEW public.mv_kitchenstars_leaderboard;
  REFRESH MATERIALIZED VIEW public.mv_reel_battles_leaderboard;
END;
$$;

-- Read RPCs (points-based, snapshot backed)
DROP FUNCTION IF EXISTS public.get_kitchenstars_leaderboard(integer);
DROP FUNCTION IF EXISTS public.get_reel_battles_leaderboard(integer);
DROP FUNCTION IF EXISTS public.get_my_battle_leaderboard_rank(text);
CREATE OR REPLACE FUNCTION public.get_kitchenstars_leaderboard(_limit integer DEFAULT 20)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, duels bigint, total_votes bigint, wins bigint, kitchen_xp integer, rank bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.user_id,
         COALESCE(NULLIF(pr.username, ''), NULLIF(pr.full_name, ''), 'Chef') AS display_name,
         pr.avatar_url, m.duels, m.total_votes, m.wins, m.points AS kitchen_xp, m.rank
  FROM public.mv_kitchenstars_leaderboard m
  LEFT JOIN public.profiles pr ON pr.id = m.user_id
  WHERE m.rank <= GREATEST(1, LEAST(_limit, 100))
  ORDER BY m.rank;
$$;

CREATE OR REPLACE FUNCTION public.get_reel_battles_leaderboard(_limit integer DEFAULT 20)
RETURNS TABLE(user_id uuid, display_name text, avatar_url text, duels bigint, total_votes bigint, wins bigint, reel_xp integer, rank bigint)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT m.user_id,
         COALESCE(NULLIF(pr.username, ''), NULLIF(pr.full_name, ''), 'Creator') AS display_name,
         pr.avatar_url, m.duels, m.total_votes, m.wins, m.points AS reel_xp, m.rank
  FROM public.mv_reel_battles_leaderboard m
  LEFT JOIN public.profiles pr ON pr.id = m.user_id
  WHERE m.rank <= GREATEST(1, LEAST(_limit, 100))
  ORDER BY m.rank;
$$;

CREATE OR REPLACE FUNCTION public.get_my_battle_leaderboard_rank(_board text)
RETURNS TABLE(rank bigint, points integer, wins bigint, total_votes bigint, duels bigint, total_participants bigint)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  IF _board = 'kitchenstars' THEN
    RETURN QUERY
      SELECT m.rank, m.points, m.wins, m.total_votes, m.duels,
             (SELECT COUNT(*) FROM public.mv_kitchenstars_leaderboard)::bigint
      FROM public.mv_kitchenstars_leaderboard m WHERE m.user_id = auth.uid();
  ELSIF _board = 'reel_battles' THEN
    RETURN QUERY
      SELECT m.rank, m.points, m.wins, m.total_votes, m.duels,
             (SELECT COUNT(*) FROM public.mv_reel_battles_leaderboard)::bigint
      FROM public.mv_reel_battles_leaderboard m WHERE m.user_id = auth.uid();
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.refresh_battle_leaderboards() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_kitchenstars_leaderboard(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_reel_battles_leaderboard(integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_battle_leaderboard_rank(text) TO authenticated;

SELECT public.refresh_battle_leaderboards();

SELECT cron.unschedule('refresh-battle-leaderboards') WHERE EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'refresh-battle-leaderboards');
SELECT cron.schedule('refresh-battle-leaderboards', '*/2 * * * *', $$SELECT public.refresh_battle_leaderboards();$$);