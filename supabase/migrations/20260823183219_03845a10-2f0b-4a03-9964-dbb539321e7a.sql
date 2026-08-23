CREATE OR REPLACE FUNCTION public.backfill_card_art_tick()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  slug text;
BEGIN
  FOR slug IN
    SELECT category_slug
    FROM public.card_collectibles
    WHERE image_url IS NULL
    GROUP BY category_slug
    ORDER BY count(*) DESC
    LIMIT 3
  LOOP
    PERFORM net.http_post(
      url := 'https://jufrdzeonywluwutvyxz.supabase.co/functions/v1/hero-card-draw',
      headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1ZnJkemVvbnl3bHV3dXR2eXh6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkxMzU0MTgsImV4cCI6MjA3NDcxMTQxOH0.UOe-_WQoTeBGFmnezRHRcjFJaJd71a7rYlurDkI6h4Q"}'::jsonb,
      body := jsonb_build_object('scope','collection','action','backfill_art','category',slug,'limit',12),
      timeout_milliseconds := 120000
    );
  END LOOP;
END;
$$;

SELECT cron.schedule('backfill-card-art', '*/2 * * * *', $$SELECT public.backfill_card_art_tick();$$);