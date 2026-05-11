
ALTER TABLE public.iq_competitions
  ADD COLUMN IF NOT EXISTS bracket_size INTEGER NOT NULL DEFAULT 8,
  ADD COLUMN IF NOT EXISTS current_round INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS format TEXT NOT NULL DEFAULT 'single_elim',
  ADD COLUMN IF NOT EXISTS bracket_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS finalized_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS public.iq_tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.iq_competitions(id) ON DELETE CASCADE,
  round INTEGER NOT NULL,
  slot INTEGER NOT NULL,
  player1_id UUID,
  player2_id UUID,
  player1_score INTEGER,
  player2_score INTEGER,
  winner_id UUID,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(competition_id, round, slot)
);

CREATE INDEX IF NOT EXISTS idx_iq_tm_comp_round ON public.iq_tournament_matches(competition_id, round);
CREATE INDEX IF NOT EXISTS idx_iq_tm_player1 ON public.iq_tournament_matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_iq_tm_player2 ON public.iq_tournament_matches(player2_id);

ALTER TABLE public.iq_tournament_matches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tournament matches" ON public.iq_tournament_matches;
CREATE POLICY "Anyone can view tournament matches" ON public.iq_tournament_matches
  FOR SELECT TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS public.iq_tournament_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competition_id UUID NOT NULL REFERENCES public.iq_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rank INTEGER NOT NULL,
  credits_awarded INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

ALTER TABLE public.iq_tournament_payouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view tournament payouts" ON public.iq_tournament_payouts;
CREATE POLICY "Anyone can view tournament payouts" ON public.iq_tournament_payouts
  FOR SELECT TO authenticated USING (true);

