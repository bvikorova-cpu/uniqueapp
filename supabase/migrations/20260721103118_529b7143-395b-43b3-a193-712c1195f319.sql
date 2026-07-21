-- Ensure GRANTs for existing paid-message tables (older migration lacked them)
GRANT SELECT, INSERT, UPDATE ON public.creator_paid_messages TO authenticated;
GRANT ALL ON public.creator_paid_messages TO service_role;
GRANT SELECT ON public.creator_message_settings TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.creator_message_settings TO authenticated;
GRANT ALL ON public.creator_message_settings TO service_role;

-- Add shoutout support to paid messages
ALTER TABLE public.creator_paid_messages
  ADD COLUMN IF NOT EXISTS request_type TEXT NOT NULL DEFAULT 'message',
  ADD COLUMN IF NOT EXISTS reply_video_url TEXT;

ALTER TABLE public.creator_message_settings
  ADD COLUMN IF NOT EXISTS shoutout_price NUMERIC DEFAULT 20,
  ADD COLUMN IF NOT EXISTS shoutout_enabled BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_cpm_creator_status ON public.creator_paid_messages(creator_id, status);
CREATE INDEX IF NOT EXISTS idx_cpm_sender ON public.creator_paid_messages(sender_id, created_at DESC);