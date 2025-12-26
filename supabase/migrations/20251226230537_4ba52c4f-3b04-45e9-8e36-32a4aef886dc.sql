-- Create coupon marketplace tables

-- Main coupons table
CREATE TABLE public.coupon_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  store_name TEXT NOT NULL,
  original_value DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  discount_code TEXT,
  expiry_date DATE,
  category TEXT NOT NULL DEFAULT 'general',
  coupon_type TEXT NOT NULL DEFAULT 'discount_code',
  is_digital BOOLEAN DEFAULT true,
  image_url TEXT,
  terms_conditions TEXT,
  is_active BOOLEAN DEFAULT true,
  is_sold BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coupon orders table
CREATE TABLE public.coupon_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupon_listings(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL,
  seller_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  seller_payout DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  buyer_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coupon messages table
CREATE TABLE public.coupon_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupon_listings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Coupon escrow table
CREATE TABLE public.coupon_escrow (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.coupon_orders(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  seller_payout DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  held_at TIMESTAMP WITH TIME ZONE,
  released_at TIMESTAMP WITH TIME ZONE,
  refunded_at TIMESTAMP WITH TIME ZONE,
  auto_release_at TIMESTAMP WITH TIME ZONE NOT NULL,
  stripe_transfer_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.coupon_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_escrow ENABLE ROW LEVEL SECURITY;

-- Coupon listings policies
CREATE POLICY "Anyone can view active coupon listings"
  ON public.coupon_listings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own coupon listings"
  ON public.coupon_listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coupon listings"
  ON public.coupon_listings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coupon listings"
  ON public.coupon_listings FOR DELETE
  USING (auth.uid() = user_id);

-- Coupon orders policies
CREATE POLICY "Users can view their own orders as buyer or seller"
  ON public.coupon_orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Authenticated users can create orders"
  ON public.coupon_orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update order status"
  ON public.coupon_orders FOR UPDATE
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Coupon messages policies
CREATE POLICY "Users can view their own messages"
  ON public.coupon_messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Authenticated users can send messages"
  ON public.coupon_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Coupon escrow policies
CREATE POLICY "Users can view escrow for their orders"
  ON public.coupon_escrow FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coupon_orders
      WHERE coupon_orders.id = coupon_escrow.order_id
      AND (coupon_orders.buyer_id = auth.uid() OR coupon_orders.seller_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX idx_coupon_listings_user_id ON public.coupon_listings(user_id);
CREATE INDEX idx_coupon_listings_category ON public.coupon_listings(category);
CREATE INDEX idx_coupon_listings_store ON public.coupon_listings(store_name);
CREATE INDEX idx_coupon_orders_buyer_id ON public.coupon_orders(buyer_id);
CREATE INDEX idx_coupon_orders_seller_id ON public.coupon_orders(seller_id);
CREATE INDEX idx_coupon_messages_coupon_id ON public.coupon_messages(coupon_id);

-- Create storage bucket for coupon images
INSERT INTO storage.buckets (id, name, public) VALUES ('coupon_images', 'coupon_images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for coupon images
CREATE POLICY "Anyone can view coupon images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'coupon_images');

CREATE POLICY "Authenticated users can upload coupon images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'coupon_images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own coupon images"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'coupon_images' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own coupon images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'coupon_images' AND auth.uid()::text = (storage.foldername(name))[1]);