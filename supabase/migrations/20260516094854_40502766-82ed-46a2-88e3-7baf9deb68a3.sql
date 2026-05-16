
-- Auto-prize trigger: when tournament becomes completed, set prize if still 0
CREATE OR REPLACE FUNCTION public.trg_br_auto_prize()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_predictions int;
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') AND NEW.prize_amount_cents = 0 THEN
    SELECT count(*) INTO v_predictions FROM public.battle_royale_predictions WHERE tournament_id = NEW.id;
    -- 80% of (predictions * 100 cents stake) or fallback €100
    NEW.prize_amount_cents := GREATEST(10000, (v_predictions * 100 * 80 / 100));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS br_auto_prize ON public.battle_royale_tournaments;
CREATE TRIGGER br_auto_prize BEFORE UPDATE ON public.battle_royale_tournaments
FOR EACH ROW EXECUTE FUNCTION public.trg_br_auto_prize();

-- Demo tournament (signup phase, opens in 7 days)
INSERT INTO public.battle_royale_tournaments (category, status, max_participants, signup_ends_at, starts_at)
SELECT 'singing', 'signup', 16, now() + interval '7 days', now() + interval '8 days'
WHERE NOT EXISTS (SELECT 1 FROM public.battle_royale_tournaments);
