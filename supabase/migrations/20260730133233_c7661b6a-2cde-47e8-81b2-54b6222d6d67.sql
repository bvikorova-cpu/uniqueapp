CREATE OR REPLACE FUNCTION public.list_pet_pvp_opponents(_limit integer DEFAULT 12)
RETURNS TABLE (
  owner_id uuid,
  owner_name text,
  owner_avatar text,
  pet_id uuid,
  pet_name text,
  species text,
  level integer,
  power integer,
  battle_wins integer,
  battle_losses integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.user_id AS owner_id,
    COALESCE(pr.username, pr.full_name, 'Trainer') AS owner_name,
    pr.avatar_url AS owner_avatar,
    p.id AS pet_id,
    p.name AS pet_name,
    COALESCE(pt.species::text, 'pet') AS species,
    COALESCE(p.level, 1) AS level,
    (COALESCE(p.level,1) * 10 + FLOOR(COALESCE(p.happiness,50)/2) + FLOOR(COALESCE(p.energy,50)/2))::int AS power,
    COALESCE(p.battle_wins, 0) AS battle_wins,
    COALESCE(p.battle_losses, 0) AS battle_losses
  FROM public.pets p
  LEFT JOIN public.pet_types pt ON pt.id = p.pet_type_id
  LEFT JOIN public.profiles pr ON pr.id = p.user_id
  WHERE p.user_id IS DISTINCT FROM auth.uid()
  ORDER BY random()
  LIMIT GREATEST(1, LEAST(COALESCE(_limit, 12), 50));
$$;

GRANT EXECUTE ON FUNCTION public.list_pet_pvp_opponents(integer) TO authenticated;