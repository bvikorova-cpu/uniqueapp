CREATE OR REPLACE FUNCTION public.get_anon_date_trait_counts()
RETURNS TABLE(trait text, user_count bigint)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(t) AS trait, count(DISTINCT p.user_id) AS user_count
  FROM public.anonymous_dating_profiles p
  CROSS JOIN LATERAL unnest(coalesce(p.personality_traits, '{}'::text[])) AS t
  WHERE p.is_active IS TRUE
  GROUP BY lower(t)
$$;

GRANT EXECUTE ON FUNCTION public.get_anon_date_trait_counts() TO authenticated;