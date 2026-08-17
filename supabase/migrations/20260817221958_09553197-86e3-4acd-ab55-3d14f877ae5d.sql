CREATE TABLE IF NOT EXISTS public.puzzle_piece_collection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  puzzle_slug text NOT NULL,
  piece_index integer NOT NULL,
  copies integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, puzzle_slug, piece_index)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.puzzle_piece_collection TO authenticated;
GRANT ALL ON public.puzzle_piece_collection TO service_role;

ALTER TABLE public.puzzle_piece_collection ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own puzzle pieces"
  ON public.puzzle_piece_collection FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_puzzle_pieces_user_slug
  ON public.puzzle_piece_collection (user_id, puzzle_slug);

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

  IF _missing IS NOT NULL AND array_length(_missing, 1) > 0 AND random() < 0.75 THEN
    _idx := _missing[1 + floor(random() * array_length(_missing, 1))::int];
  ELSE
    _idx := floor(random() * _total_pieces)::int;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'piece_index', _idx,
    'balance', (_spend->>'balance')::integer,
    'owned', EXISTS (
      SELECT 1 FROM public.puzzle_piece_collection p
      WHERE p.user_id = _uid AND p.puzzle_slug = _puzzle_slug AND p.piece_index = _idx
    )
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.puzzle_keep_piece(_puzzle_slug text, _piece_index integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  _uid uuid := auth.uid();
  _copies integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;
  IF _puzzle_slug IS NULL OR _piece_index IS NULL OR _piece_index < 0 OR _piece_index > 399 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'invalid_request');
  END IF;

  INSERT INTO public.puzzle_piece_collection (user_id, puzzle_slug, piece_index, copies)
  VALUES (_uid, _puzzle_slug, _piece_index, 1)
  ON CONFLICT (user_id, puzzle_slug, piece_index)
  DO UPDATE SET copies = public.puzzle_piece_collection.copies + 1, updated_at = now()
  RETURNING copies INTO _copies;

  RETURN jsonb_build_object('ok', true, 'copies', _copies);
END;
$function$;

GRANT EXECUTE ON FUNCTION public.puzzle_draw_piece(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.puzzle_keep_piece(text, integer) TO authenticated;