-- Add stripe_payment_intent_id to job_listing_payments so refunds/disputes
-- (which arrive by PI) can locate the job and update paid_status.
ALTER TABLE public.job_listing_payments
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS refunded_at timestamptz,
  ADD COLUMN IF NOT EXISTS refund_amount integer;

CREATE INDEX IF NOT EXISTS idx_job_listing_payments_pi
  ON public.job_listing_payments (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;

-- Allow product_type='job_listing_*' refund handler to find by PI quickly.
CREATE INDEX IF NOT EXISTS idx_payment_records_pi
  ON public.payment_records (stripe_payment_intent_id)
  WHERE stripe_payment_intent_id IS NOT NULL;