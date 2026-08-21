DROP POLICY IF EXISTS "Verified employers can create job listings" ON public.job_listings;
CREATE POLICY "Users can create their own job listings"
ON public.job_listings FOR INSERT TO authenticated
WITH CHECK (auth.uid() = employer_id);

CREATE OR REPLACE FUNCTION public.expire_job_boosts()
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.job_listings
     SET is_featured = false,
         boost_tier = NULL
   WHERE is_featured = true
     AND COALESCE(boost_until, featured_until) IS NOT NULL
     AND COALESCE(boost_until, featured_until) < now();

  UPDATE public.job_boost_purchases
     SET status = 'expired'
   WHERE status = 'active'
     AND expires_at IS NOT NULL
     AND expires_at < now();
$$;

SELECT cron.schedule(
  'expire-job-boosts-hourly',
  '7 * * * *',
  $$SELECT public.expire_job_boosts();$$
);