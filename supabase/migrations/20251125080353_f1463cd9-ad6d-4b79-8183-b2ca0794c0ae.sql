-- Create missing f1_subscriptions table with proper structure

CREATE TABLE IF NOT EXISTS public.f1_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  tier TEXT NOT NULL DEFAULT 'basic',
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT f1_subscriptions_tier_check CHECK (tier IN ('basic', 'pro', 'elite', 'team'))
);

-- Enable RLS
ALTER TABLE public.f1_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own subscription"
ON public.f1_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
ON public.f1_subscriptions
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions"
ON public.f1_subscriptions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Service role can manage all (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
ON public.f1_subscriptions
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Add service role policy for f1_user_credits (webhooks need to write)
CREATE POLICY "Service role can manage credits"
ON public.f1_user_credits
FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role');

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_f1_subscriptions_user_id ON public.f1_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_f1_subscriptions_stripe_customer ON public.f1_subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_f1_subscriptions_stripe_sub ON public.f1_subscriptions(stripe_subscription_id);