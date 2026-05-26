CREATE OR REPLACE FUNCTION public.has_applied_to_job(_user_id uuid, _job_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.job_applications WHERE applicant_id = _user_id AND job_id = _job_id);
$$;

CREATE OR REPLACE FUNCTION public.is_job_employer(_user_id uuid, _job_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.job_listings WHERE id = _job_id AND employer_id = _user_id);
$$;

DROP POLICY IF EXISTS "Applicants view jobs they applied to" ON public.job_listings;
DROP POLICY IF EXISTS "Employers can view applications for their jobs" ON public.job_applications;
DROP POLICY IF EXISTS "Employers can update application status" ON public.job_applications;

CREATE POLICY "Applicants view jobs they applied to"
ON public.job_listings FOR SELECT TO authenticated
USING (public.has_applied_to_job(auth.uid(), id));

CREATE POLICY "Employers can view applications for their jobs"
ON public.job_applications FOR SELECT TO authenticated
USING (public.is_job_employer(auth.uid(), job_id));

CREATE POLICY "Employers can update application status"
ON public.job_applications FOR UPDATE TO authenticated
USING (public.is_job_employer(auth.uid(), job_id));

CREATE POLICY "Anyone can view active job listings"
ON public.job_listings FOR SELECT
USING (is_active = true);