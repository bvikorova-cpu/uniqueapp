ALTER TABLE public.coffee_match_messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.coffee_match_messages;