ALTER TABLE public.bug_reports
  ADD COLUMN IF NOT EXISTS response_message TEXT,
  ADD COLUMN IF NOT EXISTS response_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.notify_bug_report_response()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.response_message IS DISTINCT FROM OLD.response_message
     AND NEW.response_message IS NOT NULL
     AND NEW.user_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, message, action_url, is_read, created_at)
    VALUES (
      NEW.user_id,
      'bug_report_response',
      'Reply to your bug report',
      NEW.response_message,
      '/my-bug-reports',
      false,
      now()
    );
  END IF;

  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.notify_bug_report_response() TO authenticated, service_role;

DROP TRIGGER IF EXISTS trg_notify_bug_report_response ON public.bug_reports;
CREATE TRIGGER trg_notify_bug_report_response
AFTER UPDATE ON public.bug_reports
FOR EACH ROW
EXECUTE FUNCTION public.notify_bug_report_response();
