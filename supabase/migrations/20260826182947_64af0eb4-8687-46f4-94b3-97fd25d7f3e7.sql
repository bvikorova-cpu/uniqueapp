CREATE OR REPLACE FUNCTION public.notify_megatalent_tip_received()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sender_name text;
  sender_avatar text;
BEGIN
  IF NEW.status <> 'completed' THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'UPDATE' AND OLD.status = 'completed' THEN
    RETURN NEW;
  END IF;

  IF NEW.tipper_id IS NOT NULL THEN
    SELECT COALESCE(p.full_name, p.username), p.avatar_url
      INTO sender_name, sender_avatar
    FROM public.profiles p
    WHERE p.id = NEW.tipper_id;
  END IF;

  IF NEW.tipper_name IS NULL AND sender_name IS NOT NULL THEN
    NEW.tipper_name := sender_name;
  END IF;
  IF NEW.tipper_avatar_url IS NULL AND sender_avatar IS NOT NULL THEN
    NEW.tipper_avatar_url := sender_avatar;
  END IF;

  INSERT INTO public.notifications (user_id, title, message, type, related_id, actor_id, action_url, metadata)
  VALUES (
    NEW.creator_id,
    'New gift received',
    COALESCE(NEW.tipper_name, sender_name, 'Someone') || ' sent you a gift of EUR ' ||
      to_char((NEW.amount_cents::numeric / 100), 'FM999999990.00') ||
      CASE WHEN NEW.message IS NOT NULL AND length(trim(NEW.message)) > 0
           THEN ': "' || NEW.message || '"' ELSE '' END,
    'tip_received',
    NEW.id,
    NEW.tipper_id,
    '/profile',
    jsonb_build_object(
      'amount_cents', NEW.amount_cents,
      'creator_amount_cents', NEW.creator_amount_cents
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_megatalent_tip_received ON public.megatalent_tips;
CREATE TRIGGER trg_notify_megatalent_tip_received
BEFORE INSERT OR UPDATE OF status ON public.megatalent_tips
FOR EACH ROW
EXECUTE FUNCTION public.notify_megatalent_tip_received();