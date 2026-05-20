CREATE TABLE IF NOT EXISTS public.call_signals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event text NOT NULL CHECK (event IN ('offer', 'answer', 'ice-candidate', 'end-call', 'cancel-call', 'decline-call')),
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.call_signals REPLICA IDENTITY FULL;

CREATE INDEX IF NOT EXISTS idx_call_signals_receiver_created
  ON public.call_signals(receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_call_signals_sender_created
  ON public.call_signals(sender_id, created_at DESC);

DROP POLICY IF EXISTS "Call participants can view their signals" ON public.call_signals;
CREATE POLICY "Call participants can view their signals"
  ON public.call_signals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Conversation participants can send call signals" ON public.call_signals;
CREATE POLICY "Conversation participants can send call signals"
  ON public.call_signals
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND sender_id <> receiver_id
    AND (
      conversation_id IS NULL
      OR (
        EXISTS (
          SELECT 1
          FROM public.conversation_participants cp
          WHERE cp.conversation_id = call_signals.conversation_id
            AND cp.user_id = auth.uid()
        )
        AND EXISTS (
          SELECT 1
          FROM public.conversation_participants cp
          WHERE cp.conversation_id = call_signals.conversation_id
            AND cp.user_id = call_signals.receiver_id
        )
      )
    )
  );

DROP POLICY IF EXISTS "Call participants can delete their signals" ON public.call_signals;
CREATE POLICY "Call participants can delete their signals"
  ON public.call_signals
  FOR DELETE
  TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_publication
    WHERE pubname = 'supabase_realtime'
  ) THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = 'call_signals'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals;
    END IF;
  END IF;
END $$;