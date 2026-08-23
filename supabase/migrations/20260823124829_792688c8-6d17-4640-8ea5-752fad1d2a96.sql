CREATE OR REPLACE FUNCTION public.get_equipped_rewards_cosmetics(_user_ids uuid[])
RETURNS TABLE(user_id uuid, category text, slug text, name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT urc.user_id, ci.category::text, ci.slug::text, ci.name::text
  FROM public.user_rewards_cosmetics urc
  JOIN public.rewards_cosmetic_items ci ON ci.id = urc.item_id
  WHERE urc.is_equipped = true
    AND urc.user_id = ANY(_user_ids);
$$;

GRANT EXECUTE ON FUNCTION public.get_equipped_rewards_cosmetics(uuid[]) TO anon, authenticated, service_role;