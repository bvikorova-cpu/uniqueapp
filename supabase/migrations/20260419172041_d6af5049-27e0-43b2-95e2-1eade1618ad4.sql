-- Phase 1: Realtime features for Anonymous Date

-- 1) Reactions on messages
CREATE TABLE IF NOT EXISTS public.anonymous_dating_message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.anonymous_dating_messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

CREATE INDEX IF NOT EXISTS idx_msg_reactions_message ON public.anonymous_dating_message_reactions(message_id);

ALTER TABLE public.anonymous_dating_message_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see reactions on their match messages"
ON public.anonymous_dating_message_reactions FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.anonymous_dating_messages m
    JOIN public.anonymous_dating_matches mt ON mt.id = m.match_id
    WHERE m.id = anonymous_dating_message_reactions.message_id
      AND (mt.user1_id = auth.uid() OR mt.user2_id = auth.uid())
  )
);

CREATE POLICY "Users add own reactions on their match messages"
ON public.anonymous_dating_message_reactions FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.anonymous_dating_messages m
    JOIN public.anonymous_dating_matches mt ON mt.id = m.match_id
    WHERE m.id = anonymous_dating_message_reactions.message_id
      AND (mt.user1_id = auth.uid() OR mt.user2_id = auth.uid())
  )
);

CREATE POLICY "Users delete own reactions"
ON public.anonymous_dating_message_reactions FOR DELETE
USING (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_dating_message_reactions;
ALTER TABLE public.anonymous_dating_message_reactions REPLICA IDENTITY FULL;

-- 2) Make messages realtime-friendly
ALTER TABLE public.anonymous_dating_messages REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_dating_messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;

-- 3) Voice note storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('anonymous-date-voice', 'anonymous-date-voice', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated users can upload voice notes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'anonymous-date-voice'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Voice notes are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'anonymous-date-voice');

CREATE POLICY "Users delete own voice notes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'anonymous-date-voice'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
