CREATE OR REPLACE FUNCTION public.notify_matching_job_preferences()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_preference RECORD;
BEGIN
  IF COALESCE(NEW.is_active, false) = true AND COALESCE(NEW.paid_status, '') = 'paid' THEN
    FOR v_preference IN
      SELECT DISTINCT user_id
      FROM public.user_job_preferences
      WHERE notify_enabled = true
        AND user_id != NEW.employer_id
        AND (categories IS NULL OR categories = '{}' OR NEW.category::text = ANY(categories))
        AND (job_types IS NULL OR job_types = '{}' OR NEW.job_type::text = ANY(job_types))
        AND (locations IS NULL OR locations = '{}' OR NEW.location = ANY(locations))
        AND (min_salary IS NULL OR NEW.salary_max >= min_salary)
        AND (max_salary IS NULL OR NEW.salary_min <= max_salary)
    LOOP
      INSERT INTO public.notifications (user_id, actor_id, type, related_id, title, message)
      VALUES (
        v_preference.user_id,
        NEW.employer_id,
        'job_match',
        NEW.id,
        'New matching job: ' || NEW.title,
        COALESCE(NEW.company_name, 'A company') || ' just posted a job that matches your preferences.'
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$function$;