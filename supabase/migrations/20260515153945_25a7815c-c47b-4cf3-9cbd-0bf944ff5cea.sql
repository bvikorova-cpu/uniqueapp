
-- Reward audit log
CREATE TABLE IF NOT EXISTS public.reward_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source text NOT NULL,
  reward_type text NOT NULL,
  reward_value numeric NOT NULL DEFAULT 0,
  reference_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_reward_audit_user ON public.reward_audit_log(user_id, created_at DESC);
ALTER TABLE public.reward_audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users view own reward audit" ON public.reward_audit_log;
CREATE POLICY "Users view own reward audit" ON public.reward_audit_log
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins view all reward audit" ON public.reward_audit_log;
CREATE POLICY "Admins view all reward audit" ON public.reward_audit_log
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Helper: grant XP and log
CREATE OR REPLACE FUNCTION public._grant_xp_and_log(
  _user_id uuid, _xp int, _source text, _ref text, _meta jsonb
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO user_points (user_id, total_points, current_level_points, level)
  VALUES (_user_id, _xp, _xp, 1)
  ON CONFLICT (user_id) DO UPDATE
    SET total_points = user_points.total_points + EXCLUDED.total_points,
        current_level_points = user_points.current_level_points + EXCLUDED.current_level_points;
  INSERT INTO reward_audit_log (user_id, source, reward_type, reward_value, reference_id, metadata)
  VALUES (_user_id, _source, 'xp', _xp, _ref, COALESCE(_meta, '{}'::jsonb));
END $$;

-- Battle Pass claim
CREATE OR REPLACE FUNCTION public.claim_battle_pass_reward(_season_id uuid, _tier int, _track text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _season record;
  _reward record;
  _prog record;
  _exists int;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;
  IF _track NOT IN ('free','premium') THEN RETURN jsonb_build_object('ok', false, 'error', 'invalid_track'); END IF;

  SELECT * INTO _season FROM battle_pass_seasons WHERE id = _season_id AND is_active = true;
  IF _season IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'season_inactive'); END IF;

  SELECT * INTO _reward FROM battle_pass_rewards
    WHERE season_id = _season_id AND tier = _tier AND track = _track LIMIT 1;
  IF _reward IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'reward_not_found'); END IF;

  SELECT * INTO _prog FROM user_battle_pass WHERE user_id = _uid AND season_id = _season_id;
  IF _prog IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'no_progress'); END IF;
  IF _track = 'premium' AND COALESCE(_prog.has_premium, false) = false THEN
    RETURN jsonb_build_object('ok', false, 'error', 'premium_required');
  END IF;
  IF _tier > COALESCE(_prog.current_tier, 0) THEN
    RETURN jsonb_build_object('ok', false, 'error', 'tier_locked');
  END IF;

  SELECT count(*) INTO _exists FROM user_battle_pass_claims
    WHERE user_id = _uid AND season_id = _season_id AND tier = _tier AND track = _track;
  IF _exists > 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'already_claimed'); END IF;

  INSERT INTO user_battle_pass_claims (user_id, season_id, tier, track)
  VALUES (_uid, _season_id, _tier, _track);

  IF _reward.reward_type = 'xp' THEN
    PERFORM _grant_xp_and_log(_uid, _reward.reward_value::int, 'battle_pass',
      _season_id::text || ':' || _tier || ':' || _track,
      jsonb_build_object('tier', _tier, 'track', _track));
  ELSE
    INSERT INTO reward_audit_log (user_id, source, reward_type, reward_value, reference_id, metadata)
    VALUES (_uid, 'battle_pass', _reward.reward_type, _reward.reward_value,
      _season_id::text || ':' || _tier || ':' || _track,
      jsonb_build_object('tier', _tier, 'track', _track));
  END IF;

  RETURN jsonb_build_object('ok', true, 'reward_type', _reward.reward_type, 'reward_value', _reward.reward_value);
END $$;

-- Login calendar claim
CREATE OR REPLACE FUNCTION public.claim_calendar_day(_month_key text, _day_number int)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _tpl record;
  _today int;
  _today_mkey text;
  _exists int;
  _rtype text;
  _rvalue numeric;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;

  _today := EXTRACT(DAY FROM now())::int;
  _today_mkey := to_char(now(), 'YYYY-MM');
  IF _month_key <> _today_mkey OR _day_number <> _today THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_today');
  END IF;

  SELECT count(*) INTO _exists FROM user_calendar_claims
    WHERE user_id = _uid AND month_key = _month_key AND day_number = _day_number;
  IF _exists > 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'already_claimed'); END IF;

  SELECT reward_type, reward_value INTO _tpl FROM login_calendar_templates
    WHERE month_key = _month_key AND day_number = _day_number LIMIT 1;
  IF _tpl IS NULL THEN
    _rtype := 'xp';
    _rvalue := 25 + (_day_number * 5);
  ELSE
    _rtype := _tpl.reward_type;
    _rvalue := _tpl.reward_value;
  END IF;

  INSERT INTO user_calendar_claims (user_id, month_key, day_number, reward_type, reward_value)
  VALUES (_uid, _month_key, _day_number, _rtype, _rvalue);

  IF _rtype = 'xp' THEN
    PERFORM _grant_xp_and_log(_uid, _rvalue::int, 'login_calendar',
      _month_key || ':' || _day_number,
      jsonb_build_object('day', _day_number, 'month', _month_key));
  ELSE
    INSERT INTO reward_audit_log (user_id, source, reward_type, reward_value, reference_id, metadata)
    VALUES (_uid, 'login_calendar', _rtype, _rvalue, _month_key || ':' || _day_number,
      jsonb_build_object('day', _day_number, 'month', _month_key));
  END IF;

  RETURN jsonb_build_object('ok', true, 'reward_type', _rtype, 'reward_value', _rvalue);
END $$;

-- Cosmetic acquire (XP-based; EUR purchases stay through Stripe edge function)
CREATE OR REPLACE FUNCTION public.acquire_cosmetic_item(_item_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _uid uuid := auth.uid();
  _item record;
  _pts int;
  _exists int;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'unauthenticated'); END IF;

  SELECT * INTO _item FROM rewards_cosmetic_items WHERE id = _item_id;
  IF _item IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'item_not_found'); END IF;

  SELECT count(*) INTO _exists FROM user_rewards_cosmetics
    WHERE user_id = _uid AND item_id = _item_id;
  IF _exists > 0 THEN RETURN jsonb_build_object('ok', false, 'error', 'already_owned'); END IF;

  IF COALESCE(_item.price_eur, 0) > 0 THEN
    RETURN jsonb_build_object('ok', false, 'error', 'use_stripe_checkout');
  END IF;

  IF COALESCE(_item.price_xp, 0) > 0 THEN
    SELECT total_points INTO _pts FROM user_points WHERE user_id = _uid;
    IF COALESCE(_pts, 0) < _item.price_xp THEN
      RETURN jsonb_build_object('ok', false, 'error', 'insufficient_xp');
    END IF;
    UPDATE user_points
      SET total_points = total_points - _item.price_xp
      WHERE user_id = _uid;
  END IF;

  INSERT INTO user_rewards_cosmetics (user_id, item_id) VALUES (_uid, _item_id);
  INSERT INTO reward_audit_log (user_id, source, reward_type, reward_value, reference_id, metadata)
  VALUES (_uid, 'cosmetic', 'cosmetic_item', 1, _item_id::text,
    jsonb_build_object('category', _item.category, 'rarity', _item.rarity, 'price_xp', _item.price_xp));

  RETURN jsonb_build_object('ok', true, 'item_id', _item_id);
END $$;
