
ALTER TABLE public.bazaar_items
  ADD COLUMN IF NOT EXISTS bumped_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS top_until TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_bazaar_items_top_until ON public.bazaar_items(top_until);
CREATE INDEX IF NOT EXISTS idx_bazaar_items_bumped_until ON public.bazaar_items(bumped_until);

CREATE OR REPLACE FUNCTION public.bazaar_promote_listing(p_item_id UUID, p_plan TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user UUID := auth.uid();
  v_owner UUID;
  v_cost INT;
  v_balance INT;
  v_new_top TIMESTAMPTZ;
  v_new_bump TIMESTAMPTZ;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id INTO v_owner FROM public.bazaar_items WHERE id = p_item_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;
  IF v_owner <> v_user THEN
    RAISE EXCEPTION 'Only the owner can promote this listing';
  END IF;

  IF p_plan = 'bump' THEN
    v_cost := 5;
  ELSIF p_plan = 'top' THEN
    v_cost := 15;
  ELSE
    RAISE EXCEPTION 'Invalid plan';
  END IF;

  SELECT credits_remaining INTO v_balance
  FROM public.creative_forge_credits WHERE user_id = v_user;
  IF v_balance IS NULL OR v_balance < v_cost THEN
    RAISE EXCEPTION 'Insufficient credits (need %, have %)', v_cost, COALESCE(v_balance, 0);
  END IF;

  UPDATE public.creative_forge_credits
    SET credits_remaining = credits_remaining - v_cost, updated_at = now()
  WHERE user_id = v_user;

  IF p_plan = 'top' THEN
    UPDATE public.bazaar_items
      SET top_until = GREATEST(COALESCE(top_until, now()), now()) + INTERVAL '7 days',
          bumped_until = GREATEST(COALESCE(bumped_until, now()), now()) + INTERVAL '7 days'
    WHERE id = p_item_id
    RETURNING top_until, bumped_until INTO v_new_top, v_new_bump;
  ELSE
    UPDATE public.bazaar_items
      SET bumped_until = GREATEST(COALESCE(bumped_until, now()), now()) + INTERVAL '7 days'
    WHERE id = p_item_id
    RETURNING top_until, bumped_until INTO v_new_top, v_new_bump;
  END IF;

  RETURN jsonb_build_object(
    'plan', p_plan,
    'cost', v_cost,
    'top_until', v_new_top,
    'bumped_until', v_new_bump,
    'credits_remaining', v_balance - v_cost
  );
END;
$$;

REVOKE ALL ON FUNCTION public.bazaar_promote_listing(UUID, TEXT) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.bazaar_promote_listing(UUID, TEXT) TO authenticated;
