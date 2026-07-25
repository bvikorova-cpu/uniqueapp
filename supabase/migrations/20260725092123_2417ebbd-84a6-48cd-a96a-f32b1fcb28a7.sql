REVOKE EXECUTE ON FUNCTION public.search_public_profiles(text) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.search_public_profiles(text) FROM anon;
GRANT EXECUTE ON FUNCTION public.search_public_profiles(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_public_profiles(text) TO service_role;