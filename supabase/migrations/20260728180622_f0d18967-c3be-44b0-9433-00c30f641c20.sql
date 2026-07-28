CREATE TABLE IF NOT EXISTS public.brain_duel_live_lobby (
  match_id uuid PRIMARY KEY REFERENCES public.brain_duel_matches(id) ON DELETE CASCADE,
  player1_id uuid NOT NULL,
  player2_id uuid,
  player1_ready boolean NOT NULL DEFAULT false,
  player2_ready boolean NOT NULL DEFAULT false,
  player1_seen_at timestamptz,
  player2_seen_at timestamptz,
  status text NOT NULL DEFAULT 'waiting',
  live_started_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.brain_duel_live_lobby TO authenticated;
GRANT ALL ON public.brain_duel_live_lobby TO service_role;

ALTER TABLE public.brain_duel_live_lobby ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Players can view their own duel lobby" ON public.brain_duel_live_lobby;
CREATE POLICY "Players can view their own duel lobby"
ON public.brain_duel_live_lobby
FOR SELECT
TO authenticated
USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE OR REPLACE FUNCTION public.brain_duel_live_lobby_touch()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_brain_duel_live_lobby_touch ON public.brain_duel_live_lobby;
CREATE TRIGGER trg_brain_duel_live_lobby_touch
BEFORE UPDATE ON public.brain_duel_live_lobby
FOR EACH ROW EXECUTE FUNCTION public.brain_duel_live_lobby_touch();

-- Heartbeat + ready: upserts the lobby row for a match the caller belongs to.
CREATE OR REPLACE FUNCTION public.brain_duel_live_heartbeat(p_match_id uuid, p_ready boolean DEFAULT false)
RETURNS public.brain_duel_live_lobby
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_match public.brain_duel_matches%ROWTYPE;
  v_row public.brain_duel_live_lobby%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_match FROM public.brain_duel_matches WHERE id = p_match_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Match not found';
  END IF;
  IF v_uid <> v_match.player1_id AND (v_match.player2_id IS NULL OR v_uid <> v_match.player2_id) THEN
    RAISE EXCEPTION 'Not a participant of this match';
  END IF;

  INSERT INTO public.brain_duel_live_lobby (match_id, player1_id, player2_id)
  VALUES (p_match_id, v_match.player1_id, v_match.player2_id)
  ON CONFLICT (match_id) DO UPDATE SET player2_id = COALESCE(public.brain_duel_live_lobby.player2_id, EXCLUDED.player2_id);

  IF v_uid = v_match.player1_id THEN
    UPDATE public.brain_duel_live_lobby
      SET player1_seen_at = now(),
          player1_ready = player1_ready OR COALESCE(p_ready, false)
    WHERE match_id = p_match_id;
  ELSE
    UPDATE public.brain_duel_live_lobby
      SET player2_seen_at = now(),
          player2_ready = player2_ready OR COALESCE(p_ready, false)
    WHERE match_id = p_match_id;
  END IF;

  UPDATE public.brain_duel_live_lobby
    SET status = 'live',
        live_started_at = COALESCE(live_started_at, now())
  WHERE match_id = p_match_id
    AND status = 'waiting'
    AND player1_ready AND player2_ready
    AND player1_seen_at > now() - interval '25 seconds'
    AND player2_seen_at > now() - interval '25 seconds';

  SELECT * INTO v_row FROM public.brain_duel_live_lobby WHERE match_id = p_match_id;
  RETURN v_row;
END;
$$;

-- Fallback to the classic asynchronous duel after the wait window elapses.
CREATE OR REPLACE FUNCTION public.brain_duel_live_fallback(p_match_id uuid)
RETURNS public.brain_duel_live_lobby
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.brain_duel_live_lobby%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  UPDATE public.brain_duel_live_lobby
    SET status = 'async'
  WHERE match_id = p_match_id
    AND status = 'waiting'
    AND (player1_id = v_uid OR player2_id = v_uid)
    AND created_at < now() - interval '55 seconds';

  SELECT * INTO v_row FROM public.brain_duel_live_lobby WHERE match_id = p_match_id;
  RETURN v_row;
END;
$$;

GRANT EXECUTE ON FUNCTION public.brain_duel_live_heartbeat(uuid, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.brain_duel_live_fallback(uuid) TO authenticated;

ALTER TABLE public.brain_duel_live_lobby REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'brain_duel_live_lobby'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.brain_duel_live_lobby;
  END IF;
END $$;