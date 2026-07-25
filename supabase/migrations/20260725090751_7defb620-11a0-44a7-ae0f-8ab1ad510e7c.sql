
CREATE OR REPLACE FUNCTION public.search_public_profiles(_query TEXT)
RETURNS TABLE (id UUID, username TEXT, avatar_url TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;
  IF _query IS NULL OR length(btrim(_query)) < 2 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT p.id,
         COALESCE(NULLIF(btrim(p.full_name), ''), NULLIF(btrim(p.username), ''), 'User') AS username,
         p.avatar_url
  FROM public.profiles p
  WHERE p.id <> auth.uid()
    AND (
      p.full_name ILIKE '%' || _query || '%'
      OR p.username ILIKE '%' || _query || '%'
    )
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users b
      WHERE (b.blocker_id = auth.uid() AND b.blocked_id = p.id)
         OR (b.blocker_id = p.id AND b.blocked_id = auth.uid())
    )
  ORDER BY
    CASE
      WHEN p.full_name ILIKE _query || '%' THEN 0
      WHEN p.username ILIKE _query || '%' THEN 1
      ELSE 2
    END,
    p.full_name NULLS LAST
  LIMIT 10;
END;
$$;

REVOKE ALL ON FUNCTION public.search_public_profiles(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_public_profiles(TEXT) TO authenticated;
