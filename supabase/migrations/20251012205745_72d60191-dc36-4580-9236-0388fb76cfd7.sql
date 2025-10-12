-- Add referral system to megatalent_subscriptions
ALTER TABLE public.megatalent_subscriptions
ADD COLUMN referred_by uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create megatalent_referral_earnings table to track monthly earnings
CREATE TABLE public.megatalent_referral_earnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id uuid NOT NULL REFERENCES public.megatalent_subscriptions(id) ON DELETE CASCADE,
  amount numeric NOT NULL DEFAULT 5.00,
  period_start timestamp with time zone NOT NULL,
  period_end timestamp with time zone NOT NULL,
  paid boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.megatalent_referral_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for megatalent_referral_earnings
CREATE POLICY "Users can view their own referral earnings"
  ON public.megatalent_referral_earnings
  FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can create referral earnings"
  ON public.megatalent_referral_earnings
  FOR INSERT
  WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_megatalent_referral_earnings_referrer 
  ON public.megatalent_referral_earnings(referrer_id);

CREATE INDEX idx_megatalent_referral_earnings_period 
  ON public.megatalent_referral_earnings(period_start, period_end);

-- Add index on referred_by column
CREATE INDEX idx_megatalent_subscriptions_referred_by 
  ON public.megatalent_subscriptions(referred_by);