ALTER TABLE public.secret_santa_gifts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.secret_santa_gifts;