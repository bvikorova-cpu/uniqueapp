CREATE OR REPLACE FUNCTION public.notify_challenge_engagement()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_owner uuid;
  v_actor uuid;
  v_actor_name text;
  v_kind text;
  v_section text;
  v_url text;
BEGIN
  IF TG_TABLE_NAME LIKE 'eco%' THEN
    v_section := 'Eco Challenge';
    v_url := '/eco-challenge';
  ELSE
    v_section := 'Healthy Challenge';
    v_url := '/healthy-challenge';
  END IF;

  IF TG_TABLE_NAME LIKE '%votes' THEN
    v_kind := 'like';
    v_actor := NEW.voter_id;
    IF v_section = 'Eco Challenge' THEN
      SELECT user_id INTO v_owner FROM public.eco_submissions WHERE id = NEW.submission_id;
    ELSE
      SELECT user_id INTO v_owner FROM public.healthy_submissions WHERE id = NEW.submission_id;
    END IF;
  ELSE
    v_kind := 'comment';
    v_actor := NEW.user_id;
    IF v_section = 'Eco Challenge' THEN
      SELECT user_id INTO v_owner FROM public.eco_submissions WHERE id = NEW.submission_id;
    ELSE
      SELECT user_id INTO v_owner FROM public.healthy_submissions WHERE id = NEW.submission_id;
    END IF;
  END IF;

  IF v_owner IS NULL OR v_owner = v_actor THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, 'Someone') INTO v_actor_name FROM public.profiles WHERE id = v_actor;
  IF v_actor_name IS NULL THEN v_actor_name := 'Someone'; END IF;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (
    v_owner,
    v_actor,
    CASE WHEN v_kind = 'like' THEN 'New like' ELSE 'New comment' END,
    CASE WHEN v_kind = 'like'
      THEN v_actor_name || ' liked your ' || v_section || ' post'
      ELSE v_actor_name || ' commented on your ' || v_section || ' post'
    END,
    CASE WHEN v_kind = 'like' THEN 'challenge_like' ELSE 'challenge_comment' END,
    NEW.submission_id,
    v_url
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_eco_vote ON public.eco_votes;
CREATE TRIGGER trg_notify_eco_vote AFTER INSERT ON public.eco_votes
FOR EACH ROW EXECUTE FUNCTION public.notify_challenge_engagement();

DROP TRIGGER IF EXISTS trg_notify_healthy_vote ON public.healthy_votes;
CREATE TRIGGER trg_notify_healthy_vote AFTER INSERT ON public.healthy_votes
FOR EACH ROW EXECUTE FUNCTION public.notify_challenge_engagement();

DROP TRIGGER IF EXISTS trg_notify_eco_comment ON public.eco_comments;
CREATE TRIGGER trg_notify_eco_comment AFTER INSERT ON public.eco_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_challenge_engagement();

DROP TRIGGER IF EXISTS trg_notify_healthy_comment ON public.healthy_comments;
CREATE TRIGGER trg_notify_healthy_comment AFTER INSERT ON public.healthy_comments
FOR EACH ROW EXECUTE FUNCTION public.notify_challenge_engagement();