CREATE OR REPLACE FUNCTION public.send_user_notification(
  _user_id uuid,
  _type text,
  _title text,
  _message text,
  _related_id uuid DEFAULT NULL,
  _action_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _sender uuid := auth.uid();
  _recent int;
  _id uuid;
BEGIN
  IF _sender IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'recipient required';
  END IF;

  -- Anti-spam: max 60 notifications sent by one user per hour
  SELECT count(*) INTO _recent
  FROM public.notifications
  WHERE actor_id = _sender AND created_at > now() - interval '1 hour';

  IF _recent > 60 THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.notifications (user_id, type, title, message, related_id, action_url, actor_id, is_read)
  VALUES (_user_id, coalesce(_type, 'info'), left(coalesce(_title, 'Notification'), 200), left(coalesce(_message, ''), 500), _related_id, _action_url, _sender, false)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.send_user_notification(uuid, text, text, text, uuid, text) TO authenticated;