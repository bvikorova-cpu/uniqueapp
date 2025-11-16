-- Create crystal marketplace items table
CREATE TABLE IF NOT EXISTS public.crystal_marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  crystal_type TEXT NOT NULL,
  weight_grams DECIMAL(10,2),
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  energy_profile JSONB,
  authenticity_certificate TEXT,
  is_available BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create crystal marketplace orders table
CREATE TABLE IF NOT EXISTS public.crystal_marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.crystal_marketplace_items(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  seller_amount DECIMAL(10,2) NOT NULL,
  stripe_payment_id TEXT,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create crystal energy readings table
CREATE TABLE IF NOT EXISTS public.crystal_energy_readings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  energy_level INTEGER,
  energy_analysis JSONB,
  recommended_crystals JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.crystal_marketplace_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crystal_marketplace_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crystal_energy_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for crystal_marketplace_items
CREATE POLICY "Anyone can view available items"
  ON public.crystal_marketplace_items FOR SELECT
  USING (is_available = true);

CREATE POLICY "Sellers can insert their own items"
  ON public.crystal_marketplace_items FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update their own items"
  ON public.crystal_marketplace_items FOR UPDATE
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can delete their own items"
  ON public.crystal_marketplace_items FOR DELETE
  USING (auth.uid() = seller_id);

-- RLS Policies for crystal_marketplace_orders
CREATE POLICY "Users can view their own orders"
  ON public.crystal_marketplace_orders FOR SELECT
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id);

CREATE POLICY "Users can insert orders"
  ON public.crystal_marketplace_orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can update their orders"
  ON public.crystal_marketplace_orders FOR UPDATE
  USING (auth.uid() = seller_id);

-- RLS Policies for crystal_energy_readings
CREATE POLICY "Users can view their own readings"
  ON public.crystal_energy_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own readings"
  ON public.crystal_energy_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_crystal_items_seller ON public.crystal_marketplace_items(seller_id);
CREATE INDEX idx_crystal_items_available ON public.crystal_marketplace_items(is_available);
CREATE INDEX idx_crystal_orders_buyer ON public.crystal_marketplace_orders(buyer_id);
CREATE INDEX idx_crystal_orders_seller ON public.crystal_marketplace_orders(seller_id);
CREATE INDEX idx_crystal_readings_user ON public.crystal_energy_readings(user_id);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_crystal_marketplace_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_crystal_marketplace_items_updated_at
  BEFORE UPDATE ON public.crystal_marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION update_crystal_marketplace_updated_at();

CREATE TRIGGER update_crystal_marketplace_orders_updated_at
  BEFORE UPDATE ON public.crystal_marketplace_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_crystal_marketplace_updated_at();