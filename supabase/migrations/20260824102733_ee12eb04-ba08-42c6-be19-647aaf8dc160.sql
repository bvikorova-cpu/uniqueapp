CREATE OR REPLACE FUNCTION public.boost_megatalent_with_credits(p_submission_id uuid, p_category text, p_cost integer DEFAULT 5)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_owner uuid;
  v_ok boolean;
  v_id uuid;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT user_id INTO v_owner FROM public.talent_submissions WHERE id = p_submission_id;
  IF v_owner IS NULL OR v_owner <> v_user THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_owner');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.megatalent_boosts
    WHERE submission_id = p_submission_id AND status = 'active' AND expires_at > now()
  ) THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_boosted');
  END IF;

  v_ok := public.deduct_ai_credits(p_user_id := v_user, p_amount := p_cost, p_reason := 'Megatalent boost (24h)', p_source := 'megatalent_boost');
  IF NOT COALESCE(v_ok, false) THEN
    RETURN jsonb_build_object('success', false, 'error', 'insufficient_credits');
  END IF;

  INSERT INTO public.megatalent_boosts (user_id, submission_id, category, amount_cents, status, expires_at)
  VALUES (v_user, p_submission_id, p_category, 0, 'active', now() + interval '24 hours')
  RETURNING id INTO v_id;

  RETURN jsonb_build_object('success', true, 'boost_id', v_id, 'cost', p_cost);
END;
$$;

REVOKE ALL ON FUNCTION public.boost_megatalent_with_credits(uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.boost_megatalent_with_credits(uuid, text, integer) TO authenticated;