ALTER VIEW public.dating_profiles_browse SET (security_invoker = true);
ALTER VIEW public.public_clones SET (security_invoker = true);

GRANT SELECT ON public.dating_profiles_browse TO authenticated;
GRANT SELECT ON public.public_clones TO anon, authenticated;

DROP POLICY IF EXISTS "Anyone can view submissions" ON public.talent_submissions;
CREATE POLICY "Anyone can view active submissions"
  ON public.talent_submissions
  FOR SELECT
  USING (COALESCE(is_active, true) = true);