-- Create function to notify employer when someone applies for their job
CREATE OR REPLACE FUNCTION public.notify_employer_new_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_employer_id UUID;
  v_job_title TEXT;
BEGIN
  -- Get employer_id and job title from job_listings
  SELECT employer_id, title INTO v_employer_id, v_job_title
  FROM public.job_listings
  WHERE id = NEW.job_id;
  
  -- Don't create notification if employer is applying to their own job (edge case)
  IF v_employer_id = NEW.applicant_id THEN
    RETURN NEW;
  END IF;
  
  -- Create notification for the employer
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    post_id
  ) VALUES (
    v_employer_id,
    NEW.applicant_id,
    'job_application',
    NEW.job_id
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger on job_applications
DROP TRIGGER IF EXISTS notify_employer_on_new_application ON public.job_applications;
CREATE TRIGGER notify_employer_on_new_application
AFTER INSERT ON public.job_applications
FOR EACH ROW
EXECUTE FUNCTION public.notify_employer_new_application();