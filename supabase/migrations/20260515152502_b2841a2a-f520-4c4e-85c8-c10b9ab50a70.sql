
-- Secure RPC to claim a quest node: validates ordering & path window, grants XP, updates progress
CREATE OR REPLACE FUNCTION public.claim_quest_node(_path_id uuid, _node_index integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user uuid := auth.uid();
  _path record;
  _node record;
  _prog record;
  _completed integer[];
  _xp_awarded integer := 0;
BEGIN
  IF _user IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated');
  END IF;

  SELECT * INTO _path FROM quest_paths
   WHERE id = _path_id AND is_active = true
     AND starts_at <= now() AND ends_at >= now();
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'path_unavailable');
  END IF;

  SELECT * INTO _node FROM quest_nodes WHERE path_id = _path_id AND node_index = _node_index;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'node_not_found');
  END IF;

  SELECT * INTO _prog FROM user_quest_path_progress
   WHERE user_id = _user AND path_id = _path_id;

  _completed := COALESCE(_prog.completed_nodes, ARRAY[]::integer[]);

  IF _node_index = ANY(_completed) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_claimed');
  END IF;

  -- Enforce ordering: previous node must be done (or this is index 0 / lowest)
  IF _node_index > 0 AND NOT ((_node_index - 1) = ANY(_completed)) THEN
    -- allow if there is no node with prev index (gaps)
    IF EXISTS (SELECT 1 FROM quest_nodes WHERE path_id = _path_id AND node_index = _node_index - 1) THEN
      RETURN jsonb_build_object('ok', false, 'error', 'previous_node_locked');
    END IF;
  END IF;

  _completed := array_append(_completed, _node_index);

  INSERT INTO user_quest_path_progress (user_id, path_id, current_node, completed_nodes)
  VALUES (_user, _path_id, _node_index + 1, _completed)
  ON CONFLICT (user_id, path_id) DO UPDATE
    SET current_node = EXCLUDED.current_node,
        completed_nodes = EXCLUDED.completed_nodes,
        updated_at = now();

  -- Grant XP if reward is XP-based
  IF _node.reward_type IN ('xp','points') AND COALESCE(_node.reward_value,0) > 0 THEN
    _xp_awarded := _node.reward_value;
    INSERT INTO user_points (user_id, total_points, current_level_points, level)
    VALUES (_user, _xp_awarded, _xp_awarded, 1)
    ON CONFLICT (user_id) DO UPDATE
      SET total_points = user_points.total_points + _xp_awarded,
          current_level_points = user_points.current_level_points + _xp_awarded,
          updated_at = now();
  END IF;

  RETURN jsonb_build_object('ok', true, 'xp_awarded', _xp_awarded, 'reward_type', _node.reward_type, 'reward_value', _node.reward_value);
END;
$$;

GRANT EXECUTE ON FUNCTION public.claim_quest_node(uuid, integer) TO authenticated;
