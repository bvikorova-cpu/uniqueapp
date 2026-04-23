
-- Recreate the view WITHOUT security definer property; the underlying
-- function is already SECURITY DEFINER which is what enforces access.
DROP VIEW IF EXISTS public.public_instructor_profiles;

CREATE VIEW public.public_instructor_profiles
WITH (security_invoker = true) AS
SELECT * FROM public.get_public_instructor_profiles();

GRANT SELECT ON public.public_instructor_profiles TO anon, authenticated;
