-- Create payment_verifications table for idempotency and audit trail
CREATE TABLE IF NOT EXISTS public.payment_verifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    stripe_session_id TEXT NOT NULL UNIQUE,
    user_id UUID NOT NULL,
    credit_type TEXT NOT NULL,
    credits_amount INTEGER NOT NULL,
    amount_paid NUMERIC(10,2),
    currency TEXT DEFAULT 'eur',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    metadata JSONB
);

-- Create index for fast lookups
CREATE INDEX idx_payment_verifications_session ON public.payment_verifications(stripe_session_id);
CREATE INDEX idx_payment_verifications_user ON public.payment_verifications(user_id);

-- Enable RLS
ALTER TABLE public.payment_verifications ENABLE ROW LEVEL SECURITY;

-- Only service role can manage this table
CREATE POLICY "Service role only" ON public.payment_verifications
    FOR ALL USING (false);

-- Add stripe_session_id column to transactions for audit trail if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'stripe_session_id'
    ) THEN
        ALTER TABLE public.transactions ADD COLUMN stripe_session_id TEXT;
    END IF;
END $$;

-- Create index for stripe_session_id on transactions
CREATE INDEX IF NOT EXISTS idx_transactions_stripe_session ON public.transactions(stripe_session_id);