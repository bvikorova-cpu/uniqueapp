CREATE OR REPLACE FUNCTION public.search_users(q text, lim integer DEFAULT 20)
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, headline text, is_verified boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH params AS (
    SELECT public.f_unaccent(lower(trim(q))) AS qn
  )
  SELECT p.id, p.full_name, p.username, p.avatar_url, p.headline, p.is_verified
  FROM public.profiles p, params
  WHERE auth.uid() IS NOT NULL
    AND p.id <> auth.uid()
    AND length(params.qn) >= 1
    AND (
      public.f_unaccent(lower(coalesce(p.full_name,''))) ILIKE '%' || params.qn || '%'
      OR public.f_unaccent(lower(coalesce(p.username,''))) ILIKE '%' || params.qn || '%'
    )
  ORDER BY
    CASE
      WHEN public.f_unaccent(lower(coalesce(p.full_name,''))) ILIKE params.qn || '%' THEN 0
      WHEN public.f_unaccent(lower(coalesce(p.username,''))) ILIKE params.qn || '%' THEN 1
      ELSE 2
    END,
    p.is_verified DESC NULLS LAST,
    p.full_name ASC NULLS LAST
  LIMIT GREATEST(1, LEAST(coalesce(lim, 20), 50));
$$;