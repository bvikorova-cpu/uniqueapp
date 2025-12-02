-- Create table for tracking anonymous date access payments
CREATE TABLE IF NOT EXISTS public.anonymous_dating_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  paid_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  amount DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.anonymous_dating_access ENABLE ROW LEVEL SECURITY;

-- Users can view their own access records
CREATE POLICY "Users can view their own access records"
ON public.anonymous_dating_access
FOR SELECT
USING (auth.uid() = user_id);

-- Only authenticated users can check access (no insert policy - handled by edge function)
CREATE INDEX idx_anonymous_dating_access_user_id ON public.anonymous_dating_access(user_id);
CREATE INDEX idx_anonymous_dating_access_paid_at ON public.anonymous_dating_access(paid_at DESC);