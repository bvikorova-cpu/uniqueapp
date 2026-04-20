-- Univerzálna tabuľka pre tracking všetkých platieb
CREATE TABLE IF NOT EXISTS public.payment_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  product_type TEXT NOT NULL,
  product_id TEXT,
  amount_cents INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'pending',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  stripe_customer_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payment_records_session ON public.payment_records(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_user_status ON public.payment_records(user_id, status);
CREATE INDEX IF NOT EXISTS idx_payment_records_product ON public.payment_records(product_type, status);

-- Enable RLS
ALTER TABLE public.payment_records ENABLE ROW LEVEL SECURITY;

-- Users can view their own payments
CREATE POLICY "Users view own payments"
ON public.payment_records FOR SELECT
USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins view all payments"
ON public.payment_records FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Only service role can insert/update (via edge functions)
CREATE POLICY "Service role manages payments"
ON public.payment_records FOR ALL
USING (auth.jwt() ->> 'role' = 'service_role')
WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Trigger for updated_at
CREATE TRIGGER update_payment_records_updated_at
BEFORE UPDATE ON public.payment_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();