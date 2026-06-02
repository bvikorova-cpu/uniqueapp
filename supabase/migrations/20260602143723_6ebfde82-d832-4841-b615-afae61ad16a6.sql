ALTER TABLE public.profile_tips
  ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS refund_reason TEXT,
  ADD COLUMN IF NOT EXISTS stripe_refund_id TEXT,
  ADD COLUMN IF NOT EXISTS refunded_by UUID;

CREATE INDEX IF NOT EXISTS idx_profile_tips_status ON public.profile_tips(status);
CREATE INDEX IF NOT EXISTS idx_profile_tips_refunded_at ON public.profile_tips(refunded_at);