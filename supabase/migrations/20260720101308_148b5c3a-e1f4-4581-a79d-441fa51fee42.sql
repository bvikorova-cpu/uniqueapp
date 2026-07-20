REVOKE ALL ON FUNCTION public.expire_verifications() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.expire_verifications() TO service_role;