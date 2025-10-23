-- Create businesses table
CREATE TABLE public.businesses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  whatsapp TEXT,
  category TEXT NOT NULL,
  logo_url TEXT,
  cover_image_url TEXT,
  opening_hours JSONB DEFAULT '{}'::jsonb,
  is_open_now BOOLEAN DEFAULT true,
  latitude NUMERIC,
  longitude NUMERIC,
  qr_code_url TEXT,
  unique_url_slug TEXT UNIQUE,
  total_rating NUMERIC DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_products table
CREATE TABLE public.business_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT NOT NULL,
  is_available BOOLEAN DEFAULT true,
  translations JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_orders table
CREATE TABLE public.business_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  total_amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'cash',
  pickup_time TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_reviews table
CREATE TABLE public.business_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create business_subscriptions table
CREATE TABLE public.business_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  tier TEXT NOT NULL DEFAULT 'free',
  price NUMERIC NOT NULL DEFAULT 0,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for businesses
CREATE POLICY "Anyone can view active businesses"
  ON public.businesses FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can create their own businesses"
  ON public.businesses FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their businesses"
  ON public.businesses FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their businesses"
  ON public.businesses FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for business_products
CREATE POLICY "Anyone can view available products"
  ON public.business_products FOR SELECT
  USING (is_available = true);

CREATE POLICY "Business owners can create products"
  ON public.business_products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_products.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their products"
  ON public.business_products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_products.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can delete their products"
  ON public.business_products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_products.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- RLS Policies for business_orders
CREATE POLICY "Customers can view their orders"
  ON public.business_orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Business owners can view their orders"
  ON public.business_orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_orders.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create orders"
  ON public.business_orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Business owners can update orders"
  ON public.business_orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_orders.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- RLS Policies for business_reviews
CREATE POLICY "Anyone can view reviews"
  ON public.business_reviews FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create reviews"
  ON public.business_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.business_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.business_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for business_subscriptions
CREATE POLICY "Business owners can view their subscriptions"
  ON public.business_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_subscriptions.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can create subscriptions"
  ON public.business_subscriptions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_subscriptions.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update their subscriptions"
  ON public.business_subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE businesses.id = business_subscriptions.business_id
      AND businesses.owner_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX idx_businesses_category ON public.businesses(category);
CREATE INDEX idx_businesses_location ON public.businesses(latitude, longitude);
CREATE INDEX idx_businesses_owner ON public.businesses(owner_id);
CREATE INDEX idx_business_products_business ON public.business_products(business_id);
CREATE INDEX idx_business_orders_business ON public.business_orders(business_id);
CREATE INDEX idx_business_orders_customer ON public.business_orders(customer_id);
CREATE INDEX idx_business_reviews_business ON public.business_reviews(business_id);

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_products_updated_at
  BEFORE UPDATE ON public.business_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_orders_updated_at
  BEFORE UPDATE ON public.business_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_subscriptions_updated_at
  BEFORE UPDATE ON public.business_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();