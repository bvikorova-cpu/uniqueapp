
-- Backfill Secret Santa challenge progress for all existing senders
DO $$
DECLARE u uuid;
BEGIN
  FOR u IN SELECT DISTINCT sender_id FROM public.secret_santa_gifts WHERE sender_id IS NOT NULL LOOP
    PERFORM public.recompute_santa_challenge_progress(u);
  END LOOP;
END $$;
