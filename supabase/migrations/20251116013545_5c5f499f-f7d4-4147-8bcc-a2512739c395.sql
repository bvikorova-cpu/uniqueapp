-- Add virtual tour column to properties table
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS virtual_tour_url TEXT;

-- Create virtual tour purchases table
CREATE TABLE IF NOT EXISTS public.property_virtual_tour_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '1 year'),
  amount_paid NUMERIC(10,2) NOT NULL,
  stripe_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_virtual_tour_purchases_property_id 
  ON public.property_virtual_tour_purchases(property_id);
CREATE INDEX IF NOT EXISTS idx_virtual_tour_purchases_user_id 
  ON public.property_virtual_tour_purchases(user_id);

-- Enable RLS
ALTER TABLE public.property_virtual_tour_purchases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own virtual tour purchases"
  ON public.property_virtual_tour_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view purchases for their properties"
  ON public.property_virtual_tour_purchases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_virtual_tour_purchases.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create purchases"
  ON public.property_virtual_tour_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);