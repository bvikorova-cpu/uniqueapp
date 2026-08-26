CREATE OR REPLACE FUNCTION public.purchase_verified_with_credits()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _cost int := 15;
  _spend jsonb;
  _tier text;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT verification_tier INTO _tier FROM public.profiles WHERE id = _uid;
  IF _tier IS NOT NULL AND _tier <> 'none' THEN
    RETURN jsonb_build_object('ok', true, 'already', true, 'tier', _tier);
  END IF;

  SELECT public.spend_ai_credits(_cost, 'Unique Verified (one-time)', 'verified_badge') INTO _spend;
  IF NOT COALESCE((_spend->>'ok')::boolean, false) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient_credits');
  END IF;

  UPDATE public.profiles
     SET verification_tier = 'verified',
         verification_expires_at = NULL
   WHERE id = _uid;

  RETURN jsonb_build_object('ok', true, 'tier', 'verified', 'spent', _cost);
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_verified_with_credits() FROM public;
GRANT EXECUTE ON FUNCTION public.purchase_verified_with_credits() TO authenticated;