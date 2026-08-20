CREATE OR REPLACE FUNCTION public.get_trending_hashtags(p_limit integer DEFAULT 10)
RETURNS TABLE(topic text, post_count bigint, engagement_score numeric)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(m.tag[1]) AS topic,
         COUNT(*)::bigint AS post_count,
         SUM(1 + COALESCE(p.likes_count,0) + COALESCE(p.comments_count,0))::numeric AS engagement_score
  FROM public.posts p
  CROSS JOIN LATERAL regexp_matches(COALESCE(p.content,''), '#([A-Za-z0-9_]{2,30})', 'g') AS m(tag)
  WHERE p.created_at > now() - interval '7 days'
    AND COALESCE(p.privacy, 'public') = 'public'
  GROUP BY lower(m.tag[1])
  ORDER BY engagement_score DESC, post_count DESC
  LIMIT GREATEST(1, LEAST(p_limit, 25))
$$;

REVOKE ALL ON FUNCTION public.get_trending_hashtags(integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_trending_hashtags(integer) TO anon, authenticated, service_role;