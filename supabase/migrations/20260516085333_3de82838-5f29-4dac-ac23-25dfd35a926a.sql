
-- Comment notification
CREATE OR REPLACE FUNCTION public.notify_megatalent_comment()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE owner_id uuid; sub_title text;
BEGIN
  SELECT user_id, title INTO owner_id, sub_title FROM public.talent_submissions WHERE id = NEW.submission_id;
  IF owner_id IS NOT NULL AND owner_id <> NEW.user_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id, comment_id)
    VALUES (owner_id, NEW.user_id, 'megatalent_comment', 'New comment on your talent',
            COALESCE('"' || substring(NEW.comment_text,1,80) || '"', 'New comment'),
            NEW.submission_id, NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_megatalent_comment ON public.talent_comments;
CREATE TRIGGER trg_notify_megatalent_comment
AFTER INSERT ON public.talent_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_megatalent_comment();

-- Endorsement notification
CREATE OR REPLACE FUNCTION public.notify_megatalent_endorsement()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.talent_user_id IS NOT NULL AND NEW.talent_user_id <> NEW.endorser_id THEN
    INSERT INTO public.notifications (user_id, actor_id, type, title, message, related_id)
    VALUES (NEW.talent_user_id, NEW.endorser_id, 'megatalent_endorsement',
            'New endorsement received',
            'Someone endorsed your ' || COALESCE(NEW.skill, NEW.category, 'talent'),
            NEW.id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_megatalent_endorsement ON public.talent_endorsements;
CREATE TRIGGER trg_notify_megatalent_endorsement
AFTER INSERT ON public.talent_endorsements
FOR EACH ROW EXECUTE FUNCTION public.notify_megatalent_endorsement();

-- Prediction win notification
CREATE OR REPLACE FUNCTION public.notify_megatalent_prediction_win()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
BEGIN
  IF NEW.awarded = true AND (OLD.awarded IS DISTINCT FROM true) THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (NEW.user_id, 'megatalent_prediction_win',
            'You won a Battle Royale prediction!',
            'Round ' || COALESCE(NEW.round::text, '?') || ' prediction was correct.',
            NEW.tournament_id);
  END IF;
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_notify_megatalent_prediction_win ON public.battle_royale_predictions;
CREATE TRIGGER trg_notify_megatalent_prediction_win
AFTER UPDATE ON public.battle_royale_predictions
FOR EACH ROW EXECUTE FUNCTION public.notify_megatalent_prediction_win();
