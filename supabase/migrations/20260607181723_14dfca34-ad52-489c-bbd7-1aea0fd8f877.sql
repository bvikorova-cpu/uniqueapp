
ALTER TABLE public.stripe_webhook_events
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'processing',
  ADD COLUMN IF NOT EXISTS error text;
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_status_time
  ON public.stripe_webhook_events(status, processed_at DESC);
