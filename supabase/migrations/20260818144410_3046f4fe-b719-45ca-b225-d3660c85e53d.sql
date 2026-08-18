CREATE OR REPLACE FUNCTION public.notify_bazaar_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.push_notification(NEW.receiver_id, NEW.sender_id, 'bazaar_message', 'New Bazaar message',
    public.actor_name(NEW.sender_id) || ' sent you a message about a listing', '/bazaar/messages', NEW.item_id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_skill_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
    '/skills-marketplace?messages=1'
  );

  RETURN NEW;
END;
$$;