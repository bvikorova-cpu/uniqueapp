
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
BEGIN
  -- Lock the escrow row
  SELECT * INTO _escrow FROM public.campaign_escrow WHERE id = _escrow_id FOR UPDATE;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'not_found');
  END IF;

  IF _escrow.status <> 'held' THEN
    RETURN jsonb_build_object('error', 'invalid_status', 'status', _escrow.status);
  END IF;

  -- Authorization (skip if _actor is NULL = system/cron)
  IF _actor IS NOT NULL THEN
    SELECT public.has_role(_actor, 'admin'::app_role) INTO _is_admin;
    IF NOT _is_admin AND _escrow.brand_user_id <> _actor THEN
      RETURN jsonb_build_object('error', 'forbidden');
    END IF;
  END IF;

  _gross_eur := _escrow.amount_cents / 100.0;
  _fee_eur   := _escrow.platform_fee_cents / 100.0;
  _net_eur   := _escrow.net_cents / 100.0;

  -- Insert earnings
  INSERT INTO public.influencer_earnings(
    influencer_id, user_id, amount, platform_fee, net_amount, source
  ) VALUES (
    _escrow.influencer_id, _escrow.influencer_user_id,
    _gross_eur, _fee_eur, _net_eur, 'brand_campaign'
  );

  -- Update or insert balance
  INSERT INTO public.influencer_balances(influencer_id, total_earned, withdrawn, pending_withdrawal)
  VALUES (_escrow.influencer_id, _net_eur, 0, 0)
  ON CONFLICT (influencer_id)
  DO UPDATE SET
    total_earned = public.influencer_balances.total_earned + _net_eur,
    updated_at = now();

  -- Flip escrow status
  UPDATE public.campaign_escrow
     SET status = 'released',
         released_at = now(),
         released_by = _actor
   WHERE id = _escrow_id;

  -- Flip application
  UPDATE public.campaign_applications
     SET payment_status = 'released'
   WHERE id = _escrow.application_id;

  RETURN jsonb_build_object('success', true, 'net_eur', _net_eur);
END;
$$;

REVOKE ALL ON FUNCTION public.release_brand_campaign_escrow(uuid, uuid) FROM public;
GRANT EXECUTE ON FUNCTION public.release_brand_campaign_escrow(uuid, uuid) TO service_role;

-- Auto-release cron: held > 14 days
CREATE OR REPLACE FUNCTION public.auto_release_stale_brand_escrows()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _row record;
  _count int := 0;
BEGIN
  FOR _row IN
    SELECT id FROM public.campaign_escrow
    WHERE status = 'held'
      AND created_at < now() - interval '14 days'
    LIMIT 200
  LOOP
    PERFORM public.release_brand_campaign_escrow(_row.id, NULL);
    _count := _count + 1;
  END LOOP;
  RETURN _count;
END;
$$;

REVOKE ALL ON FUNCTION public.auto_release_stale_brand_escrows() FROM public;

-- Schedule cron (idempotent)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.unschedule('brand-escrow-auto-release');
    PERFORM cron.schedule(
      'brand-escrow-auto-release',
      '0 4 * * *',
      $cron$ SELECT public.auto_release_stale_brand_escrows(); $cron$
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- unschedule fails if not exists; ignore
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    PERFORM cron.schedule(
      'brand-escrow-auto-release',
      '0 4 * * *',
      $cron$ SELECT public.auto_release_stale_brand_escrows(); $cron$
    );
  END IF;
END $$;
