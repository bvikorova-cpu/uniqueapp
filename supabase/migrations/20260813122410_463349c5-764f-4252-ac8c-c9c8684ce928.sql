-- ============ 1. WALLET ============
CREATE TABLE public.battle_coins (
  user_id uuid PRIMARY KEY,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  total_purchased integer NOT NULL DEFAULT 0,
  total_earned integer NOT NULL DEFAULT 0,
  total_spent integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.battle_coins TO authenticated;
GRANT ALL ON public.battle_coins TO service_role;
ALTER TABLE public.battle_coins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own wallet read" ON public.battle_coins FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.battle_coins_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  balance_before integer NOT NULL,
  balance_after integer NOT NULL,
  reason text NOT NULL DEFAULT 'unknown',
  source text,
  ref_id uuid,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.battle_coins_ledger TO authenticated;
GRANT ALL ON public.battle_coins_ledger TO service_role;
ALTER TABLE public.battle_coins_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ledger read" ON public.battle_coins_ledger FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE INDEX idx_battle_coins_ledger_user ON public.battle_coins_ledger (user_id, created_at DESC);

CREATE TRIGGER trg_battle_coins_updated_at
BEFORE UPDATE ON public.battle_coins
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 2. COSMETICS ============
CREATE TABLE public.battle_cosmetics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  kind text NOT NULL CHECK (kind IN ('frame','sticker','badge')),
  price_coins integer NOT NULL CHECK (price_coins > 0),
  rarity text NOT NULL DEFAULT 'common' CHECK (rarity IN ('common','rare','epic','legendary')),
  preview text,
  css_class text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.battle_cosmetics TO anon;
GRANT SELECT ON public.battle_cosmetics TO authenticated;
GRANT ALL ON public.battle_cosmetics TO service_role;
ALTER TABLE public.battle_cosmetics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalog is public" ON public.battle_cosmetics FOR SELECT USING (is_active);
CREATE POLICY "admins manage catalog" ON public.battle_cosmetics FOR ALL TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER trg_battle_cosmetics_updated_at
BEFORE UPDATE ON public.battle_cosmetics
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.battle_cosmetics_owned (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  cosmetic_id uuid NOT NULL REFERENCES public.battle_cosmetics(id) ON DELETE CASCADE,
  is_equipped boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, cosmetic_id)
);
GRANT SELECT, UPDATE ON public.battle_cosmetics_owned TO authenticated;
GRANT ALL ON public.battle_cosmetics_owned TO service_role;
ALTER TABLE public.battle_cosmetics_owned ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cosmetics read" ON public.battle_cosmetics_owned FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "own cosmetics equip" ON public.battle_cosmetics_owned FOR UPDATE TO authenticated
  USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TRIGGER trg_battle_cosmetics_owned_updated_at
