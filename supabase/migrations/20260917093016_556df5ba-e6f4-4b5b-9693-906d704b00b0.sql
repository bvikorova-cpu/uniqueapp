DROP FUNCTION IF EXISTS public.get_profiles_basic(uuid[]);
CREATE FUNCTION public.get_profiles_basic(_ids uuid[])
RETURNS TABLE(id uuid, full_name text, avatar_url text, username text, verification_tier text, cover_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.avatar_url, p.username, p.verification_tier, p.cover_url
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL AND p.id = ANY(_ids);
$$;
REVOKE ALL ON FUNCTION public.get_profiles_basic(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_profiles_basic(uuid[]) TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.get_public_profiles(uuid[]);
CREATE FUNCTION public.get_public_profiles(ids uuid[])
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, cover_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.username, p.avatar_url, p.cover_url
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL AND p.id = ANY(ids);
$$;
REVOKE ALL ON FUNCTION public.get_public_profiles(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_profiles(uuid[]) TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.get_my_friends();
CREATE FUNCTION public.get_my_friends()
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, cover_url text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT p.id, p.full_name, p.username, p.avatar_url, p.cover_url
  FROM public.friendships f
  JOIN public.profiles p ON p.id = f.friend_id
  WHERE f.user_id = auth.uid() AND f.status = 'accepted'
  UNION ALL
  SELECT p.id, p.full_name, p.username, p.avatar_url, p.cover_url
  FROM public.friendships f
  JOIN public.profiles p ON p.id = f.user_id
  WHERE f.friend_id = auth.uid() AND f.status = 'accepted'
  ORDER BY full_name NULLS LAST;
$$;
REVOKE ALL ON FUNCTION public.get_my_friends() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_my_friends() TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.people_you_may_know(integer);
CREATE FUNCTION public.people_you_may_know(_limit integer DEFAULT 8)
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, cover_url text, mutual_count bigint)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_me uuid := auth.uid();
BEGIN
  IF v_me IS NULL THEN RETURN; END IF;
  RETURN QUERY
  WITH edges AS (
    SELECT f.user_id AS a, f.friend_id AS b, f.status FROM public.friendships f
    UNION ALL
    SELECT f.friend_id AS a, f.user_id AS b, f.status FROM public.friendships f
  ),
  linked AS (
    SELECT b AS uid FROM edges WHERE a = v_me
    UNION SELECT v_me
  ),
  my_friends AS (
    SELECT b AS uid FROM edges WHERE a = v_me AND status = 'accepted'
  ),
  fof AS (
    SELECT e.b AS cand, count(*)::bigint AS mutuals
    FROM edges e JOIN my_friends mf ON mf.uid = e.a
    WHERE e.status = 'accepted' AND e.b NOT IN (SELECT uid FROM linked)
    GROUP BY e.b
  ),
  picked AS (
    SELECT cand, mutuals FROM fof
    UNION ALL
    SELECT p.id, 0::bigint FROM public.profiles p
    WHERE NOT EXISTS (SELECT 1 FROM fof) AND p.id NOT IN (SELECT uid FROM linked)
    ORDER BY 2 DESC LIMIT GREATEST(_limit, 1)
  )
  SELECT p.id, p.full_name, p.username, p.avatar_url, p.cover_url, k.mutuals
  FROM picked k JOIN public.profiles p ON p.id = k.cand
  ORDER BY k.mutuals DESC LIMIT GREATEST(_limit, 1);
END;
$$;
REVOKE ALL ON FUNCTION public.people_you_may_know(integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.people_you_may_know(integer) TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.search_users(text, integer);
CREATE FUNCTION public.search_users(q text, lim integer DEFAULT 20)
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, cover_url text, headline text, is_verified boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  WITH params AS (SELECT public.f_unaccent(lower(trim(q))) AS qn)
  SELECT p.id, p.full_name, p.username, p.avatar_url, p.cover_url, p.headline, p.is_verified
  FROM public.profiles p, params
  WHERE auth.uid() IS NOT NULL AND p.id <> auth.uid() AND length(params.qn) >= 1
    AND (public.f_unaccent(lower(coalesce(p.full_name,''))) ILIKE '%' || params.qn || '%'
      OR public.f_unaccent(lower(coalesce(p.username,''))) ILIKE '%' || params.qn || '%')
  ORDER BY CASE
    WHEN public.f_unaccent(lower(coalesce(p.full_name,''))) ILIKE params.qn || '%' THEN 0
    WHEN public.f_unaccent(lower(coalesce(p.username,''))) ILIKE params.qn || '%' THEN 1 ELSE 2 END,
    p.is_verified DESC NULLS LAST, p.full_name ASC NULLS LAST
  LIMIT GREATEST(1, LEAST(coalesce(lim, 20), 50));
$$;
REVOKE ALL ON FUNCTION public.search_users(text, integer) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_users(text, integer) TO authenticated, service_role;

DROP FUNCTION IF EXISTS public.search_public_profiles(text);
CREATE FUNCTION public.search_public_profiles(_query text)
RETURNS TABLE(id uuid, full_name text, username text, avatar_url text, cover_url text)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  normalized_query text;
  query_tokens text[];
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  normalized_query := lower(regexp_replace(public.f_unaccent(btrim(coalesce(_query, ''))), '\s+', ' ', 'g'));
  IF length(normalized_query) < 1 THEN RETURN; END IF;
  SELECT array_agg(token) INTO query_tokens
  FROM regexp_split_to_table(normalized_query, '\s+') AS token WHERE length(token) >= 1;
  IF query_tokens IS NULL THEN RETURN; END IF;
  RETURN QUERY
  WITH candidates AS (
    SELECT p.id, p.full_name, p.username, p.avatar_url, p.cover_url,
      lower(public.f_unaccent(coalesce(p.full_name, ''))) AS name_norm,
      lower(public.f_unaccent(coalesce(p.username, ''))) AS user_norm
    FROM public.profiles p WHERE p.id <> auth.uid()
  )
  SELECT c.id, c.full_name, c.username, c.avatar_url, c.cover_url
  FROM candidates c
  WHERE (c.name_norm LIKE '%' || normalized_query || '%'
      OR c.user_norm LIKE '%' || normalized_query || '%'
      OR NOT EXISTS (SELECT 1 FROM unnest(query_tokens) AS t WHERE (c.name_norm || ' ' || c.user_norm) NOT LIKE '%' || t || '%'))
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users b
      WHERE (b.user_id = auth.uid() AND b.blocked_user_id = c.id)
         OR (b.user_id = c.id AND b.blocked_user_id = auth.uid()))
  ORDER BY CASE
    WHEN c.name_norm LIKE normalized_query || '%' THEN 0
    WHEN c.user_norm LIKE normalized_query || '%' THEN 1
    WHEN c.name_norm LIKE '%' || normalized_query || '%' THEN 2
    WHEN c.user_norm LIKE '%' || normalized_query || '%' THEN 3 ELSE 4 END,
    coalesce(c.full_name, c.username) NULLS LAST
  LIMIT 30;
END;
$$;
REVOKE ALL ON FUNCTION public.search_public_profiles(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.search_public_profiles(text) TO authenticated, service_role;