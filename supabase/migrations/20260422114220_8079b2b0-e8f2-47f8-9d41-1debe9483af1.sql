ALTER TABLE public.payment_records
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_amount_cents INTEGER,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT,
  ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT,
  ADD COLUMN IF NOT EXISTS refunded_by UUID;

CREATE INDEX IF NOT EXISTS idx_payment_records_refunded_at ON public.payment_records(refunded_at);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON public.payment_records(status);