BEFORE UPDATE ON public.battle_cosmetics_owned
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ 3. CORE HELPERS ============
CREATE OR REPLACE FUNCTION public.battle_coins_apply(
  _user_id uuid, _delta integer, _reason text, _source text DEFAULT NULL, _ref_id uuid DEFAULT NULL
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_before integer; v_after integer;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  INSERT INTO public.battle_coins (user_id, balance) VALUES (_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT balance INTO v_before FROM public.battle_coins WHERE user_id = _user_id FOR UPDATE;
  v_after := v_before + _delta;
  IF v_after < 0 THEN RAISE EXCEPTION 'INSUFFICIENT_COINS'; END IF;

  UPDATE public.battle_coins
  SET balance = v_after,
      total_earned = total_earned + GREATEST(_delta, 0),
      total_spent = total_spent + GREATEST(-_delta, 0),
      total_purchased = total_purchased + CASE WHEN _reason = 'credits_exchange' THEN _delta ELSE 0 END,
      updated_at = now()
  WHERE user_id = _user_id;

  INSERT INTO public.battle_coins_ledger (user_id, delta, balance_before, balance_after, reason, source, ref_id)
  VALUES (_user_id, _delta, v_before, v_after, _reason, _source, _ref_id);

  RETURN v_after;
END; $$;
REVOKE ALL ON FUNCTION public.battle_coins_apply(uuid, integer, text, text, uuid) FROM PUBLIC;

-- 1 AI credit = 100 Battle Coins, one-way only.
CREATE OR REPLACE FUNCTION public.exchange_credits_for_battle_coins(_credits integer)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_before integer; v_coins integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF _credits IS NULL OR _credits < 1 OR _credits > 500 THEN RAISE EXCEPTION 'INVALID_AMOUNT'; END IF;

  INSERT INTO public.ai_credits (user_id, credits_remaining) VALUES (v_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT credits_remaining INTO v_before FROM public.ai_credits WHERE user_id = v_user_id FOR UPDATE;
  IF COALESCE(v_before, 0) < _credits THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;

  PERFORM set_config('app.credit_reason', 'battle_coins_exchange', true);
  PERFORM set_config('app.credit_source', 'battle_coins', true);

  UPDATE public.ai_credits
  SET credits_remaining = v_before - _credits, last_used_at = now(), updated_at = now()
  WHERE user_id = v_user_id;

  INSERT INTO public.ai_usage_history (user_id, usage_type, credits_used, description)
  VALUES (v_user_id, 'custom_generation', _credits, 'battle_coins:exchange');

  v_coins := public.battle_coins_apply(v_user_id, _credits * 100, 'credits_exchange', 'battle_coins');

  RETURN jsonb_build_object('success', true, 'credits_spent', _credits,
    'coins_received', _credits * 100, 'coin_balance', v_coins, 'credit_balance', v_before - _credits);
END; $$;
GRANT EXECUTE ON FUNCTION public.exchange_credits_for_battle_coins(integer) TO authenticated;

CREATE OR REPLACE FUNCTION public.purchase_battle_cosmetic(_code text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_item public.battle_cosmetics%ROWTYPE;
  v_balance integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT * INTO v_item FROM public.battle_cosmetics WHERE code = _code AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
  IF EXISTS (SELECT 1 FROM public.battle_cosmetics_owned WHERE user_id = v_user_id AND cosmetic_id = v_item.id) THEN
    RAISE EXCEPTION 'ALREADY_OWNED';
  END IF;

  v_balance := public.battle_coins_apply(v_user_id, -v_item.price_coins, 'cosmetic_purchase', 'battle_shop', v_item.id);

  INSERT INTO public.battle_cosmetics_owned (user_id, cosmetic_id) VALUES (v_user_id, v_item.id);

  RETURN jsonb_build_object('success', true, 'code', v_item.code, 'coin_balance', v_balance);
END; $$;
GRANT EXECUTE ON FUNCTION public.purchase_battle_cosmetic(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.equip_battle_cosmetic(_code text, _equip boolean DEFAULT true)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_item public.battle_cosmetics%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT * INTO v_item FROM public.battle_cosmetics WHERE code = _code;
  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.battle_cosmetics_owned WHERE user_id = v_user_id AND cosmetic_id = v_item.id) THEN
    RAISE EXCEPTION 'NOT_OWNED';
  END IF;

  IF _equip THEN
    UPDATE public.battle_cosmetics_owned o
    SET is_equipped = false, updated_at = now()
    WHERE o.user_id = v_user_id AND o.is_equipped
      AND o.cosmetic_id IN (SELECT id FROM public.battle_cosmetics WHERE kind = v_item.kind);
  END IF;

  UPDATE public.battle_cosmetics_owned
  SET is_equipped = _equip, updated_at = now()
  WHERE user_id = v_user_id AND cosmetic_id = v_item.id;

  RETURN jsonb_build_object('success', true, 'code', v_item.code, 'equipped', _equip);
END; $$;
GRANT EXECUTE ON FUNCTION public.equip_battle_cosmetic(text, boolean) TO authenticated;

-- ============ 4. ENTRY FEES NOW IN COINS (500) ============
CREATE OR REPLACE FUNCTION public.enter_kitchen_competition(
  _battle_id uuid, _dish_title text, _description text, _video_url text, _media_size bigint, _media_mime text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_battle public.kitchen_battles%ROWTYPE;
  v_participant_id uuid;
  v_balance_after integer;
  v_participant_count integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF length(trim(COALESCE(_dish_title, ''))) < 1 OR length(_dish_title) > 120 THEN RAISE EXCEPTION 'INVALID_DISH_TITLE'; END IF;
  IF length(COALESCE(_description, '')) > 500 THEN RAISE EXCEPTION 'DESCRIPTION_TOO_LONG'; END IF;
  IF COALESCE(_video_url, '') = '' OR COALESCE(_media_mime, '') NOT IN ('video/mp4','video/webm','video/quicktime') THEN
    RAISE EXCEPTION 'VALID_VIDEO_REQUIRED';
  END IF;
  IF COALESCE(_media_size, 0) < 1 OR _media_size > 52428800 THEN RAISE EXCEPTION 'INVALID_VIDEO_SIZE'; END IF;

  SELECT * INTO v_battle FROM public.kitchen_battles WHERE id = _battle_id FOR UPDATE;
  IF NOT FOUND OR v_battle.status <> 'open' OR v_battle.deadline <= now() THEN RAISE EXCEPTION 'COMPETITION_NOT_OPEN'; END IF;
  IF EXISTS (SELECT 1 FROM public.kitchen_battle_participants WHERE battle_id = _battle_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'ALREADY_ENTERED';
  END IF;

  SELECT count(*) INTO v_participant_count FROM public.kitchen_battle_participants WHERE battle_id = _battle_id;
  IF v_participant_count >= 2 THEN RAISE EXCEPTION 'COMPETITION_FULL'; END IF;
  IF v_participant_count = 0 AND v_battle.created_by IS DISTINCT FROM v_user_id THEN RAISE EXCEPTION 'ONLY_CREATOR_CAN_SUBMIT_FIRST'; END IF;
  IF v_participant_count = 1 AND v_battle.created_by = v_user_id THEN RAISE EXCEPTION 'OPPONENT_MUST_BE_DIFFERENT_USER'; END IF;

  v_balance_after := public.battle_coins_apply(v_user_id, -500, 'battle_entry', 'kitchenstars', _battle_id);

  INSERT INTO public.kitchen_battle_participants (
    battle_id, user_id, dish_title, description, video_url, media_type, media_size, media_mime
  ) VALUES (
    _battle_id, v_user_id, trim(_dish_title), NULLIF(trim(COALESCE(_description, '')), ''),
    _video_url, 'video', _media_size, _media_mime
  ) RETURNING id INTO v_participant_id;

  UPDATE public.kitchen_battles SET prize_pool = 1000 WHERE id = _battle_id;

  RETURN jsonb_build_object('success', true, 'participant_id', v_participant_id,
    'coin_balance', v_balance_after, 'entry_cost', 500, 'prize_pool', 1000);
END; $$;

CREATE OR REPLACE FUNCTION public.enter_reel_competition(
  _battle_id uuid, _reel_title text, _description text, _video_url text, _media_size bigint, _media_mime text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_battle public.reel_battles%ROWTYPE;
  v_participant_id uuid;
  v_balance_after integer;
  v_participant_count integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF length(trim(COALESCE(_reel_title, ''))) < 1 OR length(_reel_title) > 120 THEN RAISE EXCEPTION 'INVALID_TITLE'; END IF;
  IF length(COALESCE(_description, '')) > 500 THEN RAISE EXCEPTION 'DESCRIPTION_TOO_LONG'; END IF;
  IF COALESCE(_video_url, '') = '' THEN RAISE EXCEPTION 'VALID_VIDEO_REQUIRED'; END IF;
  IF COALESCE(_media_size, 0) < 1 OR _media_size > 52428800 THEN RAISE EXCEPTION 'INVALID_VIDEO_SIZE'; END IF;

  SELECT * INTO v_battle FROM public.reel_battles WHERE id = _battle_id FOR UPDATE;
  IF NOT FOUND OR v_battle.status <> 'open' OR v_battle.deadline <= now() THEN RAISE EXCEPTION 'COMPETITION_NOT_OPEN'; END IF;
  IF EXISTS (SELECT 1 FROM public.reel_battle_participants WHERE battle_id = _battle_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'ALREADY_ENTERED';
  END IF;

  SELECT count(*) INTO v_participant_count FROM public.reel_battle_participants WHERE battle_id = _battle_id;
  IF v_participant_count >= 2 THEN RAISE EXCEPTION 'COMPETITION_FULL'; END IF;
  IF v_participant_count = 0 AND v_battle.created_by IS DISTINCT FROM v_user_id THEN RAISE EXCEPTION 'ONLY_CREATOR_CAN_SUBMIT_FIRST'; END IF;
  IF v_participant_count = 1 AND v_battle.created_by = v_user_id THEN RAISE EXCEPTION 'OPPONENT_MUST_BE_DIFFERENT_USER'; END IF;

  v_balance_after := public.battle_coins_apply(v_user_id, -500, 'battle_entry', 'reel_battles', _battle_id);

  INSERT INTO public.reel_battle_participants (
    battle_id, user_id, reel_title, description, video_url, media_type, media_size, media_mime
  ) VALUES (
    _battle_id, v_user_id, trim(_reel_title), NULLIF(trim(COALESCE(_description, '')), ''),
    _video_url, 'video', _media_size, _media_mime
  ) RETURNING id INTO v_participant_id;

  UPDATE public.reel_battles SET prize_pool = 1000 WHERE id = _battle_id;

  RETURN jsonb_build_object('success', true, 'participant_id', v_participant_id,
    'coin_balance', v_balance_after, 'entry_cost', 500, 'prize_pool', 1000);
END; $$;

-- ============ 5. SETTLEMENT PAYS COINS + XP ============
CREATE OR REPLACE FUNCTION public.settle_kitchen_competitions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_battle record; v_winner record; v_settled integer := 0;
BEGIN
  FOR v_battle IN
    SELECT id FROM public.kitchen_battles
    WHERE status = 'open' AND deadline <= now() AND winner_participant_id IS NULL
    ORDER BY deadline FOR UPDATE SKIP LOCKED
  LOOP
    SELECT id, user_id, vote_count INTO v_winner
    FROM public.kitchen_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC LIMIT 1;

    IF v_winner.id IS NULL THEN
      UPDATE public.kitchen_battles SET status = 'completed', prize_pool = 0 WHERE id = v_battle.id;
      CONTINUE;
    END IF;

    PERFORM public.battle_coins_apply(v_winner.user_id, 1000, 'battle_prize', 'kitchenstars', v_battle.id);

    INSERT INTO public.hub_xp (user_id, hub, xp) VALUES (v_winner.user_id, 'kitchenstars', 10)
    ON CONFLICT (user_id, hub) DO UPDATE SET xp = public.hub_xp.xp + 10, updated_at = now();

    INSERT INTO public.user_xp (user_id, total_xp) VALUES (v_winner.user_id, 10)
    ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + 10, updated_at = now();

    UPDATE public.kitchen_battles
    SET status = 'completed', winner_participant_id = v_winner.id, prize_pool = 1000
    WHERE id = v_battle.id AND winner_participant_id IS NULL;

    IF FOUND THEN v_settled := v_settled + 1; END IF;
  END LOOP;
  RETURN v_settled;
END; $$;

CREATE OR REPLACE FUNCTION public.settle_reel_competitions()
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE v_battle record; v_winner record; v_settled integer := 0;
BEGIN
  FOR v_battle IN
    SELECT id FROM public.reel_battles
    WHERE status = 'open' AND deadline <= now() AND winner_participant_id IS NULL
    ORDER BY deadline FOR UPDATE SKIP LOCKED
  LOOP
    SELECT id, user_id, vote_count INTO v_winner
    FROM public.reel_battle_participants
    WHERE battle_id = v_battle.id
    ORDER BY vote_count DESC, created_at ASC, id ASC LIMIT 1;

    IF v_winner.id IS NULL THEN
      UPDATE public.reel_battles SET status = 'completed', prize_pool = 0 WHERE id = v_battle.id;
      CONTINUE;
    END IF;

    PERFORM public.battle_coins_apply(v_winner.user_id, 1000, 'battle_prize', 'reel_battles', v_battle.id);

    INSERT INTO public.hub_xp (user_id, hub, xp) VALUES (v_winner.user_id, 'reel_battles', 10)
    ON CONFLICT (user_id, hub) DO UPDATE SET xp = public.hub_xp.xp + 10, updated_at = now();

    INSERT INTO public.user_xp (user_id, total_xp) VALUES (v_winner.user_id, 10)
    ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + 10, updated_at = now();

    UPDATE public.reel_battles
    SET status = 'completed', winner_participant_id = v_winner.id, prize_pool = 1000
    WHERE id = v_battle.id AND winner_participant_id IS NULL;

    IF FOUND THEN v_settled := v_settled + 1; END IF;
  END LOOP;
  RETURN v_settled;
END; $$;