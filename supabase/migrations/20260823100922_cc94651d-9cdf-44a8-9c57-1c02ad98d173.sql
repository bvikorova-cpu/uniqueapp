ALTER TABLE public.rewards_cosmetic_items ADD COLUMN IF NOT EXISTS price_credits integer;

-- Every item gets both prices: XP or AI credits. No EUR pricing anymore.
UPDATE public.rewards_cosmetic_items
SET price_xp = COALESCE(price_xp, GREATEST(300, ROUND(COALESCE(price_eur,1) * 1000)::int)),
    price_eur = NULL;

UPDATE public.rewards_cosmetic_items
SET price_credits = GREATEST(1, CEIL(price_xp::numeric / 1000)::int)
WHERE price_credits IS NULL;

CREATE OR REPLACE FUNCTION public.acquire_cosmetic_item(_item_id uuid, _pay_with text DEFAULT 'xp')
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _item record;
  _avail int;
  _exists int;
  _spend jsonb;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;

  SELECT * INTO _item FROM rewards_cosmetic_items WHERE id = _item_id;
  IF _item IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'item_not_found'); END IF;

  SELECT count(*) INTO _exists FROM user_rewards_cosmetics
    WHERE user_id = _uid AND item_id = _item_id;
  IF _exists > 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'already_owned'); END IF;

  IF _pay_with = 'credits' THEN
    IF COALESCE(_item.price_credits, 0) <= 0 THEN
      RETURN jsonb_build_object('ok', false, 'error', 'no_credit_price');
    END IF;
    _spend := public.spend_ai_credits(_item.price_credits, 'cosmetic:' || _item.slug, 'rewards_cosmetics');
    IF NOT COALESCE((_spend->>'ok')::boolean, false) THEN
      RETURN jsonb_build_object('ok', false, 'error', COALESCE(_spend->>'error', 'insufficient_credits'));
    END IF;
  ELSE
    IF COALESCE(_item.price_xp, 0) > 0 THEN
      SELECT GREATEST(0, COALESCE(total_xp,0) - COALESCE(locked_xp,0)) INTO _avail
        FROM user_xp WHERE user_id = _uid;
      IF COALESCE(_avail, 0) < _item.price_xp THEN
        RETURN jsonb_build_object('ok', false, 'error', 'insufficient_xp');
      END IF;
      UPDATE user_xp SET total_xp = total_xp - _item.price_xp, updated_at = now()
        WHERE user_id = _uid;
    END IF;
  END IF;

  INSERT INTO user_rewards_cosmetics (user_id, item_id) VALUES (_uid, _item_id);
  INSERT INTO reward_audit_log (user_id, source, reward_type, reward_value, reference_id, metadata)
  VALUES (_uid, 'cosmetic', 'cosmetic_item', 1, _item_id::text,
    jsonb_build_object('category', _item.category, 'rarity', _item.rarity,
      'paid_with', _pay_with, 'price_xp', _item.price_xp, 'price_credits', _item.price_credits));

  RETURN jsonb_build_object('ok', true, 'item_id', _item_id, 'paid_with', _pay_with);
END $$;