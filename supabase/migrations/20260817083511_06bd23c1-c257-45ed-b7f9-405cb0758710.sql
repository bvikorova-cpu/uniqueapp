CREATE OR REPLACE FUNCTION public.notify_coffee_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_recipient uuid;
  v_name text;
BEGIN
  SELECT CASE WHEN m.user1_id = NEW.sender_id THEN m.user2_id ELSE m.user1_id END
  INTO v_recipient
  FROM public.coffee_matches m
  WHERE m.id = NEW.match_id;

  IF v_recipient IS NULL OR v_recipient = NEW.sender_id THEN
    RETURN NEW;
  END IF;

  SELECT COALESCE(NULLIF(p.full_name, ''), 'Coffee buddy') INTO v_name
  FROM public.profiles p WHERE p.id = NEW.sender_id;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (
    v_recipient,
    NEW.sender_id,
    'New coffee message',
    COALESCE(v_name, 'Coffee buddy') || ': ' || left(NEW.message, 80),
    'coffee_message',
    NEW.match_id,
    '/coffee'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_coffee_message ON public.coffee_match_messages;
CREATE TRIGGER trg_notify_coffee_message
AFTER INSERT ON public.coffee_match_messages
FOR EACH ROW EXECUTE FUNCTION public.notify_coffee_message();