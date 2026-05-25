CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.search_users(q text, lim integer DEFAULT 20)
 RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, headline text, is_verified boolean)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT id, full_name, username, avatar_url, headline, is_verified
  FROM public.profiles
  WHERE q IS NOT NULL
    AND length(trim(q)) > 0
    AND (
      unaccent(coalesce(full_name,'')) ILIKE '%' || unaccent(q) || '%'
      OR unaccent(coalesce(username,'')) ILIKE '%' || unaccent(q) || '%'
    )
  ORDER BY is_verified DESC NULLS LAST, full_name ASC
  LIMIT GREATEST(1, LEAST(coalesce(lim, 20), 50));
$function$;

CREATE OR REPLACE FUNCTION public.search_users(search_query text)
 RETURNS TABLE(id uuid, full_name text, avatar_url text, username text)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
  SELECT p.id, p.full_name, p.avatar_url, p.username
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
    AND length(trim(search_query)) >= 1
    AND (
      unaccent(coalesce(p.full_name,'')) ILIKE '%' || unaccent(search_query) || '%'
      OR unaccent(coalesce(p.username,'')) ILIKE '%' || unaccent(search_query) || '%'
    )
  ORDER BY
    CASE WHEN unaccent(coalesce(p.full_name,'')) ILIKE unaccent(search_query) || '%' THEN 0
         WHEN unaccent(coalesce(p.username,'')) ILIKE unaccent(search_query) || '%' THEN 1
         ELSE 2 END,
    p.full_name NULLS LAST
  LIMIT 20;
$function$;