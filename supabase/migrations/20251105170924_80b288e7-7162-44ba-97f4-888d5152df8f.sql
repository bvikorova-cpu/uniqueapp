-- Home Decor Marketplace Tables

-- Decor Products Table
CREATE TABLE public.decor_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  category TEXT NOT NULL,
  style TEXT NOT NULL,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  is_available BOOLEAN NOT NULL DEFAULT true,
  sales_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Decor Subscriptions Table
CREATE TABLE public.decor_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_type TEXT NOT NULL DEFAULT 'pro',
  status TEXT NOT NULL DEFAULT 'active',
  designs_used INTEGER NOT NULL DEFAULT 0,
  designs_limit INTEGER NOT NULL DEFAULT 50,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- AI Room Designs Table
CREATE TABLE public.ai_room_designs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  room_image_url TEXT NOT NULL,
  style TEXT NOT NULL,
  ai_design_url TEXT,
  suggested_products UUID[] DEFAULT '{}',
  is_saved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- AR Previews Table
CREATE TABLE public.ar_preview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.decor_products(id) ON DELETE CASCADE,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL DEFAULT 0.99,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Decor Sales Table
CREATE TABLE public.decor_sales (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.decor_products(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  commission DECIMAL(10,2) NOT NULL,
  seller_amount DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.decor_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decor_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_room_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ar_preview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decor_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for decor_products
CREATE POLICY "Products are viewable by everyone"
  ON public.decor_products FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own products"
  ON public.decor_products FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Users can update their own products"
  ON public.decor_products FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Users can delete their own products"
  ON public.decor_products FOR DELETE
  USING (auth.uid() = seller_id);

-- RLS Policies for decor_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.decor_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON public.decor_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.decor_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for ai_room_designs
CREATE POLICY "Users can view their own designs"
  ON public.ai_room_designs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own designs"
  ON public.ai_room_designs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own designs"
  ON public.ai_room_designs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own designs"
  ON public.ai_room_designs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ar_preview_sessions
CREATE POLICY "Users can view their own AR sessions"
  ON public.ar_preview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AR sessions"
  ON public.ar_preview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for decor_sales
CREATE POLICY "Users can view their sales as buyer or seller"
  ON public.decor_sales FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "System can insert sales"
  ON public.decor_sales FOR INSERT
  WITH CHECK (true);

-- Triggers for updated_at
CREATE TRIGGER update_decor_products_updated_at
  BEFORE UPDATE ON public.decor_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_decor_subscriptions_updated_at
  BEFORE UPDATE ON public.decor_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_decor_products_seller ON public.decor_products(seller_id);
CREATE INDEX idx_decor_products_style ON public.decor_products(style);
CREATE INDEX idx_decor_products_category ON public.decor_products(category);
CREATE INDEX idx_decor_subscriptions_user ON public.decor_subscriptions(user_id);
CREATE INDEX idx_ai_room_designs_user ON public.ai_room_designs(user_id);
CREATE INDEX idx_ar_preview_user ON public.ar_preview_sessions(user_id);
CREATE INDEX idx_decor_sales_product ON public.decor_sales(product_id);
CREATE INDEX idx_decor_sales_buyer ON public.decor_sales(buyer_id);
CREATE INDEX idx_decor_sales_seller ON public.decor_sales(seller_id);