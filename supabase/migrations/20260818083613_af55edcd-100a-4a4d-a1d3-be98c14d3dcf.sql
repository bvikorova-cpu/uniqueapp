CREATE TABLE IF NOT EXISTS public.puzzle_piece_trash (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  puzzle_slug text NOT NULL,
  piece_index integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_puzzle_piece_trash_user ON public.puzzle_piece_trash(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_puzzle_piece_trash_slug ON public.puzzle_piece_trash(user_id, puzzle_slug);

GRANT SELECT, INSERT, DELETE ON public.puzzle_piece_trash TO authenticated;
GRANT ALL ON public.puzzle_piece_trash TO service_role;

ALTER TABLE public.puzzle_piece_trash ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own trashed pieces" ON public.puzzle_piece_trash;
CREATE POLICY "Users view own trashed pieces" ON public.puzzle_piece_trash
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users trash own pieces" ON public.puzzle_piece_trash;
CREATE POLICY "Users trash own pieces" ON public.puzzle_piece_trash
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own trashed pieces" ON public.puzzle_piece_trash;
CREATE POLICY "Users delete own trashed pieces" ON public.puzzle_piece_trash
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.puzzle_trash_add(_puzzle_slug text, _piece_index integer)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _puzzle_slug IS NULL OR _piece_index IS NULL OR _piece_index < 0 OR _piece_index > 399 THEN
    RAISE EXCEPTION 'Invalid piece';
  END IF;

  INSERT INTO public.puzzle_piece_trash (user_id, puzzle_slug, piece_index)
  VALUES (_uid, _puzzle_slug, _piece_index)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

CREATE OR REPLACE FUNCTION public.puzzle_trash_recycle(_trash_ids uuid[])
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _ids uuid[];
  _deleted int;
  _before int;
  _after int;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT array_agg(DISTINCT x) INTO _ids FROM unnest(_trash_ids) AS x;
  IF _ids IS NULL OR array_length(_ids, 1) <> 10 THEN
    RAISE EXCEPTION 'Select exactly 10 scrapped pieces to recycle';
  END IF;

  DELETE FROM public.puzzle_piece_trash
  WHERE user_id = _uid AND id = ANY(_ids);
  GET DIAGNOSTICS _deleted = ROW_COUNT;

  IF _deleted <> 10 THEN
    RAISE EXCEPTION 'Some selected pieces are no longer in your scrap box';
  END IF;

  PERFORM set_config('app.credit_reason', 'puzzle_trash_recycle', true);
  PERFORM set_config('app.credit_source', 'puzzles', true);

  INSERT INTO public.ai_credits (user_id, credits_remaining)
  VALUES (_uid, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT credits_remaining INTO _before FROM public.ai_credits WHERE user_id = _uid FOR UPDATE;

  UPDATE public.ai_credits
     SET credits_remaining = credits_remaining + 1,
         updated_at = now()
   WHERE user_id = _uid
  RETURNING credits_remaining INTO _after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source)
  VALUES (_uid, 1, _before, _after, 'puzzle_trash_recycle', 'puzzles');

  RETURN jsonb_build_object('recycled', _deleted, 'credits_awarded', 1, 'balance', _after);
END;
$$;

REVOKE ALL ON FUNCTION public.puzzle_trash_add(text, integer) FROM public;
REVOKE ALL ON FUNCTION public.puzzle_trash_recycle(uuid[]) FROM public;
GRANT EXECUTE ON FUNCTION public.puzzle_trash_add(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.puzzle_trash_recycle(uuid[]) TO authenticated;