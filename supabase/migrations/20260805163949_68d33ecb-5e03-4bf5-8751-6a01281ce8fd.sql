ALTER TABLE public.dating_swipes REPLICA IDENTITY FULL;
ALTER TABLE public.dating_messages REPLICA IDENTITY FULL;
ALTER TABLE public.dating_matches REPLICA IDENTITY FULL;
DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dating_swipes;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dating_messages;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;