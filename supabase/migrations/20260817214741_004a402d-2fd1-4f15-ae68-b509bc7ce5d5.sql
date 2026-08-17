CREATE OR REPLACE FUNCTION public.notify_skill_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_name text;
  v_title text;
BEGIN
  IF NEW.receiver_id IS NULL OR NEW.receiver_id = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(p.full_name, ''), 'A user') INTO v_name
  FROM public.profiles p WHERE p.id = NEW.sender_id;

  SELECT title INTO v_title FROM public.skill_offerings WHERE id = NEW.offering_id;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (
    NEW.receiver_id,
    NEW.sender_id,
    'New skill message',
    COALESCE(v_name, 'A user') || COALESCE(' · ' || v_title, '') || ': ' || left(COALESCE(NEW.message, ''), 80),
    'skill_message',
    NEW.offering_id,
    '/skills-marketplace'
  );

  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS trg_notify_skill_message ON public.marketplace_responses;
CREATE TRIGGER trg_notify_skill_message
AFTER INSERT ON public.marketplace_responses
FOR EACH ROW EXECUTE FUNCTION public.notify_skill_message();