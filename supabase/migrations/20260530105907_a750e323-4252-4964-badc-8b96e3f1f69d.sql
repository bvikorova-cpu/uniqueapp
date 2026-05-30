
-- =========================================================================
-- QA FIX: Work (Jobs) section
-- S1: PII leak — anon could read raw job_listings (incl. contact_email)
-- S2: Self-promote employer w/o verification could post jobs
-- View: also filter by paid_status & expiry so anon never sees draft/expired
-- =========================================================================

-- ---- S1 ---------------------------------------------------------------
-- Drop broad anon policy on raw table
DROP POLICY IF EXISTS "Anyone can view active job listings" ON public.job_listings;

-- Lock down raw table grants. Authenticated still needs full CRUD subject to
-- per-row RLS (employers manage own rows, applicants read jobs they applied to).
REVOKE ALL ON public.job_listings FROM anon;
REVOKE ALL ON public.job_listings FROM PUBLIC;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_listings TO authenticated;
GRANT ALL ON public.job_listings TO service_role;

-- Recreate sanitized view (no contact_email) with stricter visibility rules
DROP VIEW IF EXISTS public.job_listings_public;
CREATE VIEW public.job_listings_public
WITH (security_invoker = false) AS
SELECT
  id, employer_id, title, description, company_name, location, country,
  category, job_type, salary_min, salary_max, salary_currency,
  requirements, benefits, is_active, views_count, applications_count,
  created_at, updated_at, duration_days, is_featured, paid_status,
  published_at, expires_at
FROM public.job_listings
WHERE is_active = true
  AND COALESCE(paid_status, 'active') = 'active'
  AND (expires_at IS NULL OR expires_at > now());

REVOKE ALL ON public.job_listings_public FROM PUBLIC;
GRANT SELECT ON public.job_listings_public TO anon, authenticated;
GRANT ALL  ON public.job_listings_public TO service_role;

-- ---- S2 ---------------------------------------------------------------
-- Verified-employer helper (security definer to bypass RLS recursion)
CREATE OR REPLACE FUNCTION public.is_verified_employer(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.employer_verifications
    WHERE employer_id = _user_id
      AND verification_status = 'approved'
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_verified_employer(uuid) TO authenticated, service_role;

-- Replace insert policy on job_listings to require approved verification
DROP POLICY IF EXISTS "Employers can create job listings" ON public.job_listings;
CREATE POLICY "Verified employers can create job listings"
ON public.job_listings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = employer_id
  AND public.has_role(auth.uid(), 'employer'::app_role)
  AND public.is_verified_employer(auth.uid())
);

-- ---- user_roles hardening ---------------------------------------------
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.user_roles FROM PUBLIC;
GRANT SELECT, INSERT, DELETE ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
