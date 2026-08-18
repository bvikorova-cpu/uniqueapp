CREATE OR REPLACE FUNCTION public.puzzle_draw_piece(_puzzle_slug text, _total_pieces integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _spend jsonb;
  _missing integer[];
  _missing_left integer;
  _owned integer[];
  _idx integer;
  _chance numeric;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF _puzzle_slug IS NULL OR _total_pieces IS NULL OR _total_pieces < 1 OR _total_pieces > 400 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_request');
  END IF;

  _spend := public.spend_ai_credits(1, 'puzzle_piece_draw:' || _puzzle_slug, 'kids_puzzles');
  IF COALESCE((_spend->>'ok')::boolean, false) IS NOT TRUE THEN
    RETURN _spend;
  END IF;

  SELECT array_agg(i) INTO _missing
  FROM generate_series(0, _total_pieces - 1) AS g(i)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.puzzle_piece_collection p
    WHERE p.user_id = _uid AND p.puzzle_slug = _puzzle_slug AND p.piece_index = g.i
  );
  _missing_left := COALESCE(array_length(_missing, 1), 0);

  SELECT array_agg(p.piece_index) INTO _owned
  FROM public.puzzle_piece_collection p
  WHERE p.user_id = _uid AND p.puzzle_slug = _puzzle_slug;

  IF _missing_left = 0 THEN
    _idx := floor(random() * _total_pieces)::int;
  ELSE
    -- rarity curve like the collectible cards: duplicates are common,
    -- and the very last pieces are ultra rare (~1 in 1000 draws)
    _chance := CASE
      WHEN _missing_left = 1 THEN 0.001
      WHEN _missing_left = 2 THEN 0.002
      WHEN _missing_left = 3 THEN 0.005
      WHEN _missing_left <= 5 THEN 0.02
      WHEN _missing_left <= 10 THEN 0.10
      ELSE 0.45
    END;

    IF random() < _chance OR _owned IS NULL THEN
      _idx := _missing[1 + floor(random() * _missing_left)::int];
    ELSE
      _idx := _owned[1 + floor(random() * array_length(_owned, 1))::int];
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'piece_index', _idx,
    'missing_left', _missing_left,
    'balance', (_spend->>'balance')::integer,
    'owned', EXISTS (
      SELECT 1 FROM public.puzzle_piece_collection p
      WHERE p.user_id = _uid AND p.puzzle_slug = _puzzle_slug AND p.piece_index = _idx
    )
  );
END;
$function$;