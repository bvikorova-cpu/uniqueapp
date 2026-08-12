ALTER TABLE public.concert_gifts REPLICA IDENTITY FULL;
ALTER TABLE public.live_concert_streams REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'concert_gifts'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.concert_gifts;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'live_concert_streams'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.live_concert_streams;
  END IF;
END $$;