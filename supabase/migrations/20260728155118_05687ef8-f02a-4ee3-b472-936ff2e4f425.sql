GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;

CREATE OR REPLACE FUNCTION public.notify_brain_duel_friend_challenge()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor_id uuid;
  v_user_id uuid;
  v_actor_name text;
  v_title text;
  v_message text;
  v_type text;
  v_action_url text := '/brain-duel?tab=friends';
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_actor_id := NEW.challenger_id;
    v_user_id := NEW.challenged_id;
    v_type := 'brain_duel_challenge';
    v_title := 'New Brain Duel challenge';
  ELSIF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'accepted' THEN
      v_actor_id := NEW.challenged_id;
      v_user_id := NEW.challenger_id;
      v_type := 'brain_duel_challenge_accepted';
      v_title := 'Brain Duel challenge accepted';
    ELSIF NEW.status = 'declined' THEN
      v_actor_id := NEW.challenged_id;
      v_user_id := NEW.challenger_id;
      v_type := 'brain_duel_challenge_declined';
      v_title := 'Brain Duel challenge declined';
    ELSIF NEW.status IN ('cancelled', 'expired') THEN
      v_actor_id := NEW.challenger_id;
      v_user_id := NEW.challenged_id;
      v_type := 'brain_duel_challenge_' || NEW.status;
      v_title := CASE WHEN NEW.status = 'expired' THEN 'Brain Duel challenge expired' ELSE 'Brain Duel challenge cancelled' END;
    ELSE
      RETURN NEW;
    END IF;
  ELSE
    RETURN NEW;
  END IF;

  IF v_user_id IS NULL OR v_actor_id IS NULL OR v_user_id = v_actor_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(trim(full_name), ''), NULLIF(trim(username), ''), 'Player')
    INTO v_actor_name
  FROM public.profiles
  WHERE id = v_actor_id;

  v_actor_name := COALESCE(v_actor_name, 'Player');

  IF v_type = 'brain_duel_challenge' THEN
    v_message := v_actor_name || ' challenged you to ' || COALESCE(NEW.category, 'Brain Duel') || ' for ' || COALESCE(NEW.stake_credits, 0)::text || ' credits.';
  ELSIF v_type = 'brain_duel_challenge_accepted' THEN
    v_message := v_actor_name || ' accepted your Brain Duel challenge.';
    IF NEW.match_id IS NOT NULL THEN
      v_action_url := '/brain-duel?match_id=' || NEW.match_id::text;
    END IF;
  ELSIF v_type = 'brain_duel_challenge_declined' THEN
    v_message := v_actor_name || ' declined your Brain Duel challenge.';
  ELSIF v_type = 'brain_duel_challenge_expired' THEN
    v_message := 'Your Brain Duel challenge expired.';
  ELSE
    v_message := 'Your Brain Duel challenge was cancelled.';
  END IF;

  INSERT INTO public.notifications (
    user_id,
    actor_id,
    title,
    message,
    type,
    related_id,
    action_url,
    metadata
  ) VALUES (
    v_user_id,
    v_actor_id,
    v_title,
    v_message,
    v_type,
    NEW.id,
    v_action_url,
    jsonb_build_object(
      'challenge_id', NEW.id,
      'category', NEW.category,
      'stake_credits', NEW.stake_credits,
      'status', NEW.status,
      'match_id', NEW.match_id
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_brain_duel_friend_challenge ON public.brain_duel_friend_challenges;
CREATE TRIGGER trg_notify_brain_duel_friend_challenge
AFTER INSERT OR UPDATE OF status ON public.brain_duel_friend_challenges
FOR EACH ROW
EXECUTE FUNCTION public.notify_brain_duel_friend_challenge();