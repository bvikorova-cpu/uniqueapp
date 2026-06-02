GRANT SELECT ON public.profiles_public TO anon, authenticated;
GRANT SELECT ON public.public_profiles TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_wall_feed(timestamptz, integer) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_profiles_basic(uuid[]) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.search_users(text, integer) TO anon, authenticated;