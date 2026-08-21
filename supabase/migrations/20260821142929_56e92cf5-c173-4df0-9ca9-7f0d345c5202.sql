-- Public visibility of active, paid job listings
CREATE POLICY "Anyone can view active job listings"
ON public.job_listings FOR SELECT
TO anon, authenticated
USING (is_active = true AND paid_status = 'paid');

GRANT SELECT ON public.job_listings TO anon;
GRANT SELECT ON public.job_listings_public TO anon, authenticated;

-- Remove seeded demo listings that were never posted by the account owner
DELETE FROM public.job_listings
WHERE employer_id = 'a8f98c5c-3ce8-4928-bfaf-061a700411c6'
  AND created_at < '2026-06-08';