
-- 1) Owner can see own offerings regardless of is_active
DROP POLICY IF EXISTS "Owners view own skill offerings" ON public.skill_offerings;
CREATE POLICY "Owners view own skill offerings"
ON public.skill_offerings
FOR SELECT
USING (auth.uid() = user_id);

-- 2) Notification on marketplace_responses INSERT (to offering receiver)
CREATE OR REPLACE FUNCTION public.notify_skill_marketplace_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
BEGIN
  SELECT title INTO v_title FROM public.skill_offerings WHERE id = NEW.offering_id;
  INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, related_id)
  VALUES (
    NEW.receiver_id,
    NEW.sender_id,
    'skill_marketplace_response',
    'New message on your offering',
    COALESCE('"' || v_title || '": ', '') || left(NEW.message, 200),
    '/skills-marketplace/' || NEW.offering_id::text,
    NEW.offering_id
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_skill_marketplace_response ON public.marketplace_responses;
CREATE TRIGGER trg_notify_skill_marketplace_response
AFTER INSERT ON public.marketplace_responses
FOR EACH ROW EXECUTE FUNCTION public.notify_skill_marketplace_response();

-- 3) Notifications for skill_service_orders lifecycle
CREATE OR REPLACE FUNCTION public.notify_skill_service_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_title text;
BEGIN
  SELECT title INTO v_title FROM public.skill_offerings WHERE id = NEW.offering_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, related_id)
    VALUES (
      NEW.seller_id, NEW.buyer_id,
      'skill_order_new',
      'New order received',
      COALESCE(v_title, 'Skill order') || ' (' || NEW.hours || 'h)',
      '/skills-marketplace/orders',
      NEW.id
    );
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status IS DISTINCT FROM OLD.status THEN
    IF NEW.status = 'paid' THEN
      INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, related_id)
      VALUES (
        NEW.seller_id, NEW.buyer_id,
        'skill_order_paid',
        'Order paid',
        'Buyer paid for "' || COALESCE(v_title, 'your offering') || '"',
        '/skills-marketplace/orders',
        NEW.id
      );
    ELSIF NEW.status = 'completed' THEN
      -- notify both sides
      INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, related_id)
      VALUES
      (NEW.buyer_id, NEW.seller_id, 'skill_order_completed', 'Order completed',
       'Order "' || COALESCE(v_title, '') || '" was marked completed — please leave a review.',
       '/skills-marketplace/orders', NEW.id),
      (NEW.seller_id, NEW.buyer_id, 'skill_order_completed', 'Order completed',
       'Order "' || COALESCE(v_title, '') || '" was marked completed.',
       '/skills-marketplace/orders', NEW.id);
    ELSIF NEW.status = 'cancelled' THEN
      INSERT INTO public.notifications (user_id, actor_id, type, title, message, action_url, related_id)
      VALUES
      (CASE WHEN auth.uid() = NEW.buyer_id THEN NEW.seller_id ELSE NEW.buyer_id END,
       COALESCE(auth.uid(), NEW.buyer_id),
       'skill_order_cancelled',
       'Order cancelled',
       'Order "' || COALESCE(v_title, '') || '" was cancelled.',
       '/skills-marketplace/orders',
       NEW.id);
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_skill_service_order_ins ON public.skill_service_orders;
CREATE TRIGGER trg_notify_skill_service_order_ins
AFTER INSERT ON public.skill_service_orders
FOR EACH ROW EXECUTE FUNCTION public.notify_skill_service_order();

DROP TRIGGER IF EXISTS trg_notify_skill_service_order_upd ON public.skill_service_orders;
CREATE TRIGGER trg_notify_skill_service_order_upd
AFTER UPDATE ON public.skill_service_orders
FOR EACH ROW EXECUTE FUNCTION public.notify_skill_service_order();
