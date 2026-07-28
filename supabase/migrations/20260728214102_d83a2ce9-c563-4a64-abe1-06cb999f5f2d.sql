GRANT SELECT ON public.brain_duel_records TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.brain_duel_records TO authenticated;
GRANT ALL ON public.brain_duel_records TO service_role;