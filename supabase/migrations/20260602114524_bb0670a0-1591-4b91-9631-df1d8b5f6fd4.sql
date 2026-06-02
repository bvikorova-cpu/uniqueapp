
-- Enable trigram extension for fast ILIKE '%q%' searches
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Immutable wrapper around unaccent so it can be used in expression indexes
CREATE OR REPLACE FUNCTION public.f_unaccent(text)
RETURNS text
LANGUAGE sql
IMMUTABLE PARALLEL SAFE STRICT
SET search_path = public, extensions
AS $$ SELECT public.unaccent('public.unaccent', $1) $$;

-- Trigram GIN indexes on unaccented lower(full_name) and lower(username)
CREATE INDEX IF NOT EXISTS idx_profiles_full_name_trgm
  ON public.profiles
  USING gin (public.f_unaccent(lower(coalesce(full_name,''))) extensions.gin_trgm_ops);

CREATE INDEX IF NOT EXISTS idx_profiles_username_trgm
  ON public.profiles
  USING gin (public.f_unaccent(lower(coalesce(username,''))) extensions.gin_trgm_ops);

-- Drop both legacy overloads then recreate the canonical (q, lim) version
DROP FUNCTION IF EXISTS public.search_users(text);
DROP FUNCTION IF EXISTS public.search_users(text, integer);

CREATE OR REPLACE FUNCTION public.search_users(q text, lim integer DEFAULT 20)
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, headline text, is_verified boolean)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public, extensions
AS $$
  WITH params AS (
    SELECT public.f_unaccent(lower(trim(q))) AS qn
  )
  SELECT p.id, p.full_name, p.username, p.avatar_url, p.headline, p.is_verified
  FROM public.profiles p, params
  WHERE auth.uid() IS NOT NULL
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

GRANT EXECUTE ON FUNCTION public.search_users(text, integer) TO authenticated, anon;
