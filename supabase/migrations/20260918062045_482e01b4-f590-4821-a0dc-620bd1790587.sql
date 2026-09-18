CREATE OR REPLACE FUNCTION public.trigger_friendship_accepted()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  accepter_name text;
BEGIN
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    PERFORM award_points_and_log(NEW.user_id, 'friend_added', 20);
    PERFORM award_points_and_log(NEW.friend_id, 'friend_added', 20);
    PERFORM check_and_award_badges(NEW.user_id);
    PERFORM check_and_award_badges(NEW.friend_id);

    SELECT NULLIF(trim(full_name), '') INTO accepter_name
    FROM public.profiles WHERE id = NEW.friend_id;

    INSERT INTO public.notifications (
      user_id, actor_id, type, title, message, related_id, action_url, metadata
    ) VALUES (
      NEW.user_id,
      NEW.friend_id,
      'friend_accepted',
      'Friend request accepted',
      COALESCE(accepter_name, 'Someone') || ' accepted your friend request',
      NEW.id,
      '/profile/' || NEW.friend_id::text,
      jsonb_build_object('friendship_id', NEW.id, 'accepter_id', NEW.friend_id)
    );
  END IF;
  RETURN NEW;
END;
$$;