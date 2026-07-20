
-- Auto-expire Verified/Plus/Pro when verification_expires_at has passed.

CREATE OR REPLACE FUNCTION public.expire_verifications()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  affected integer;
BEGIN
  UPDATE public.profiles
     SET verification_tier = 'none'::app_verification_tier,
         verification_expires_at = NULL
   WHERE verification_tier IS NOT NULL
     AND verification_tier <> 'none'
     AND verification_expires_at IS NOT NULL
     AND verification_expires_at <= now();
  GET DIAGNOSTICS affected = ROW_COUNT;
  RETURN affected;
END;
$$;

-- Schedule the sweep every 5 minutes (idempotent).
DO $$
BEGIN
  PERFORM cron.unschedule('expire-verifications');
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

SELECT cron.schedule(
  'expire-verifications',
  '*/5 * * * *',
  $$SELECT public.expire_verifications();$$
);

-- Helpful index for the sweep query.
CREATE INDEX IF NOT EXISTS idx_profiles_verification_expires_at
  ON public.profiles (verification_expires_at)
  WHERE verification_expires_at IS NOT NULL;
