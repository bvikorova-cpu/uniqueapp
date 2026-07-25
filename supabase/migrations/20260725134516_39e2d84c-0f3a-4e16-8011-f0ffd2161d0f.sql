REVOKE SELECT, INSERT, UPDATE, DELETE ON public.secret_santa_gifts FROM anon;
REVOKE EXECUTE ON FUNCTION public.send_secret_santa_gift(uuid, text, text, integer, text, boolean, text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_secret_santa_active_stories() FROM anon;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.secret_santa_gifts TO authenticated;
GRANT ALL ON public.secret_santa_gifts TO service_role;
GRANT EXECUTE ON FUNCTION public.send_secret_santa_gift(uuid, text, text, integer, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_secret_santa_active_stories() TO authenticated;