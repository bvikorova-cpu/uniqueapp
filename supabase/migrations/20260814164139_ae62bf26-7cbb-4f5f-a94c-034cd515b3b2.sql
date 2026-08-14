ALTER TABLE public.live_super_chats
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'paid',
  ADD COLUMN IF NOT EXISTS stripe_session_id text,
  ADD COLUMN IF NOT EXISTS stripe_payment_intent_id text,
  ADD COLUMN IF NOT EXISTS creator_id uuid,
  ADD COLUMN IF NOT EXISTS platform_fee_cents integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS creator_amount_cents integer NOT NULL DEFAULT 0;

ALTER TABLE public.live_super_chats ALTER COLUMN status SET DEFAULT 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS live_super_chats_session_idx ON public.live_super_chats (stripe_session_id) WHERE stripe_session_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS live_super_chats_stream_status_idx ON public.live_super_chats (stream_id, status);

GRANT SELECT ON public.live_super_chats TO anon;
GRANT SELECT, INSERT ON public.live_super_chats TO authenticated;
GRANT ALL ON public.live_super_chats TO service_role;