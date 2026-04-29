
-- Atomic donation processing
CREATE OR REPLACE FUNCTION public.process_campaign_donation(
  _campaign_id uuid,
  _campaign_type text,
  _donor_id uuid,
  _donor_email text,
  _donor_name text,
  _amount numeric,
  _is_monthly boolean,
  _is_anonymous boolean,
  _message text,
  _stripe_payment_id text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _fee_pct numeric;
  _fee numeric;
  _net numeric;
  _existing uuid;
  _table text;
BEGIN
  IF _campaign_type NOT IN ('medical','dream','hero','pet','student','crisis','talent') THEN
    RAISE EXCEPTION 'Invalid campaign_type %', _campaign_type;
  END IF;

  -- Idempotency: do not double-record the same Stripe payment
  IF _stripe_payment_id IS NOT NULL THEN
    SELECT id INTO _existing
    FROM public.campaign_donations
    WHERE stripe_payment_id = _stripe_payment_id
    LIMIT 1;
    IF _existing IS NOT NULL THEN
      RETURN jsonb_build_object('status','duplicate','donation_id',_existing);
    END IF;
  END IF;

  _fee_pct := CASE _campaign_type
    WHEN 'medical' THEN 0.06
    WHEN 'dream'   THEN 0.07
    WHEN 'hero'    THEN 0.05
    WHEN 'pet'     THEN 0.06
    WHEN 'student' THEN 0.05
    WHEN 'crisis'  THEN 0.08
    WHEN 'talent'  THEN 0.10
  END;

  _fee := round(_amount * _fee_pct, 2);
  _net := _amount - _fee;

  INSERT INTO public.campaign_donations(
    donor_id, donor_email, donor_name, campaign_id, campaign_type,
    amount, platform_fee, net_amount, is_monthly, is_anonymous, message,
    stripe_payment_id, status
  ) VALUES (
    _donor_id, _donor_email, _donor_name, _campaign_id, _campaign_type,
    _amount, _fee, _net, COALESCE(_is_monthly,false), COALESCE(_is_anonymous,false), _message,
    _stripe_payment_id, 'completed'
  )
  RETURNING id INTO _existing;

  -- Increment campaign totals on the right table
  _table := CASE _campaign_type
    WHEN 'medical' THEN 'medical_campaigns'
    WHEN 'dream'   THEN 'dream_campaigns'
    WHEN 'hero'    THEN 'hero_campaigns'
    WHEN 'pet'     THEN 'pet_rescue_campaigns'
    WHEN 'student' THEN 'student_campaigns'
    WHEN 'crisis'  THEN 'crisis_campaigns'
    WHEN 'talent'  THEN 'talent_campaigns'
  END;

  IF _campaign_type = 'medical' THEN
    EXECUTE format(
      'UPDATE public.%I SET current_amount = COALESCE(current_amount,0) + $1, %I = COALESCE(%I,0) + 1 WHERE id = $2',
      _table,
      CASE WHEN _is_monthly THEN 'monthly_donors_count' ELSE 'one_time_donors_count' END,
      CASE WHEN _is_monthly THEN 'monthly_donors_count' ELSE 'one_time_donors_count' END
    ) USING _net, _campaign_id;
  ELSE
    -- Other tables use supporters_count
    EXECUTE format(
      'UPDATE public.%I SET current_amount = COALESCE(current_amount,0) + $1, supporters_count = COALESCE(supporters_count,0) + 1 WHERE id = $2',
      _table
    ) USING _net, _campaign_id;
  END IF;

  RETURN jsonb_build_object(
    'status','recorded',
    'donation_id', _existing,
    'platform_fee', _fee,
    'net_amount', _net
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_campaign_donation(uuid,text,uuid,text,text,numeric,boolean,boolean,text,text) TO service_role;
