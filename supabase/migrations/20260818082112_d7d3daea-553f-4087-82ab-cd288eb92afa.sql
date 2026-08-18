CREATE TABLE IF NOT EXISTS public.user_card_trash (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collectible_id uuid NOT NULL REFERENCES public.card_collectibles(id) ON DELETE CASCADE,
  category_slug text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_card_trash_user ON public.user_card_trash(user_id, created_at DESC);

GRANT SELECT, INSERT, DELETE ON public.user_card_trash TO authenticated;
GRANT ALL ON public.user_card_trash TO service_role;

ALTER TABLE public.user_card_trash ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own trashed cards" ON public.user_card_trash;
CREATE POLICY "Users view own trashed cards" ON public.user_card_trash
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users trash own cards" ON public.user_card_trash;
CREATE POLICY "Users trash own cards" ON public.user_card_trash
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own trashed cards" ON public.user_card_trash;
CREATE POLICY "Users delete own trashed cards" ON public.user_card_trash
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Move a drawn card into the trash bin (credits are NOT refunded).
CREATE OR REPLACE FUNCTION public.card_trash_add(_collectible_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _slug text;
  _id uuid;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT category_slug INTO _slug FROM public.card_collectibles WHERE id = _collectible_id;
  IF _slug IS NULL THEN RAISE EXCEPTION 'Card not found'; END IF;

  INSERT INTO public.user_card_trash (user_id, collectible_id, category_slug)
  VALUES (_uid, _collectible_id, _slug)
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

-- Recycle exactly 10 trashed cards for +1 AI credit.
CREATE OR REPLACE FUNCTION public.card_trash_recycle(_trash_ids uuid[])
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
    RAISE EXCEPTION 'Select exactly 10 trashed cards to recycle';
  END IF;

  DELETE FROM public.user_card_trash
  WHERE user_id = _uid AND id = ANY(_ids);
  GET DIAGNOSTICS _deleted = ROW_COUNT;

  IF _deleted <> 10 THEN
    RAISE EXCEPTION 'Some selected cards are no longer in your trash';
  END IF;

  PERFORM set_config('app.credit_reason', 'card_trash_recycle', true);
  PERFORM set_config('app.credit_source', 'card_collections', true);

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
  VALUES (_uid, 1, _before, _after, 'card_trash_recycle', 'card_collections');

  RETURN jsonb_build_object('recycled', _deleted, 'credits_awarded', 1, 'balance', _after);
END;
$$;

REVOKE ALL ON FUNCTION public.card_trash_add(uuid) FROM public;
REVOKE ALL ON FUNCTION public.card_trash_recycle(uuid[]) FROM public;
GRANT EXECUTE ON FUNCTION public.card_trash_add(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.card_trash_recycle(uuid[]) TO authenticated;