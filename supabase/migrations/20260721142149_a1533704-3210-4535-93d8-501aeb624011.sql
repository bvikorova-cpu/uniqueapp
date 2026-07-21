
-- 1. Owner for escape room sessions
ALTER TABLE public.escape_room_sessions
  ADD COLUMN IF NOT EXISTS user_id UUID;

CREATE INDEX IF NOT EXISTS idx_escape_room_sessions_user
  ON public.escape_room_sessions(user_id, completed_at DESC);

-- 2. Multiplayer lobbies
CREATE TABLE IF NOT EXISTS public.escape_room_lobbies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  host_id UUID NOT NULL,
  room_id UUID REFERENCES public.escape_rooms(id) ON DELETE SET NULL,
  invite_code TEXT NOT NULL UNIQUE DEFAULT upper(substring(encode(gen_random_bytes(4),'hex') from 1 for 6)),
  players INTEGER NOT NULL DEFAULT 1,
  max_players INTEGER NOT NULL DEFAULT 4,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','starting','full','closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.escape_room_lobbies TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.escape_room_lobbies TO authenticated;
GRANT ALL ON public.escape_room_lobbies TO service_role;

ALTER TABLE public.escape_room_lobbies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open lobbies"
ON public.escape_room_lobbies FOR SELECT
USING (status <> 'closed');

CREATE POLICY "Authenticated users create lobbies"
ON public.escape_room_lobbies FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts update own lobbies"
ON public.escape_room_lobbies FOR UPDATE
TO authenticated
USING (auth.uid() = host_id)
WITH CHECK (auth.uid() = host_id);

CREATE POLICY "Hosts delete own lobbies"
ON public.escape_room_lobbies FOR DELETE
TO authenticated
USING (auth.uid() = host_id);

CREATE TRIGGER trg_escape_room_lobbies_updated
BEFORE UPDATE ON public.escape_room_lobbies
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX IF NOT EXISTS idx_escape_room_lobbies_status
  ON public.escape_room_lobbies(status, created_at DESC);

-- 3. Arena leaderboard (Shadow Arena / Battle Royale)
CREATE OR REPLACE FUNCTION public.get_arena_leaderboard(limit_count INTEGER DEFAULT 20)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  wins BIGINT,
  matches BIGINT,
  earnings_cents BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH wins AS (
    SELECT winner_id AS user_id, COUNT(*) AS wins
    FROM public.battle_royale_matches
    WHERE winner_id IS NOT NULL
    GROUP BY winner_id
  ),
  matches AS (
    SELECT participant_id AS user_id, COUNT(*) AS matches
    FROM (
      SELECT participant_a_id AS participant_id FROM public.battle_royale_matches WHERE participant_a_id IS NOT NULL
      UNION ALL
      SELECT participant_b_id AS participant_id FROM public.battle_royale_matches WHERE participant_b_id IS NOT NULL
    ) t
    GROUP BY participant_id
  ),
  earnings AS (
    SELECT p.user_id, COALESCE(SUM(t.prize_amount_cents),0) AS cents
    FROM public.battle_royale_participants p
    JOIN public.battle_royale_tournaments t ON t.champion_participant_id = p.id
    GROUP BY p.user_id
  )
  SELECT
    w.user_id,
    COALESCE(pr.username, pr.full_name, 'Warrior') AS display_name,
    pr.avatar_url,
    w.wins,
    COALESCE(m.matches, 0) AS matches,
    COALESCE(e.cents, 0) AS earnings_cents
  FROM wins w
  LEFT JOIN matches m ON m.user_id = w.user_id
  LEFT JOIN earnings e ON e.user_id = w.user_id
  LEFT JOIN public.profiles pr ON pr.id = w.user_id
  ORDER BY w.wins DESC, e.cents DESC NULLS LAST
  LIMIT GREATEST(1, LEAST(limit_count, 100));
$$;

GRANT EXECUTE ON FUNCTION public.get_arena_leaderboard(INTEGER) TO anon, authenticated;

-- 4. Multiverse explorers
CREATE OR REPLACE FUNCTION public.get_multiverse_explorers(limit_count INTEGER DEFAULT 12)
RETURNS TABLE (
  user_id UUID,
  display_name TEXT,
  avatar_url TEXT,
  universes BIGINT,
  specialty TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    mp.user_id,
    COALESCE(pr.username, pr.full_name, 'Explorer') AS display_name,
    pr.avatar_url,
    COUNT(*) AS universes,
    (array_agg(mp.service_type ORDER BY mp.created_at DESC))[1] AS specialty
  FROM public.multiverse_purchases mp
  LEFT JOIN public.profiles pr ON pr.id = mp.user_id
  WHERE mp.status = 'active'
  GROUP BY mp.user_id, pr.username, pr.full_name, pr.avatar_url
  ORDER BY universes DESC
  LIMIT GREATEST(1, LEAST(limit_count, 100));
$$;

GRANT EXECUTE ON FUNCTION public.get_multiverse_explorers(INTEGER) TO anon, authenticated;
