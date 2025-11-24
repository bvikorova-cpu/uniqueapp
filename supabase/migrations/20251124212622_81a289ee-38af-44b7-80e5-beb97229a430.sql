-- Create credit_payments table for tracking Stripe payments
CREATE TABLE IF NOT EXISTS public.credit_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  credits INTEGER NOT NULL,
  credit_type TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_credit_payments_user_id ON public.credit_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_session_id ON public.credit_payments(session_id);

-- Enable RLS
ALTER TABLE public.credit_payments ENABLE ROW LEVEL SECURITY;

-- Users can only view their own payment records
CREATE POLICY "Users can view own payment records"
  ON public.credit_payments
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert payment records (edge functions)
CREATE POLICY "Service role can insert payment records"
  ON public.credit_payments
  FOR INSERT
  WITH CHECK (true);