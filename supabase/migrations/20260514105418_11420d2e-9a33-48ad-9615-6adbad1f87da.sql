
-- Phase 12: Messenger 2.0 — pinning, archiving, muting + pinned & starred messages

-- Per-participant conversation state
ALTER TABLE public.conversation_participants
  ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_archived BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS muted_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pinned_at TIMESTAMPTZ;

-- Pinned messages within a conversation (visible to all participants)
CREATE TABLE IF NOT EXISTS public.message_pins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  pinned_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(conversation_id, message_id)
);

ALTER TABLE public.message_pins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can view pinned messages"
  ON public.message_pins FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = message_pins.conversation_id
      AND cp.user_id = auth.uid()
  ));

CREATE POLICY "Participants can pin messages"
  ON public.message_pins FOR INSERT
  WITH CHECK (
    auth.uid() = pinned_by
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = message_pins.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Pinner or participant can unpin"
  ON public.message_pins FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.conversation_participants cp
    WHERE cp.conversation_id = message_pins.conversation_id
      AND cp.user_id = auth.uid()
  ));

CREATE INDEX IF NOT EXISTS idx_message_pins_conversation ON public.message_pins(conversation_id);

-- Personal starred / bookmarked messages
CREATE TABLE IF NOT EXISTS public.starred_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, message_id)
);

ALTER TABLE public.starred_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their starred messages"
  ON public.starred_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can star messages in their conversations"
  ON public.starred_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = starred_messages.conversation_id
        AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their starred messages"
  ON public.starred_messages FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can unstar their messages"
  ON public.starred_messages FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_starred_messages_user ON public.starred_messages(user_id, created_at DESC);
