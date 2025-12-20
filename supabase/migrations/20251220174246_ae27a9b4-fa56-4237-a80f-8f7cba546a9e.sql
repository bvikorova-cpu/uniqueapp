-- Add notifications table for marketplace if not exists
CREATE TABLE IF NOT EXISTS public.marketplace_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    order_id UUID REFERENCES public.service_orders(id) ON DELETE CASCADE,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their notifications"
ON public.marketplace_notifications FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.marketplace_notifications FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their notifications"
ON public.marketplace_notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_marketplace_notifications_user ON public.marketplace_notifications(user_id);
CREATE INDEX idx_marketplace_notifications_unread ON public.marketplace_notifications(user_id, is_read) WHERE is_read = false;

-- Function to notify seller on new order
CREATE OR REPLACE FUNCTION public.notify_seller_new_order()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_offering_title TEXT;
  v_buyer_name TEXT;
BEGIN
  -- Get offering title
  SELECT title INTO v_offering_title
  FROM public.skill_offerings
  WHERE id = NEW.offering_id;
  
  -- Get buyer name
  SELECT full_name INTO v_buyer_name
  FROM public.profiles
  WHERE id = NEW.buyer_id;
  
  -- Create notification for seller
  INSERT INTO public.marketplace_notifications (user_id, type, title, message, order_id)
  VALUES (
    NEW.seller_id,
    'new_order',
    'New Order Received!',
    COALESCE(v_buyer_name, 'A customer') || ' ordered your service: ' || COALESCE(v_offering_title, 'Service'),
    NEW.id
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to notify seller on new order
CREATE TRIGGER trigger_notify_seller_new_order
AFTER INSERT ON public.service_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_seller_new_order();