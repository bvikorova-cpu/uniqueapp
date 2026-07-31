CREATE OR REPLACE FUNCTION public.finalize_stock_content_sale(p_session_id text DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_rec record;
  v_item record;
  v_total numeric;
  v_asset numeric;
  v_creator numeric;
  v_fee numeric;
  v_count integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RETURN 0;
  END IF;

  FOR v_rec IN
    SELECT id, user_id, metadata, amount_cents, stripe_session_id, stripe_payment_intent_id
    FROM public.payment_records
    WHERE product_type = 'stock_content_purchase'
      AND status = 'paid'
      AND verified_at IS NOT NULL
      AND user_id = v_uid
      AND (p_session_id IS NULL OR stripe_session_id = p_session_id)
  LOOP
    IF (v_rec.metadata->>'content_id') IS NULL THEN
      CONTINUE;
    END IF;

    SELECT id, title, creator_id, total_revenue_eur, price_eur INTO v_item
    FROM public.stock_content_items
    WHERE id = (v_rec.metadata->>'content_id')::uuid;

    IF v_item.id IS NULL THEN
      CONTINUE;
    END IF;

    IF EXISTS (
      SELECT 1 FROM public.stock_content_sales
      WHERE buyer_id = v_rec.user_id AND content_id = v_item.id
    ) THEN
      CONTINUE;
    END IF;

    v_total := COALESCE(NULLIF(v_rec.metadata->>'total_eur','')::numeric, COALESCE(v_rec.amount_cents,0)/100.0);
    -- Only the asset price is shared with the seller; the license fee is platform revenue
    v_asset := COALESCE(NULLIF(v_rec.metadata->>'asset_price_eur','')::numeric, COALESCE(v_item.price_eur, v_total));
    v_asset := LEAST(GREATEST(v_asset, 0), v_total);
    v_creator := round(v_asset * 0.7, 2);
    v_fee := round(v_total - v_creator, 2);

    INSERT INTO public.stock_content_sales (
      content_id, creator_id, buyer_id, license_type, resolution,
      amount_paid, creator_earning, platform_fee, status,
      stripe_payment_intent_id, stripe_session_id
    ) VALUES (
      v_item.id, v_item.creator_id, v_rec.user_id,
      COALESCE(v_rec.metadata->>'license_type','standard'),
      COALESCE(v_rec.metadata->>'resolution','original'),
      v_total, v_creator, v_fee, 'completed',
      v_rec.stripe_payment_intent_id, v_rec.stripe_session_id
    );

    UPDATE public.stock_content_items
    SET total_revenue_eur = COALESCE(total_revenue_eur,0) + v_total
    WHERE id = v_item.id;

    IF v_item.creator_id IS NOT NULL THEN
      IF EXISTS (SELECT 1 FROM public.wallet_balances WHERE user_id = v_item.creator_id AND currency = 'EUR') THEN
        UPDATE public.wallet_balances
        SET balance = COALESCE(balance,0) + v_creator, updated_at = now()
        WHERE user_id = v_item.creator_id AND currency = 'EUR';
      ELSE
        INSERT INTO public.wallet_balances (user_id, currency, balance)
        VALUES (v_item.creator_id, 'EUR', v_creator);
      END IF;

      INSERT INTO public.notifications (user_id, type, title, message, action_url, related_id, metadata)
      VALUES (
        v_item.creator_id,
        'stock_content_sale',
        'Your content was sold! 🎉',
        '"' || COALESCE(v_item.title,'Your asset') || '" sold for €' || to_char(v_total,'FM999999990.00')
          || ' — €' || to_char(v_creator,'FM999999990.00') || ' (70% of the asset price) was added to your wallet.',
        '/stock-content-library',
        v_item.id,
        jsonb_build_object('content_id', v_item.id, 'amount_paid', v_total, 'asset_price', v_asset, 'creator_earning', v_creator)
      );
    END IF;

    v_count := v_count + 1;
  END LOOP;

  RETURN v_count;
END;
$$;