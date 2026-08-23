REVOKE EXECUTE ON FUNCTION public.backfill_card_art_tick() FROM anon, authenticated, PUBLIC;
GRANT EXECUTE ON FUNCTION public.backfill_card_art_tick() TO service_role;