CREATE OR REPLACE FUNCTION public.get_equipped_battle_cosmetics(_user_ids uuid[])
RETURNS TABLE (user_id uuid, kind text, code text, name text, preview text, css_class text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT o.user_id, c.kind, c.code, c.name, c.preview, c.css_class
  FROM public.battle_cosmetics_owned o
  JOIN public.battle_cosmetics c ON c.id = o.cosmetic_id
  WHERE o.is_equipped = true
    AND o.user_id = ANY(_user_ids)
$$;

REVOKE ALL ON FUNCTION public.get_equipped_battle_cosmetics(uuid[]) FROM public;
GRANT EXECUTE ON FUNCTION public.get_equipped_battle_cosmetics(uuid[]) TO authenticated, anon;