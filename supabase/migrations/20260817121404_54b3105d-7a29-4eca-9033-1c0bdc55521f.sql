-- Ensure every listing has a 60-day expiry window
ALTER TABLE public.properties
  ALTER COLUMN listing_expires_at SET DEFAULT (now() + interval '60 days');

UPDATE public.properties
SET listing_expires_at = created_at + interval '60 days'
WHERE listing_expires_at IS NULL;

-- Expire listings whose 60-day window has passed
CREATE OR REPLACE FUNCTION public.expire_old_property_listings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _count integer;
BEGIN
  UPDATE public.properties
  SET status = 'expired'
  WHERE listing_expires_at IS NOT NULL
    AND listing_expires_at < now()
    AND status <> 'expired';
  GET DIAGNOSTICS _count = ROW_COUNT;
  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_old_property_listings() FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_old_property_listings() TO service_role;

SELECT public.expire_old_property_listings();

CREATE EXTENSION IF NOT EXISTS pg_cron;

DO $$
BEGIN
  PERFORM cron.unschedule('expire-property-listings');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'expire-property-listings',
  '0 * * * *',
  $$SELECT public.expire_old_property_listings();$$
);