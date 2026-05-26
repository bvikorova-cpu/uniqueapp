
-- 1. Function: hide expired job listings
CREATE OR REPLACE FUNCTION public.deactivate_expired_job_listings()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.job_listings
  SET is_active = false
  WHERE is_active = true
    AND expires_at IS NOT NULL
    AND expires_at < NOW();
END;
$$;

-- 2. Schedule it hourly (replace if already exists)
DO $$
BEGIN
  PERFORM cron.unschedule('deactivate-expired-job-listings');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

SELECT cron.schedule(
  'deactivate-expired-job-listings',
  '0 * * * *',
  $$SELECT public.deactivate_expired_job_listings();$$
);

-- 3. Trigger: notify employer on renewal (when expires_at is extended further into the future)
CREATE OR REPLACE FUNCTION public.notify_employer_listing_renewed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW.expires_at IS NOT NULL
     AND OLD.expires_at IS NOT NULL
     AND NEW.expires_at > OLD.expires_at
     AND NEW.is_active = true THEN
    INSERT INTO public.notifications (user_id, type, title, message, related_id)
    VALUES (
      NEW.employer_id,
      'job_listing_renewed',
      'Job listing renewed: ' || COALESCE(NEW.title, 'Untitled'),
      'Your job posting is live again until ' || to_char(NEW.expires_at, 'Mon DD, YYYY') || '.',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_employer_listing_renewed ON public.job_listings;
CREATE TRIGGER trg_notify_employer_listing_renewed
AFTER UPDATE OF expires_at ON public.job_listings
FOR EACH ROW EXECUTE FUNCTION public.notify_employer_listing_renewed();
