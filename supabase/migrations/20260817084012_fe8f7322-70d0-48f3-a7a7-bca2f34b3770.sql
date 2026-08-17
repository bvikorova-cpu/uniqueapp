DROP FUNCTION IF EXISTS public.coffee_discover_candidates(integer);

CREATE OR REPLACE FUNCTION public.coffee_discover_candidates(_limit integer DEFAULT 20)
RETURNS TABLE(user_id uuid, full_name text, username text, email text, avatar_url text, bio text, favorite_coffee_types text[], preferred_atmosphere text[], budget_preference text, total_checkins integer)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT p.id,
         p.full_name,
         p.username,
         p.email,
         p.avatar_url,
         p.bio,
         cp.favorite_coffee_types,
         cp.preferred_atmosphere,
         cp.budget_preference,
         COALESCE(cp.total_checkins, 0)
  FROM public.profiles p
  LEFT JOIN public.coffee_profiles cp ON cp.user_id = p.id
  WHERE p.id <> auth.uid()
    AND auth.uid() IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM public.coffee_swipes s
      WHERE s.user_id = auth.uid() AND s.target_user_id = p.id
    )
  ORDER BY (NULLIF(p.avatar_url, '') IS NOT NULL) DESC,
           (cp.user_id IS NOT NULL) DESC,
           p.created_at DESC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 20), 1), 50);
$function$;

GRANT EXECUTE ON FUNCTION public.coffee_discover_candidates(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.coffee_discover_candidates(integer) TO service_role;