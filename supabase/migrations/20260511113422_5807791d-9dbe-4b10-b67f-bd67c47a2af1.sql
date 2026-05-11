
CREATE TABLE IF NOT EXISTS public.iq_match_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.iq_tournament_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  predicted_winner_id UUID NOT NULL,
  stake_credits INTEGER NOT NULL CHECK (stake_credits > 0),
  payout_credits INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at TIMESTAMPTZ,
  UNIQUE(match_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_iq_match_bets_match ON public.iq_match_bets(match_id);
CREATE INDEX IF NOT EXISTS idx_iq_match_bets_user ON public.iq_match_bets(user_id);

ALTER TABLE public.iq_match_bets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view match bets" ON public.iq_match_bets;
CREATE POLICY "Anyone can view match bets" ON public.iq_match_bets
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can insert own bets" ON public.iq_match_bets;
CREATE POLICY "Users can insert own bets" ON public.iq_match_bets
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.iq_match_bets REPLICA IDENTITY FULL;
DO $$ BEGIN
  PERFORM 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'iq_match_bets';
  IF NOT FOUND THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.iq_match_bets';
  END IF;
END $$;

-- Place a bet: deduct credits and lock prediction
CREATE OR REPLACE FUNCTION public.place_iq_match_bet(
  _match_id UUID,
  _predicted_winner_id UUID,
  _stake INTEGER
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid UUID := auth.uid();
  _m public.iq_tournament_matches%ROWTYPE;
  _bet_id UUID;
  _balance INTEGER;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth_required'; END IF;
  IF _stake < 1 OR _stake > 1000 THEN RAISE EXCEPTION 'invalid_stake'; END IF;

  SELECT * INTO _m FROM public.iq_tournament_matches WHERE id = _match_id;
  IF _m.id IS NULL THEN RAISE EXCEPTION 'match_not_found'; END IF;
  IF _m.status <> 'pending' THEN RAISE EXCEPTION 'betting_closed'; END IF;
  IF _m.player1_id IS NULL OR _m.player2_id IS NULL THEN RAISE EXCEPTION 'match_not_ready'; END IF;
  IF _predicted_winner_id NOT IN (_m.player1_id, _m.player2_id) THEN
    RAISE EXCEPTION 'invalid_player';
  END IF;
  IF _uid IN (_m.player1_id, _m.player2_id) THEN
    RAISE EXCEPTION 'players_cannot_bet';
  END IF;

  SELECT balance INTO _balance FROM public.iq_credits WHERE user_id = _uid FOR UPDATE;
  IF COALESCE(_balance, 0) < _stake THEN RAISE EXCEPTION 'insufficient_credits'; END IF;

  UPDATE public.iq_credits SET balance = balance - _stake, updated_at = now() WHERE user_id = _uid;

  INSERT INTO public.iq_match_bets(match_id, user_id, predicted_winner_id, stake_credits)
    VALUES (_match_id, _uid, _predicted_winner_id, _stake)
  RETURNING id INTO _bet_id;

  RETURN _bet_id;
END;
$$;

REVOKE ALL ON FUNCTION public.place_iq_match_bet(UUID, UUID, INTEGER) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.place_iq_match_bet(UUID, UUID, INTEGER) TO authenticated;

-- Trigger: settle bets when winner_id is set on a match
CREATE OR REPLACE FUNCTION public.settle_iq_match_bets()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _winning_pool INTEGER;
  _losing_pool INTEGER;
  _bet RECORD;
  _payout INTEGER;
BEGIN
  IF NEW.winner_id IS NULL OR (OLD.winner_id IS NOT NULL AND OLD.winner_id = NEW.winner_id) THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(SUM(stake_credits), 0) INTO _winning_pool
    FROM public.iq_match_bets
    WHERE match_id = NEW.id AND predicted_winner_id = NEW.winner_id AND status = 'open';

  SELECT COALESCE(SUM(stake_credits), 0) INTO _losing_pool
    FROM public.iq_match_bets
    WHERE match_id = NEW.id AND predicted_winner_id <> NEW.winner_id AND status = 'open';

  -- No winners → refund losers
  IF _winning_pool = 0 THEN
    FOR _bet IN
      SELECT id, user_id, stake_credits FROM public.iq_match_bets
      WHERE match_id = NEW.id AND status = 'open'
    LOOP
      UPDATE public.iq_credits SET balance = balance + _bet.stake_credits, updated_at = now()
        WHERE user_id = _bet.user_id;
      UPDATE public.iq_match_bets
        SET status = 'refunded', payout_credits = _bet.stake_credits, settled_at = now()
        WHERE id = _bet.id;
    END LOOP;
    RETURN NEW;
  END IF;

  -- Pay winners: own stake + proportional share of losing pool
  FOR _bet IN
    SELECT id, user_id, stake_credits FROM public.iq_match_bets
    WHERE match_id = NEW.id AND predicted_winner_id = NEW.winner_id AND status = 'open'
  LOOP
    _payout := _bet.stake_credits + FLOOR(_bet.stake_credits::NUMERIC * _losing_pool / _winning_pool)::INTEGER;
    UPDATE public.iq_credits SET balance = balance + _payout, updated_at = now()
      WHERE user_id = _bet.user_id;
    UPDATE public.iq_match_bets
      SET status = 'won', payout_credits = _payout, settled_at = now()
      WHERE id = _bet.id;
  END LOOP;

  -- Mark losers
  UPDATE public.iq_match_bets
    SET status = 'lost', payout_credits = 0, settled_at = now()
    WHERE match_id = NEW.id AND predicted_winner_id <> NEW.winner_id AND status = 'open';

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_settle_iq_match_bets ON public.iq_tournament_matches;
CREATE TRIGGER trg_settle_iq_match_bets
  AFTER UPDATE OF winner_id ON public.iq_tournament_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.settle_iq_match_bets();
