CREATE OR REPLACE FUNCTION public.notify_skill_marketplace_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
  v_url text;
  v_msg_title text;
BEGIN
  SELECT title INTO v_title FROM public.skill_offerings WHERE id = NEW.offering_id;
  IF NEW.order_id IS NOT NULL THEN
    v_url := '/skills-marketplace/orders/' || NEW.order_id::text;
    v_msg_title := 'New message on your order';
  ELSE
    v_url := '/skills-marketplace/' || NEW.offering_id::text;
    v_msg_title := 'New message on your offering';
  END IF;
  INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, related_id)
  VALUES (
    NEW.receiver_id,
    NEW.sender_id,
    CASE WHEN NEW.order_id IS NOT NULL THEN 'skill_order_message' ELSE 'skill_marketplace_response' END,
    v_msg_title,
    COALESCE('"' || v_title || '": ', '') || left(NEW.message, 200),
    v_url,
    COALESCE(NEW.order_id, NEW.offering_id)
  );
  RETURN NEW;
END;
$$;