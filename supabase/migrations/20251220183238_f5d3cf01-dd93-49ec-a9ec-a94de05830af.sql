-- Create bazaar_orders table for order tracking
CREATE TABLE public.bazaar_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id UUID REFERENCES public.bazaar_transactions(id),
  item_id UUID NOT NULL REFERENCES public.bazaar_items(id),
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL,
  seller_payout NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'shipped', 'delivered', 'completed', 'cancelled')),
  shipping_address TEXT,
  buyer_notes TEXT,
  stripe_session_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  shipped_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bazaar_order_messages table for chat between buyer and seller
CREATE TABLE public.bazaar_order_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.bazaar_orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bazaar_notifications table
CREATE TABLE public.bazaar_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  order_id UUID REFERENCES public.bazaar_orders(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bazaar_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazaar_order_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazaar_notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for bazaar_orders
CREATE POLICY "Users can view their own orders"
ON public.bazaar_orders
FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can create orders as buyer"
ON public.bazaar_orders
FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update their own orders"
ON public.bazaar_orders
FOR UPDATE
USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

-- RLS policies for bazaar_order_messages
CREATE POLICY "Users can view order messages"
ON public.bazaar_order_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bazaar_orders
    WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

CREATE POLICY "Users can send order messages"
ON public.bazaar_order_messages
FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.bazaar_orders
    WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

CREATE POLICY "Users can update own messages"
ON public.bazaar_order_messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.bazaar_orders
    WHERE id = order_id AND (buyer_id = auth.uid() OR seller_id = auth.uid())
  )
);

-- RLS policies for bazaar_notifications
CREATE POLICY "Users can view their notifications"
ON public.bazaar_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their notifications"
ON public.bazaar_notifications
FOR UPDATE
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_bazaar_orders_buyer ON public.bazaar_orders(buyer_id);
CREATE INDEX idx_bazaar_orders_seller ON public.bazaar_orders(seller_id);
CREATE INDEX idx_bazaar_orders_status ON public.bazaar_orders(status);
CREATE INDEX idx_bazaar_order_messages_order ON public.bazaar_order_messages(order_id);
CREATE INDEX idx_bazaar_notifications_user ON public.bazaar_notifications(user_id);

-- Function to notify seller of new order
CREATE OR REPLACE FUNCTION public.notify_bazaar_seller()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.bazaar_notifications (user_id, order_id, type, title, message)
  VALUES (
    NEW.seller_id,
    NEW.id,
    'new_order',
    'New Order Received!',
    'You have a new order. Please prepare the item for shipping.'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new order notification
CREATE TRIGGER trigger_notify_bazaar_seller
AFTER INSERT ON public.bazaar_orders
FOR EACH ROW
WHEN (NEW.status = 'paid')
EXECUTE FUNCTION public.notify_bazaar_seller();

-- Function to notify buyer of shipment
CREATE OR REPLACE FUNCTION public.notify_bazaar_buyer_shipped()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'paid' AND NEW.status = 'shipped' THEN
    INSERT INTO public.bazaar_notifications (user_id, order_id, type, title, message)
    VALUES (
      NEW.buyer_id,
      NEW.id,
      'item_shipped',
      'Item Shipped!',
      'Your order has been shipped. Please confirm when you receive it.'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for shipment notification
CREATE TRIGGER trigger_notify_bazaar_buyer_shipped
AFTER UPDATE ON public.bazaar_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_bazaar_buyer_shipped();

-- Function to notify seller of delivery confirmation
CREATE OR REPLACE FUNCTION public.notify_bazaar_seller_delivered()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status = 'shipped' AND NEW.status = 'delivered' THEN
    INSERT INTO public.bazaar_notifications (user_id, order_id, type, title, message)
    VALUES (
      NEW.seller_id,
      NEW.id,
      'item_delivered',
      'Item Delivered!',
      'The buyer confirmed receiving the item. Transaction completed!'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for delivery notification
CREATE TRIGGER trigger_notify_bazaar_seller_delivered
AFTER UPDATE ON public.bazaar_orders
FOR EACH ROW
EXECUTE FUNCTION public.notify_bazaar_seller_delivered();