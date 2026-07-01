CREATE OR REPLACE FUNCTION public.ensure_free_tier_credits()
RETURNS public.free_tier_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_row public.free_tier_credits;
  v_settings public.free_tier_settings;
  v_current_month text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_settings FROM public.free_tier_settings WHERE id = 1 LIMIT 1;

  v_current_month := to_char(
    (now() AT TIME ZONE COALESCE(v_settings.timezone, 'Europe/Bratislava')),
    'YYYY-MM'
  );

  SELECT * INTO v_row FROM public.free_tier_credits WHERE user_id = v_uid LIMIT 1;

  IF NOT FOUND THEN
    INSERT INTO public.free_tier_credits (user_id, month_key)
    VALUES (v_uid, v_current_month)
    ON CONFLICT (user_id) DO NOTHING;
    SELECT * INTO v_row FROM public.free_tier_credits WHERE user_id = v_uid LIMIT 1;
  END IF;

  -- Monthly top-up: idempotent by month_key
  IF COALESCE(v_settings.enabled, true)
     AND COALESCE(v_settings.monthly_amount, 0) > 0
     AND (v_row.month_key IS DISTINCT FROM v_current_month) THEN

    UPDATE public.free_tier_credits
       SET balance = COALESCE(balance, 0) + v_settings.monthly_amount,
           month_key = v_current_month,
           updated_at = now()
     WHERE user_id = v_uid
       AND (month_key IS DISTINCT FROM v_current_month)
    RETURNING * INTO v_row;

    IF FOUND THEN
      INSERT INTO public.free_tier_credit_ledger (user_id, delta, reason, balance_after)
      VALUES (v_uid, v_settings.monthly_amount, 'Monthly top-up', v_row.balance);
    END IF;
  END IF;

  RETURN v_row;
END;
$function$;