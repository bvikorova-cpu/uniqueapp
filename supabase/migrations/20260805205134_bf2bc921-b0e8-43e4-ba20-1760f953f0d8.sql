CREATE OR REPLACE FUNCTION public.pay_daily_entry(p_reason text, p_amount integer DEFAULT 2)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_exists boolean;
  v_ok boolean;
BEGIN
  IF v_user IS NULL THEN
    RETURN jsonb_build_object('status','unauthorized','paid',false);
  END IF;
  IF p_reason NOT IN ('dating_daily_entry','anonymous_date_daily_entry') THEN
    RETURN jsonb_build_object('status','invalid_reason','paid',false);
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.ai_credits_ledger
    WHERE user_id = v_user
      AND reason = p_reason
      AND created_at >= date_trunc('day', now())
      AND created_at < date_trunc('day', now()) + interval '1 day'
  ) INTO v_exists;

  IF v_exists THEN
    RETURN jsonb_build_object('status','already_paid','paid',true);
  END IF;

  SELECT public.deduct_ai_credits(v_user, p_amount, p_reason, 'dating') INTO v_ok;

  IF v_ok IS DISTINCT FROM true THEN
    RETURN jsonb_build_object('status','insufficient_credits','paid',false);
  END IF;

  RETURN jsonb_build_object('status','charged','paid',true);
END;
$$;

CREATE OR REPLACE FUNCTION public.has_paid_daily_entry(p_reason text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ai_credits_ledger
    WHERE user_id = auth.uid()
      AND reason = p_reason
      AND created_at >= date_trunc('day', now())
      AND created_at < date_trunc('day', now()) + interval '1 day'
  );
$$;

GRANT EXECUTE ON FUNCTION public.pay_daily_entry(text, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_paid_daily_entry(text) TO authenticated;