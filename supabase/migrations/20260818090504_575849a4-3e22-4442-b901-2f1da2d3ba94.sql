ALTER TABLE public.marketplace_responses REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.marketplace_responses;