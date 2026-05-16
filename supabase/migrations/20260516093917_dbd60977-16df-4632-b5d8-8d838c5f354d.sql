
-- Helper: award XP to a specific user for a hub (SECURITY DEFINER variant for triggers)
CREATE OR REPLACE FUNCTION public.award_hub_xp_for_user(_user_id uuid, _hub text, _amount int)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF _user_id IS NULL OR _amount IS NULL OR _amount = 0 THEN
    RETURN;
  END IF;

  INSERT INTO public.hub_xp (user_id, hub, xp)
  VALUES (_user_id, _hub, _amount)
  ON CONFLICT (user_id, hub) DO UPDATE SET xp = public.hub_xp.xp + EXCLUDED.xp, updated_at = now();

  INSERT INTO public.user_xp (user_id, total_xp)
  VALUES (_user_id, _amount)
  ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + EXCLUDED.total_xp, updated_at = now();
END;
$$;

-- Trigger functions
CREATE OR REPLACE FUNCTION public.trg_xp_talent_submission()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_hub_xp_for_user(NEW.user_id, 'megatalent', 25);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_xp_talent_vote()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_hub_xp_for_user(NEW.user_id, 'megatalent', 1);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_xp_talent_comment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_hub_xp_for_user(NEW.user_id, 'megatalent', 2);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_xp_talent_endorsement()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.award_hub_xp_for_user(NEW.talent_user_id, 'megatalent', 5);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_xp_prediction_win()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.awarded = true AND (OLD.awarded IS DISTINCT FROM true) THEN
    PERFORM public.award_hub_xp_for_user(NEW.user_id, 'megatalent', 10);
  END IF;
  RETURN NEW;
END;
$$;

-- Attach triggers
DROP TRIGGER IF EXISTS xp_talent_submission ON public.talent_submissions;
CREATE TRIGGER xp_talent_submission AFTER INSERT ON public.talent_submissions
FOR EACH ROW EXECUTE FUNCTION public.trg_xp_talent_submission();

DROP TRIGGER IF EXISTS xp_talent_vote ON public.talent_votes;
CREATE TRIGGER xp_talent_vote AFTER INSERT ON public.talent_votes
FOR EACH ROW EXECUTE FUNCTION public.trg_xp_talent_vote();

DROP TRIGGER IF EXISTS xp_talent_comment ON public.talent_comments;
CREATE TRIGGER xp_talent_comment AFTER INSERT ON public.talent_comments
FOR EACH ROW EXECUTE FUNCTION public.trg_xp_talent_comment();

DROP TRIGGER IF EXISTS xp_talent_endorsement ON public.talent_endorsements;
CREATE TRIGGER xp_talent_endorsement AFTER INSERT ON public.talent_endorsements
FOR EACH ROW EXECUTE FUNCTION public.trg_xp_talent_endorsement();

DROP TRIGGER IF EXISTS xp_prediction_win ON public.battle_royale_predictions;
CREATE TRIGGER xp_prediction_win AFTER UPDATE ON public.battle_royale_predictions
FOR EACH ROW EXECUTE FUNCTION public.trg_xp_prediction_win();
