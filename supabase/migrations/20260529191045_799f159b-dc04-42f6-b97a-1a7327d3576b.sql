CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _recipients UUID[];
  _sender_name TEXT;
  _preview TEXT;
BEGIN
  SELECT array_agg(user_id) INTO _recipients
  FROM public.conversation_participants
  WHERE conversation_id = NEW.conversation_id
    AND user_id <> NEW.sender_id;

  IF _recipients IS NULL OR array_length(_recipients,1) IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(full_name, username, 'New message')
    INTO _sender_name
    FROM public.profiles WHERE id = NEW.sender_id LIMIT 1;

  _preview := COALESCE(LEFT(NEW.content, 120), 'Sent a message');

  PERFORM public.dispatch_push(
    _recipients,
    jsonb_build_object(
      'kind', 'message',
      'title', COALESCE(_sender_name, 'New message'),
      'body', _preview,
      'conversation_id', NEW.conversation_id,
      'url', '/messenger'
    )
  );
  RETURN NEW;
END;
$function$;