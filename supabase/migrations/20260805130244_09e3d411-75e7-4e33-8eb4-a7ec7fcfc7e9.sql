CREATE TABLE IF NOT EXISTS public.dating_perk_balances (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  boosts integer NOT NULL DEFAULT 0,
  super_likes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dating_perk_balances TO authenticated;
GRANT ALL ON public.dating_perk_balances TO service_role;

ALTER TABLE public.dating_perk_balances ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own dating perks" ON public.dating_perk_balances;
CREATE POLICY "Users manage own dating perks" ON public.dating_perk_balances
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.purchase_dating_perk(p_kind text, p_count integer, p_credits integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_ok boolean;
  v_boosts integer;
  v_supers integer;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;
  IF p_kind NOT IN ('boost','super_like') OR p_count IS NULL OR p_count <= 0 OR p_credits IS NULL OR p_credits <= 0 THEN
    RETURN jsonb_build_object('success', false, 'error', 'invalid_input');
  END IF;

  SELECT public.deduct_ai_credits(v_user, p_credits, 'dating_perk_' || p_kind, 'dating') INTO v_ok;
  IF NOT COALESCE(v_ok, false) THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_credits');
  END IF;

  INSERT INTO public.dating_perk_balances (user_id, boosts, super_likes)
  VALUES (v_user,
          CASE WHEN p_kind = 'boost' THEN p_count ELSE 0 END,
          CASE WHEN p_kind = 'super_like' THEN p_count ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE
    SET boosts = public.dating_perk_balances.boosts + CASE WHEN p_kind = 'boost' THEN p_count ELSE 0 END,
        super_likes = public.dating_perk_balances.super_likes + CASE WHEN p_kind = 'super_like' THEN p_count ELSE 0 END,
        updated_at = now()
  RETURNING boosts, super_likes INTO v_boosts, v_supers;

  RETURN jsonb_build_object('success', true, 'boosts', v_boosts, 'super_likes', v_supers);
END;
$$;

REVOKE ALL ON FUNCTION public.purchase_dating_perk(text, integer, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.purchase_dating_perk(text, integer, integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.consume_dating_perk(p_kind text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_rows integer;
BEGIN
  IF v_user IS NULL OR p_kind NOT IN ('boost','super_like') THEN
    RETURN false;
  END IF;

  IF p_kind = 'boost' THEN
    UPDATE public.dating_perk_balances SET boosts = boosts - 1, updated_at = now()
      WHERE user_id = v_user AND boosts > 0;
  ELSE
    UPDATE public.dating_perk_balances SET super_likes = super_likes - 1, updated_at = now()
      WHERE user_id = v_user AND super_likes > 0;
  END IF;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows > 0;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_dating_perk(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.consume_dating_perk(text) TO authenticated;