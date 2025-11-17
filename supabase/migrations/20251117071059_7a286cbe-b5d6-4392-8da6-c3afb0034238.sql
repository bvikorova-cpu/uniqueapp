-- Create reincarnation purchases/subscriptions tracking table
CREATE TABLE IF NOT EXISTS public.reincarnation_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL CHECK (service_type IN (
    'past_life_regression',
    'karmic_debt_calculator',
    'soulmate_matching',
    'reincarnation_guarantee'
  )),
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'expired')),
  purchase_type TEXT NOT NULL CHECK (purchase_type IN ('one_time', 'subscription')),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.reincarnation_purchases ENABLE ROW LEVEL SECURITY;

-- Users can view their own purchases
CREATE POLICY "Users can view own purchases"
  ON public.reincarnation_purchases
  FOR SELECT
  USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_reincarnation_purchases_user_service 
  ON public.reincarnation_purchases(user_id, service_type, status);

CREATE INDEX idx_reincarnation_purchases_session 
  ON public.reincarnation_purchases(stripe_session_id);

-- Function to check if user has access to service
CREATE OR REPLACE FUNCTION public.has_reincarnation_access(
  p_user_id UUID,
  p_service_type TEXT
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.reincarnation_purchases
    WHERE user_id = p_user_id
      AND service_type = p_service_type
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;