-- Start bracket: seed round 1 with shuffled participants (admin only)
CREATE OR REPLACE FUNCTION public.start_iq_tournament(_competition_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin BOOLEAN;
  _participants UUID[];
  _n INTEGER;
  _bracket_size INTEGER;
  _i INTEGER;
  _slot INTEGER;
BEGIN
  SELECT public.has_role(auth.uid(), 'admin') INTO _is_admin;
  IF NOT _is_admin THEN
    RAISE EXCEPTION 'Only admins can start tournaments';
  END IF;

  IF EXISTS (SELECT 1 FROM public.iq_tournament_matches WHERE competition_id = _competition_id) THEN
    RAISE EXCEPTION 'Bracket already started';
  END IF;

  SELECT array_agg(user_id ORDER BY random()) INTO _participants
    FROM public.iq_competition_participants
    WHERE competition_id = _competition_id;

  _n := COALESCE(array_length(_participants, 1), 0);
  IF _n < 2 THEN
    RAISE EXCEPTION 'Need at least 2 participants';
  END IF;

  _bracket_size := 2;
  WHILE _bracket_size < _n LOOP
    _bracket_size := _bracket_size * 2;
  END LOOP;

  _slot := 0;
  _i := 1;
  WHILE _i <= _bracket_size LOOP
    INSERT INTO public.iq_tournament_matches(competition_id, round, slot, player1_id, player2_id, status)
    VALUES (
      _competition_id,
      1,
      _slot,
      CASE WHEN _i <= _n THEN _participants[_i] ELSE NULL END,
      CASE WHEN _i+1 <= _n THEN _participants[_i+1] ELSE NULL END,
      CASE
        WHEN _i+1 > _n AND _i <= _n THEN 'bye'
        WHEN _i > _n THEN 'bye'
        ELSE 'active'
      END
    );
    -- auto-advance byes
    IF _i+1 > _n AND _i <= _n THEN
      UPDATE public.iq_tournament_matches
        SET winner_id = _participants[_i], completed_at = now()
        WHERE competition_id = _competition_id AND round = 1 AND slot = _slot;
    END IF;
    _slot := _slot + 1;
    _i := _i + 2;
  END LOOP;

  UPDATE public.iq_competitions
    SET bracket_size = _bracket_size,
        current_round = 1,
        bracket_started_at = now()
    WHERE id = _competition_id;

  RETURN jsonb_build_object('success', true, 'bracket_size', _bracket_size, 'players', _n);
END;
$$;

-- Submit a match score; both players must submit; higher score wins, advances to next round
CREATE OR REPLACE FUNCTION public.submit_iq_tournament_match_score(_match_id UUID, _score INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _m RECORD;
  _uid UUID := auth.uid();
  _winner UUID;
  _next_slot INTEGER;
  _next_round INTEGER;
  _is_player1 BOOLEAN;
  _comp_id UUID;
  _bracket_size INTEGER;
  _final_round INTEGER;
BEGIN
  SELECT * INTO _m FROM public.iq_tournament_matches WHERE id = _match_id;
  IF _m IS NULL THEN RAISE EXCEPTION 'Match not found'; END IF;
  IF _m.status NOT IN ('active','pending') THEN RAISE EXCEPTION 'Match closed'; END IF;
  IF _uid <> _m.player1_id AND _uid <> _m.player2_id THEN
    RAISE EXCEPTION 'Not a participant in this match';
  END IF;

  _is_player1 := (_uid = _m.player1_id);
  IF _is_player1 THEN
    IF _m.player1_score IS NOT NULL THEN RAISE EXCEPTION 'Score already submitted'; END IF;
    UPDATE public.iq_tournament_matches SET player1_score = _score WHERE id = _match_id;
    _m.player1_score := _score;
  ELSE
    IF _m.player2_score IS NOT NULL THEN RAISE EXCEPTION 'Score already submitted'; END IF;
    UPDATE public.iq_tournament_matches SET player2_score = _score WHERE id = _match_id;
    _m.player2_score := _score;
  END IF;

  IF _m.player1_score IS NULL OR _m.player2_score IS NULL THEN
    RETURN jsonb_build_object('success', true, 'waiting_for_opponent', true);
  END IF;

  _winner := CASE
    WHEN _m.player1_score > _m.player2_score THEN _m.player1_id
    WHEN _m.player2_score > _m.player1_score THEN _m.player2_id
    ELSE _m.player1_id  -- tiebreak: player1
  END;

  UPDATE public.iq_tournament_matches
    SET winner_id = _winner, status = 'completed', completed_at = now()
    WHERE id = _match_id;

  _comp_id := _m.competition_id;
  SELECT bracket_size INTO _bracket_size FROM public.iq_competitions WHERE id = _comp_id;
  _final_round := CAST(LOG(2, _bracket_size) AS INTEGER);

  IF _m.round < _final_round THEN
    _next_round := _m.round + 1;
    _next_slot := _m.slot / 2;

    -- Insert or update next round match
    INSERT INTO public.iq_tournament_matches(competition_id, round, slot, player1_id, status)
    VALUES (_comp_id, _next_round, _next_slot, _winner, 'pending')
    ON CONFLICT (competition_id, round, slot)
    DO UPDATE SET
      player2_id = _winner,
      status = 'active';
  END IF;

  RETURN jsonb_build_object('success', true, 'winner_id', _winner, 'completed', true);
END;
$$;

-- Finalize: pay top 3 (50/30/20 split of prize pool)
CREATE OR REPLACE FUNCTION public.finalize_iq_tournament(_competition_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _is_admin BOOLEAN;
  _comp RECORD;
  _final_round INTEGER;
  _champion UUID;
  _runner_up UUID;
  _semi1 UUID;
  _semi2 UUID;
  _third UUID;
  _splits INTEGER[] := ARRAY[50,30,20];
  _winners UUID[];
  _i INTEGER;
  _award INTEGER;
BEGIN
  SELECT public.has_role(auth.uid(), 'admin') INTO _is_admin;
  IF NOT _is_admin THEN RAISE EXCEPTION 'Only admins can finalize'; END IF;

  SELECT * INTO _comp FROM public.iq_competitions WHERE id = _competition_id;
  IF _comp.finalized_at IS NOT NULL THEN
    RAISE EXCEPTION 'Already finalized';
  END IF;

  _final_round := CAST(LOG(2, _comp.bracket_size) AS INTEGER);

  SELECT winner_id INTO _champion
    FROM public.iq_tournament_matches
    WHERE competition_id = _competition_id AND round = _final_round;
  IF _champion IS NULL THEN
    RAISE EXCEPTION 'Final not complete';
  END IF;

  SELECT CASE WHEN player1_id = _champion THEN player2_id ELSE player1_id END INTO _runner_up
    FROM public.iq_tournament_matches
    WHERE competition_id = _competition_id AND round = _final_round;

  -- Semifinal losers (3rd place tied; pick higher score then random)
  IF _final_round >= 2 THEN
    SELECT array_agg(loser ORDER BY score_diff DESC NULLS LAST)
    INTO _winners
    FROM (
      SELECT
        CASE WHEN winner_id = player1_id THEN player2_id ELSE player1_id END AS loser,
        ABS(COALESCE(player1_score,0) - COALESCE(player2_score,0)) AS score_diff
      FROM public.iq_tournament_matches
      WHERE competition_id = _competition_id AND round = _final_round - 1
    ) sub
    WHERE loser IS NOT NULL;
    _third := COALESCE(_winners[1], NULL);
  END IF;

  _winners := ARRAY[_champion, _runner_up, _third];

  FOR _i IN 1..3 LOOP
    IF _winners[_i] IS NULL THEN CONTINUE; END IF;
    _award := (_comp.prize_pool * _splits[_i]) / 100;

    INSERT INTO public.iq_tournament_payouts(competition_id, user_id, rank, credits_awarded)
    VALUES (_competition_id, _winners[_i], _i, _award)
    ON CONFLICT (competition_id, user_id) DO NOTHING;

    -- Credit user
    INSERT INTO public.iq_credits(user_id, balance)
    VALUES (_winners[_i], _award)
    ON CONFLICT (user_id) DO UPDATE SET balance = public.iq_credits.balance + _award;
  END LOOP;

  UPDATE public.iq_competitions
    SET finalized_at = now(), status = 'completed'
    WHERE id = _competition_id;

  RETURN jsonb_build_object('success', true, 'champion', _champion, 'runner_up', _runner_up, 'third', _third);
END;
$$;
