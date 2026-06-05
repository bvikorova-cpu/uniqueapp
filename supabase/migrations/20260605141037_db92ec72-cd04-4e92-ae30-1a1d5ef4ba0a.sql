
CREATE OR REPLACE FUNCTION public.release_brand_campaign_escrow(_escrow_id uuid, _actor uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _escrow record;
  _is_admin boolean;
  _net_eur numeric;
  _fee_eur numeric;
  _gross_eur numeric;
  _actor_label text;
BEGIN
  SELECT * INTO _escrow FROM public.campaign_escrow WHERE id = _escrow_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  IF _escrow.status <> 'held' THEN
    RETURN jsonb_build_object('error', 'invalid_status', 'status', _escrow.status);
  END IF;

  IF _actor IS NOT NULL THEN
    SELECT public.has_role(_actor, 'admin'::app_role) INTO _is_admin;
    IF NOT _is_admin AND _escrow.brand_user_id <> _actor THEN
      RETURN jsonb_build_object('error', 'forbidden');
    END IF;
    _actor_label := 'released by ' || _actor::text;
  ELSE
    _actor_label := 'auto-released after 14d';
  END IF;

  _gross_eur := _escrow.amount_cents / 100.0;
  _fee_eur   := _escrow.platform_fee_cents / 100.0;
  _net_eur   := _escrow.net_cents / 100.0;

  INSERT INTO public.influencer_earnings(
    influencer_id, user_id, amount, platform_fee, net_amount, source
  ) VALUES (
    _escrow.influencer_id, _escrow.influencer_user_id,
    _gross_eur, _fee_eur, _net_eur, 'brand_campaign'
  );

  INSERT INTO public.influencer_balances(influencer_id, total_earned, withdrawn, pending_withdrawal)
  VALUES (_escrow.influencer_id, _net_eur, 0, 0)
  ON CONFLICT (influencer_id)
  DO UPDATE SET
    total_earned = public.influencer_balances.total_earned + _net_eur,
    updated_at = now();

  UPDATE public.campaign_escrow
     SET status = 'released',
         released_at = now(),
         release_note = COALESCE(release_note, _actor_label)
   WHERE id = _escrow_id;

  UPDATE public.campaign_applications
     SET payment_status = 'released'
   WHERE id = _escrow.application_id;

  RETURN jsonb_build_object('success', true, 'net_eur', _net_eur);
END;
$$;
