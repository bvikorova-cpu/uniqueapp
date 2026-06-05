
CREATE OR REPLACE FUNCTION public.create_guild(
  _name text,
  _description text DEFAULT NULL,
  _emblem text DEFAULT NULL,
  _banner_color text DEFAULT '#7c3aed'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _existing uuid;
  _new_guild public.guilds;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF _name IS NULL OR length(btrim(_name)) = 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'name_required');
  END IF;

  -- Lock-via-unique: only one guild per user
  SELECT guild_id INTO _existing FROM public.guild_members WHERE user_id = _uid LIMIT 1;
  IF _existing IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_in_guild');
  END IF;

  INSERT INTO public.guilds (name, description, emblem, banner_color, created_by, member_count)
  VALUES (btrim(_name), _description, _emblem, COALESCE(_banner_color,'#7c3aed'), _uid, 1)
  RETURNING * INTO _new_guild;

  INSERT INTO public.guild_members (guild_id, user_id, role)
  VALUES (_new_guild.id, _uid, 'leader');

  RETURN jsonb_build_object('ok', true, 'guild_id', _new_guild.id);
EXCEPTION WHEN unique_violation THEN
  RETURN jsonb_build_object('ok', false, 'error', 'duplicate');
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_guild(text,text,text,text) TO authenticated;
