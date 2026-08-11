CREATE OR REPLACE FUNCTION public.get_horse_rankings(_limit int DEFAULT 50)
RETURNS TABLE (
  id uuid,
  name text,
  breed text,
  color text,
  image_url text,
  speed_stat int,
  stamina_stat int,
  race_wins int,
  total_races int,
  owner_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT h.id,
         h.name,
         h.breed::text,
         h.color,
         h.image_url,
         h.speed_stat::int,
         h.stamina_stat::int,
         h.race_wins::int,
         h.total_races::int,
         COALESCE(NULLIF(p.username, ''), NULLIF(p.full_name, ''), 'Anonymous Owner') AS owner_name
  FROM public.horses h
  LEFT JOIN public.profiles p ON p.id = h.user_id
  ORDER BY h.race_wins DESC NULLS LAST,
           (h.speed_stat + h.stamina_stat) DESC NULLS LAST,
           h.created_at ASC
  LIMIT LEAST(GREATEST(COALESCE(_limit, 50), 1), 100);
$$;

REVOKE ALL ON FUNCTION public.get_horse_rankings(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_horse_rankings(int) TO anon, authenticated, service_role;