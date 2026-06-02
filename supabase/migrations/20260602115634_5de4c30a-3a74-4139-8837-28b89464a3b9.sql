ALTER VIEW public.public_profiles SET (security_invoker = off);
NOTIFY pgrst, 'reload schema';