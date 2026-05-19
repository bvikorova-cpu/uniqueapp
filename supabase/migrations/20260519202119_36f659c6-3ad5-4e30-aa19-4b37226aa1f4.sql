ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS action_url text,
  ADD COLUMN IF NOT EXISTS metadata jsonb DEFAULT '{}'::jsonb;

CREATE INDEX IF NOT EXISTS idx_notifications_type_related_id
  ON public.notifications(type, related_id);

CREATE OR REPLACE FUNCTION public.notify_friend_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  requester_name text;
BEGIN
  IF NEW.status = 'pending' THEN
    SELECT NULLIF(trim(full_name), '') INTO requester_name
    FROM public.profiles
    WHERE id = NEW.user_id;

    INSERT INTO public.notifications (
      user_id,
      actor_id,
      type,
      title,
      message,
      related_id,
      action_url,
      metadata
    )
    VALUES (
      NEW.friend_id,
      NEW.user_id,
      'friend_request',
      'New friend request',
      COALESCE(requester_name, 'Someone') || ' sent you a friend request',
      NEW.id,
      '/friends?tab=requests',
      jsonb_build_object(
        'friendship_id', NEW.id,
        'requester_id', NEW.user_id
      )
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_friend_request_created ON public.friendships;
CREATE TRIGGER on_friend_request_created
AFTER INSERT ON public.friendships
FOR EACH ROW
EXECUTE FUNCTION public.notify_friend_request();