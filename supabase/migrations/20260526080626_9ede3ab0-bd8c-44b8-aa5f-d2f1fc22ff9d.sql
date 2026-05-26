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
  SELECT employer_id, title INTO v_employer_id, v_job_title
  FROM public.job_listings
  WHERE id = NEW.job_id;

  IF v_employer_id = NEW.applicant_id THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.notifications (
    user_id, actor_id, type, related_id, title, message
  ) VALUES (
    v_employer_id, NEW.applicant_id, 'job_application', NEW.job_id,
    'New application: ' || COALESCE(v_job_title, 'your job'),
    'A candidate has applied to your job posting.'
  );

  RETURN NEW;
END;
$function$;

WITH new_job AS (
  INSERT INTO public.job_listings (
    employer_id, title, company_name, location, country,
    category, job_type, description, requirements, benefits,
    contact_email, salary_min, salary_max, salary_currency,
    is_active, paid_status, duration_days, published_at, expires_at
  ) VALUES (
    'a8f98c5c-3ce8-4928-bfaf-061a700411c6',
    'Senior React Developer (E2E TEST)',
    'E2E Test Company',
    'Bratislava', 'Slovakia',
    'it_software', 'full_time',
    'We are looking for a senior React dev. E2E test listing.',
    'React, TypeScript, 5+ years',
    'Remote, flex hours',
    'hr@e2etest.example.com',
    2500, 4000, 'EUR',
    true, 'paid', 14, now(), now() + interval '14 days'
  ) RETURNING id
)
INSERT INTO public.job_applications (job_id, applicant_id, cover_letter, status)
SELECT id, '69e6cf11-bc89-4ee6-84fb-89a825cca9d2',
       'E2E test cover letter — I am very interested in this role.', 'pending'
FROM new_job;