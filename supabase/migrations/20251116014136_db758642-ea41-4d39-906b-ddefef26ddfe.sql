-- Create lead boost purchases table
CREATE TABLE IF NOT EXISTS public.property_lead_boost_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  purchased_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  amount_paid NUMERIC(10,2) NOT NULL,
  stripe_payment_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  emails_sent INTEGER DEFAULT 0,
  target_emails INTEGER DEFAULT 1000,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_lead_boost_purchases_property_id 
  ON public.property_lead_boost_purchases(property_id);
CREATE INDEX IF NOT EXISTS idx_lead_boost_purchases_user_id 
  ON public.property_lead_boost_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_boost_purchases_status 
  ON public.property_lead_boost_purchases(status);

-- Enable RLS
ALTER TABLE public.property_lead_boost_purchases ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own lead boost purchases"
  ON public.property_lead_boost_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Property owners can view purchases for their properties"
  ON public.property_lead_boost_purchases
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_lead_boost_purchases.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create purchases"
  ON public.property_lead_boost_purchases
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);