ALTER TABLE public.gift_chat_messages REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'gift_chat_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.gift_chat_messages;
  END IF;
END $$;