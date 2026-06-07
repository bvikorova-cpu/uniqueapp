
-- 1) Block any non-service-role attempt to inflate brain_duel_credits.credits
CREATE OR REPLACE FUNCTION public.brain_duel_credits_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- service_role bypasses (current_setting('role') is not reliable; use auth.role())
  IF auth.role() = 'service_role' THEN
    RETURN NEW;
  END IF;
  IF NEW.credits > OLD.credits THEN
    RAISE EXCEPTION 'credit_increase_forbidden';
  END IF;
  IF NEW.credits < 0 THEN
    RAISE EXCEPTION 'credit_negative_forbidden';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS brain_duel_credits_guard_trg ON public.brain_duel_credits;
CREATE TRIGGER brain_duel_credits_guard_trg
BEFORE UPDATE ON public.brain_duel_credits
FOR EACH ROW EXECUTE FUNCTION public.brain_duel_credits_guard();

-- 2) Idempotent ELO reporting
ALTER TABLE public.brain_duel_matches
  ADD COLUMN IF NOT EXISTS elo_reported BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS brain_duel_matches_players_idx
  ON public.brain_duel_matches (player1_id, player2_id);
