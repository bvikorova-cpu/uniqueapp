
-- 1. JOB EXPIRY AUTOMATION
CREATE OR REPLACE FUNCTION public.expire_old_job_listings()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  expired_row RECORD;
  cnt integer := 0;
BEGIN
  FOR expired_row IN
    SELECT id, employer_id, title
    FROM public.job_listings
    WHERE paid_status = 'active'
      AND expires_at IS NOT NULL
      AND expires_at < now()
  LOOP
    UPDATE public.job_listings
    SET paid_status = 'expired', is_active = false, updated_at = now()
    WHERE id = expired_row.id;

    INSERT INTO public.notifications (user_id, type, title, message, related_id, action_url)
    VALUES (
      expired_row.employer_id,
      'job_listing_expired',
      'Your job listing expired',
      'Listing "' || expired_row.title || '" is no longer visible. Renew it to keep receiving applications.',
      expired_row.id,
      '/employer/dashboard'
    );
    cnt := cnt + 1;
  END LOOP;
  RETURN cnt;
END;
$$;

REVOKE ALL ON FUNCTION public.expire_old_job_listings() FROM public, anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname='pg_cron') THEN
    PERFORM cron.unschedule(jobid) FROM cron.job WHERE jobname='expire-job-listings-daily';
    PERFORM cron.schedule(
      'expire-job-listings-daily',
      '0 3 * * *',
      $cron$ SELECT public.expire_old_job_listings(); $cron$
    );
  END IF;
END $$;

-- 2. ANALYTICS ANTI-ABUSE (trigger-based dedup)
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.job_analytics_events;

CREATE POLICY "Auth users insert analytics"
ON public.job_analytics_events
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND event_type IN ('view','impression','apply_start','apply_complete','save','share')
);

CREATE OR REPLACE FUNCTION public.dedupe_job_analytics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;
  IF EXISTS (
    SELECT 1 FROM public.job_analytics_events
    WHERE job_id = NEW.job_id
      AND user_id = NEW.user_id
      AND event_type = NEW.event_type
      AND created_at > now() - interval '1 hour'
  ) THEN
    RETURN NULL; -- silently drop dup
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_dedupe_job_analytics ON public.job_analytics_events;
CREATE TRIGGER trg_dedupe_job_analytics
BEFORE INSERT ON public.job_analytics_events
FOR EACH ROW EXECUTE FUNCTION public.dedupe_job_analytics();

CREATE INDEX IF NOT EXISTS job_analytics_dedup_lookup_idx
ON public.job_analytics_events (job_id, user_id, event_type, created_at DESC)
WHERE user_id IS NOT NULL;

-- 3. APPLICATION STATUS NOTIFICATIONS
CREATE OR REPLACE FUNCTION public.notify_application_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  job_title text;
  msg text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT title INTO job_title FROM public.job_listings WHERE id = NEW.job_id;
    msg := CASE NEW.status
      WHEN 'viewed' THEN 'The employer reviewed your application for "' || COALESCE(job_title,'a job') || '".'
      WHEN 'interview' THEN 'You have been invited to an interview for "' || COALESCE(job_title,'a job') || '".'
      WHEN 'offer' THEN 'You received an offer for "' || COALESCE(job_title,'a job') || '". Check your inbox.'
      WHEN 'rejected' THEN 'Your application for "' || COALESCE(job_title,'a job') || '" was not selected this time.'
      ELSE 'Your application status changed to ' || NEW.status || '.'
    END;
    INSERT INTO public.notifications (user_id, type, title, message, related_id, action_url)
    VALUES (
      NEW.applicant_id,
      'application_status_' || NEW.status,
      'Application update',
      msg,
      NEW.job_id,
      '/jobs/application-tracker'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_application_status ON public.job_applications;
CREATE TRIGGER trg_notify_application_status
AFTER UPDATE OF status ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_application_status_change();

-- 4. APPLICATION RATE-LIMIT + RESUME URL VALIDATION
CREATE OR REPLACE FUNCTION public.enforce_application_limits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  IF NEW.resume_url IS NOT NULL AND length(NEW.resume_url) > 0 THEN
    IF NEW.resume_url !~* '^https://' THEN
      RAISE EXCEPTION 'Resume URL must start with https://' USING ERRCODE = '22023';
    END IF;
    IF NEW.resume_url ~* '^(javascript|data|file|vbscript|about):' THEN
      RAISE EXCEPTION 'Unsafe resume URL scheme' USING ERRCODE = '22023';
    END IF;
    IF length(NEW.resume_url) > 500 THEN
      RAISE EXCEPTION 'Resume URL too long' USING ERRCODE = '22023';
    END IF;
  END IF;

  SELECT count(*) INTO recent_count
  FROM public.job_applications
  WHERE applicant_id = NEW.applicant_id
    AND created_at > now() - interval '24 hours';
  IF recent_count >= 20 THEN
    RAISE EXCEPTION 'Daily application limit reached (20/24h). Try again later.' USING ERRCODE = 'P0001';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_enforce_application_limits ON public.job_applications;
CREATE TRIGGER trg_enforce_application_limits
BEFORE INSERT ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.enforce_application_limits();

-- 5. JOB ABUSE REPORTS
CREATE TABLE IF NOT EXISTS public.job_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id uuid NOT NULL REFERENCES public.job_listings(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('scam','spam','offensive','duplicate','illegal','other')),
  details text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','reviewing','resolved','dismissed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz,
  UNIQUE (job_id, reporter_id)
);

GRANT SELECT, INSERT ON public.job_reports TO authenticated;
GRANT ALL ON public.job_reports TO service_role;

ALTER TABLE public.job_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users insert their own reports"
ON public.job_reports
FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "Users view their own reports"
ON public.job_reports
FOR SELECT TO authenticated
USING (reporter_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins manage reports"
ON public.job_reports
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS job_reports_job_idx ON public.job_reports(job_id);
CREATE INDEX IF NOT EXISTS job_reports_status_pending_idx ON public.job_reports(status) WHERE status = 'pending';
