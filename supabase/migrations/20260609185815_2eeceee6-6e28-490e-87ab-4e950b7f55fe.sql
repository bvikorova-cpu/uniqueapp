
-- Generic atomic deduct/refund helpers per credit table. SECURITY DEFINER so RLS doesn't block.

-- creative_forge_credits
CREATE OR REPLACE FUNCTION public.deduct_creative_forge_credits(_user_id uuid, _amount int)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _remaining int;
BEGIN
  UPDATE creative_forge_credits
     SET credits_remaining = credits_remaining - _amount,
         updated_at = now()
   WHERE user_id = _user_id AND credits_remaining >= _amount
  RETURNING credits_remaining INTO _remaining;
  IF _remaining IS NULL THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  RETURN _remaining;
END$$;

CREATE OR REPLACE FUNCTION public.refund_creative_forge_credits(_user_id uuid, _amount int)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE creative_forge_credits
     SET credits_remaining = credits_remaining + _amount,
         updated_at = now()
   WHERE user_id = _user_id;
$$;

-- ai_credits
CREATE OR REPLACE FUNCTION public.deduct_ai_credits_atomic(_user_id uuid, _amount int)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _remaining int;
BEGIN
  UPDATE ai_credits
     SET credits_remaining = credits_remaining - _amount,
         updated_at = now()
   WHERE user_id = _user_id AND credits_remaining >= _amount
  RETURNING credits_remaining INTO _remaining;
  IF _remaining IS NULL THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  RETURN _remaining;
END$$;

CREATE OR REPLACE FUNCTION public.refund_ai_credits_atomic(_user_id uuid, _amount int)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE ai_credits
     SET credits_remaining = credits_remaining + _amount,
         updated_at = now()
   WHERE user_id = _user_id;
$$;

-- handwriting_credits
CREATE OR REPLACE FUNCTION public.deduct_handwriting_credits(_user_id uuid, _amount int)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _remaining int;
BEGIN
  UPDATE handwriting_credits
     SET credits_remaining = credits_remaining - _amount,
         updated_at = now()
   WHERE user_id = _user_id AND credits_remaining >= _amount
  RETURNING credits_remaining INTO _remaining;
  IF _remaining IS NULL THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  RETURN _remaining;
END$$;

CREATE OR REPLACE FUNCTION public.refund_handwriting_credits(_user_id uuid, _amount int)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE handwriting_credits
     SET credits_remaining = credits_remaining + _amount,
         updated_at = now()
   WHERE user_id = _user_id;
$$;

-- shadow_arena_credits
CREATE OR REPLACE FUNCTION public.deduct_shadow_arena_credits(_user_id uuid, _amount int)
RETURNS int LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _remaining int;
BEGIN
  UPDATE shadow_arena_credits
     SET credits_remaining = credits_remaining - _amount,
         updated_at = now()
   WHERE user_id = _user_id AND credits_remaining >= _amount
  RETURNING credits_remaining INTO _remaining;
  IF _remaining IS NULL THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  RETURN _remaining;
END$$;

CREATE OR REPLACE FUNCTION public.refund_shadow_arena_credits(_user_id uuid, _amount int)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  UPDATE shadow_arena_credits
     SET credits_remaining = credits_remaining + _amount,
         updated_at = now()
   WHERE user_id = _user_id;
$$;

GRANT EXECUTE ON FUNCTION public.deduct_creative_forge_credits(uuid, int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refund_creative_forge_credits(uuid, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_ai_credits_atomic(uuid, int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refund_ai_credits_atomic(uuid, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_handwriting_credits(uuid, int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refund_handwriting_credits(uuid, int) TO service_role;
GRANT EXECUTE ON FUNCTION public.deduct_shadow_arena_credits(uuid, int) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.refund_shadow_arena_credits(uuid, int) TO service_role;
