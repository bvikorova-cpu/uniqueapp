-- Drop the old one-time payment table
DROP TABLE IF EXISTS public.anonymous_dating_access CASCADE;

-- Create new subscription tracking table
CREATE TABLE IF NOT EXISTS public.anonymous_dating_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anonymous_dating_subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view their own subscription"
ON public.anonymous_dating_subscriptions
FOR SELECT
USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_anonymous_dating_subscriptions_user_id ON public.anonymous_dating_subscriptions(user_id);
CREATE INDEX idx_anonymous_dating_subscriptions_stripe_customer ON public.anonymous_dating_subscriptions(stripe_customer_id);
CREATE INDEX idx_anonymous_dating_subscriptions_status ON public.anonymous_dating_subscriptions(subscription_status);