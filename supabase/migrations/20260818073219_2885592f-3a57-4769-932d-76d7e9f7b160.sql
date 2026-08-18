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
  _idx integer;
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

  IF _missing IS NOT NULL AND array_length(_missing, 1) > 0 THEN
    -- always hand out a piece the user does not own yet: no duplicates, no endless grind
    _idx := _missing[1 + floor(random() * array_length(_missing, 1))::int];
  ELSE
    _idx := floor(random() * _total_pieces)::int;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'piece_index', _idx,
    'missing_left', COALESCE(array_length(_missing, 1), 0),
    'balance', (_spend->>'balance')::integer,
    'owned', EXISTS (
      SELECT 1 FROM public.puzzle_piece_collection p
      WHERE p.user_id = _uid AND p.puzzle_slug = _puzzle_slug AND p.piece_index = _idx
    )
  );
END;
$function$;