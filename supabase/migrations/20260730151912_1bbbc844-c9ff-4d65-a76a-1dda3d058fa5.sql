ALTER TABLE public.pet_trades REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pet_trades;