-- Table for service orders
CREATE TABLE public.service_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    offering_id UUID NOT NULL REFERENCES public.skill_offerings(id) ON DELETE CASCADE,
    buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    seller_id UUID NOT NULL,
    requirements TEXT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    commission_rate NUMERIC(5,4) NOT NULL DEFAULT 0.15,
    commission_amount NUMERIC(10,2) NOT NULL,
    seller_payout NUMERIC(10,2) NOT NULL,
    delivery_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'delivered', 'completed', 'cancelled', 'disputed')),
    stripe_session_id TEXT,
    stripe_payment_intent_id TEXT,
    payment_completed_at TIMESTAMP WITH TIME ZONE,
    delivered_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for order chat messages
CREATE TABLE public.service_order_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.service_orders(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL,
    message TEXT NOT NULL,
    attachment_url TEXT,
    is_delivery BOOLEAN DEFAULT false,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_order_messages ENABLE ROW LEVEL SECURITY;

-- RLS policies for service_orders
CREATE POLICY "Buyers can view their orders"
ON public.service_orders FOR SELECT
USING (auth.uid() = buyer_id);

CREATE POLICY "Sellers can view orders for their services"
ON public.service_orders FOR SELECT
USING (auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create orders"
ON public.service_orders FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update their orders"
ON public.service_orders FOR UPDATE
USING (auth.uid() = seller_id);

CREATE POLICY "Buyers can update order status to completed"
ON public.service_orders FOR UPDATE
USING (auth.uid() = buyer_id AND status IN ('delivered'));

-- RLS policies for service_order_messages
CREATE POLICY "Order participants can view messages"
ON public.service_order_messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.service_orders 
        WHERE id = order_id 
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
);

CREATE POLICY "Order participants can send messages"
ON public.service_order_messages FOR INSERT
WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
        SELECT 1 FROM public.service_orders 
        WHERE id = order_id 
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
);

CREATE POLICY "Users can mark messages as read"
ON public.service_order_messages FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.service_orders 
        WHERE id = order_id 
        AND (buyer_id = auth.uid() OR seller_id = auth.uid())
    )
);

-- Indexes for performance
CREATE INDEX idx_service_orders_buyer ON public.service_orders(buyer_id);
CREATE INDEX idx_service_orders_seller ON public.service_orders(seller_id);
CREATE INDEX idx_service_orders_offering ON public.service_orders(offering_id);
CREATE INDEX idx_service_orders_status ON public.service_orders(status);
CREATE INDEX idx_service_order_messages_order ON public.service_order_messages(order_id);

-- Trigger to update updated_at
CREATE TRIGGER update_service_orders_updated_at
    BEFORE UPDATE ON public.service_orders
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();