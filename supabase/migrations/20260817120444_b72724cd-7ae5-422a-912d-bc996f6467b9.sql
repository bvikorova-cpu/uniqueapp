CREATE OR REPLACE FUNCTION public.notify_property_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_recipient uuid;
  v_name text;
  v_title text;
BEGIN
  v_recipient := CASE WHEN NEW.sender_id = NEW.buyer_id THEN NEW.seller_id ELSE NEW.buyer_id END;

  IF v_recipient IS NULL OR v_recipient = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(p.full_name, ''), 'A user') INTO v_name
  FROM public.profiles p WHERE p.id = NEW.sender_id;

  SELECT title INTO v_title FROM public.properties WHERE id = NEW.property_id;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (
    v_recipient,
    NEW.sender_id,
    'New property message',
    COALESCE(v_name, 'A user') || COALESCE(' · ' || v_title, '') || ': ' || left(NEW.content, 80),
    'property_message',
    NEW.property_id,
    '/property-marketplace'
  );

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_notify_property_message ON public.property_messages;
CREATE TRIGGER trg_notify_property_message
AFTER INSERT ON public.property_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_property_message();