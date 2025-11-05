-- Create design consultations table (if not exists)
CREATE TABLE IF NOT EXISTS public.design_consultations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  designer_id UUID REFERENCES auth.users(id),
  duration INTEGER NOT NULL CHECK (duration IN (30, 60)),
  price DECIMAL(10,2) NOT NULL,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  meeting_url TEXT,
  notes TEXT,
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for consultations
ALTER TABLE public.design_consultations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for consultations
DROP POLICY IF EXISTS "Users can view their own consultations" ON public.design_consultations;
CREATE POLICY "Users can view their own consultations"
  ON public.design_consultations
  FOR SELECT
  USING (auth.uid() = user_id OR auth.uid() = designer_id);

DROP POLICY IF EXISTS "Users can create consultations" ON public.design_consultations;
CREATE POLICY "Users can create consultations"
  ON public.design_consultations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their consultations" ON public.design_consultations;
CREATE POLICY "Users can update their consultations"
  ON public.design_consultations
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.uid() = designer_id);

-- Create AR previews table
CREATE TABLE IF NOT EXISTS public.ar_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.home_decor_items(id) ON DELETE CASCADE,
  room_image_url TEXT NOT NULL,
  ar_preview_url TEXT,
  price DECIMAL(10,2) DEFAULT 0.99,
  payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for AR previews
ALTER TABLE public.ar_previews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for AR previews
DROP POLICY IF EXISTS "Users can view their own AR previews" ON public.ar_previews;
CREATE POLICY "Users can view their own AR previews"
  ON public.ar_previews
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create AR previews" ON public.ar_previews;
CREATE POLICY "Users can create AR previews"
  ON public.ar_previews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create marketplace sales table for commission tracking
CREATE TABLE IF NOT EXISTS public.home_decor_sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id UUID NOT NULL REFERENCES public.home_decor_items(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sale_price DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 15.00,
  commission_amount DECIMAL(10,2),
  seller_amount DECIMAL(10,2),
  payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for sales
ALTER TABLE public.home_decor_sales ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sales
DROP POLICY IF EXISTS "Users can view their sales and purchases" ON public.home_decor_sales;
CREATE POLICY "Users can view their sales and purchases"
  ON public.home_decor_sales
  FOR SELECT
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id);

-- Create trigger for updating consultation timestamp
DROP TRIGGER IF EXISTS update_design_consultations_updated_at ON public.design_consultations;
CREATE TRIGGER update_design_consultations_updated_at
  BEFORE UPDATE ON public.design_consultations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to calculate commission on sale
CREATE OR REPLACE FUNCTION calculate_decor_commission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.commission_amount := NEW.sale_price * (NEW.commission_rate / 100);
  NEW.seller_amount := NEW.sale_price - NEW.commission_amount;
  RETURN NEW;
END;
$$;

-- Create trigger for commission calculation
DROP TRIGGER IF EXISTS calculate_home_decor_commission ON public.home_decor_sales;
CREATE TRIGGER calculate_home_decor_commission
  BEFORE INSERT OR UPDATE ON public.home_decor_sales
  FOR EACH ROW
  EXECUTE FUNCTION calculate_decor_commission();