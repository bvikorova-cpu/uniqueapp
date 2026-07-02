ALTER VIEW public.profiles_public SET (security_invoker = false);
ALTER VIEW public.public_profiles SET (security_invoker = false);
GRANT SELECT ON public.profiles_public TO anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;