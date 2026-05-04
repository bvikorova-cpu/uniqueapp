ALTER TABLE public.horse_currency_purchases REPLICA IDENTITY FULL;
ALTER TABLE public.horse_currency REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.horse_currency_purchases;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.horse_currency;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;