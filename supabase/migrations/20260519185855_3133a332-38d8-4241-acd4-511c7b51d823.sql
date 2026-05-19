CREATE OR REPLACE FUNCTION public.get_profiles_basic(_ids uuid[])
RETURNS TABLE(id uuid, full_name text, avatar_url text, username text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT id, full_name, avatar_url, username FROM public.profiles WHERE id = ANY(_ids);
$$;
GRANT EXECUTE ON FUNCTION public.get_profiles_basic(uuid[]) TO authenticated, anon;