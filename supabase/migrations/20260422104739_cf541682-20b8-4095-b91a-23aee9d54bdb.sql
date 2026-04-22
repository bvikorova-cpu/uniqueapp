
ALTER TABLE public.job_listings
  ADD COLUMN IF NOT EXISTS duration_days integer NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS paid_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS expires_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_job_listings_paid_status ON public.job_listings(paid_status, expires_at);
CREATE INDEX IF NOT EXISTS idx_job_listings_featured ON public.job_listings(is_featured, published_at DESC);

CREATE TABLE IF NOT EXISTS public.job_listing_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  job_listing_id uuid REFERENCES public.job_listings(id) ON DELETE CASCADE,
  stripe_session_id text UNIQUE,
  amount integer NOT NULL,
  currency text NOT NULL DEFAULT 'EUR',
  product_kind text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_jlp_user ON public.job_listing_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_jlp_session ON public.job_listing_payments(stripe_session_id);

ALTER TABLE public.job_listing_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Owner can view own job listing payments" ON public.job_listing_payments;
CREATE POLICY "Owner can view own job listing payments"
  ON public.job_listing_payments FOR SELECT
  USING (auth.uid() = user_id);
