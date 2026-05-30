
-- Notify employer on new application
CREATE OR REPLACE FUNCTION public.notify_employer_on_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_employer_id uuid;
  v_job_title text;
BEGIN
  SELECT employer_id, title INTO v_employer_id, v_job_title
  FROM public.job_listings WHERE id = NEW.job_id;

  IF v_employer_id IS NOT NULL AND v_employer_id <> NEW.applicant_id THEN
    INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
    VALUES (
      v_employer_id,
      NEW.applicant_id,
      'New job application',
      'You received a new application for "' || COALESCE(v_job_title, 'your listing') || '".',
      'job_application',
      NEW.id,
      '/jobs/applications'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_employer_on_application ON public.job_applications;
CREATE TRIGGER trg_notify_employer_on_application
AFTER INSERT ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_employer_on_application();

-- Notify applicant on status change
CREATE OR REPLACE FUNCTION public.notify_applicant_on_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_job_title text;
BEGIN
  IF NEW.status IS DISTINCT FROM OLD.status THEN
    SELECT title INTO v_job_title FROM public.job_listings WHERE id = NEW.job_id;
    INSERT INTO public.notifications (user_id, title, message, type, related_id, action_url)
    VALUES (
      NEW.applicant_id,
      'Application status updated',
      'Your application for "' || COALESCE(v_job_title, 'a job') || '" is now: ' || NEW.status,
      'job_application_status',
      NEW.id,
      '/jobs/applications'
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_applicant_on_status_change ON public.job_applications;
CREATE TRIGGER trg_notify_applicant_on_status_change
AFTER UPDATE OF status ON public.job_applications
FOR EACH ROW EXECUTE FUNCTION public.notify_applicant_on_status_change();
