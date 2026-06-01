
CREATE OR REPLACE FUNCTION public.get_public_profiles(ids uuid[])
RETURNS TABLE (id uuid, full_name text, username text, avatar_url text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.username, p.avatar_url
  FROM public.profiles p
  WHERE p.id = ANY(ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated, anon;
