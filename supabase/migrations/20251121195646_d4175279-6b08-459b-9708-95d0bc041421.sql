-- Create campaign_payments table to track brand payments for approved applications
CREATE TABLE public.campaign_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES public.brand_campaigns(id) ON DELETE CASCADE,
  application_id UUID NOT NULL REFERENCES public.campaign_applications(id) ON DELETE CASCADE,
  brand_user_id UUID NOT NULL,
  influencer_user_id UUID NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  influencer_amount DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaign_payments ENABLE ROW LEVEL SECURITY;

-- Brand can see their own payments
CREATE POLICY "Brands can view their own payments"
  ON public.campaign_payments
  FOR SELECT
  USING (auth.uid() = brand_user_id);

-- Influencers can see payments for their applications
CREATE POLICY "Influencers can view their payments"
  ON public.campaign_payments
  FOR SELECT
  USING (auth.uid() = influencer_user_id);

-- System can insert payments (via edge functions)
CREATE POLICY "Service role can manage payments"
  ON public.campaign_payments
  FOR ALL
  USING (auth.role() = 'service_role');

-- Create index for faster queries
CREATE INDEX idx_campaign_payments_application ON public.campaign_payments(application_id);
CREATE INDEX idx_campaign_payments_brand ON public.campaign_payments(brand_user_id);
CREATE INDEX idx_campaign_payments_influencer ON public.campaign_payments(influencer_user_id);

-- Add approved_by field to campaign_applications to track who approved
ALTER TABLE public.campaign_applications 
ADD COLUMN IF NOT EXISTS approved_by UUID,
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Function to automatically create influencer earnings after successful payment
CREATE OR REPLACE FUNCTION create_influencer_earnings_from_payment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create earnings when payment status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Insert into influencer_earnings
    INSERT INTO public.influencer_earnings (
      influencer_id,
      amount,
      net_amount,
      platform_fee,
      source,
      source_id,
      user_id
    )
    SELECT
      va.influencer_id,
      NEW.amount,
      NEW.influencer_amount,
      NEW.platform_fee,
      'brand_campaign',
      NEW.campaign_id,
      NEW.influencer_user_id
    FROM public.virtual_influencers va
    WHERE va.id = (
      SELECT ca.influencer_id 
      FROM public.campaign_applications ca 
      WHERE ca.id = NEW.application_id
    );

    -- Update influencer balance
    INSERT INTO public.influencer_balances (
      influencer_id,
      user_id,
      total_earned,
      available_balance
    )
    SELECT
      va.influencer_id,
      va.user_id,
      NEW.influencer_amount,
      NEW.influencer_amount
    FROM public.virtual_influencers va
    WHERE va.id = (
      SELECT ca.influencer_id 
      FROM public.campaign_applications ca 
      WHERE ca.id = NEW.application_id
    )
    ON CONFLICT (influencer_id) 
    DO UPDATE SET
      total_earned = influencer_balances.total_earned + NEW.influencer_amount,
      available_balance = influencer_balances.available_balance + NEW.influencer_amount,
      updated_at = now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_payment_completed
  AFTER INSERT OR UPDATE ON public.campaign_payments
  FOR EACH ROW
  EXECUTE FUNCTION create_influencer_earnings_from_payment();