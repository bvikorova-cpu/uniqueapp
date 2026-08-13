-- 1) Add module dimension to ownership
ALTER TABLE public.battle_cosmetics_owned
  ADD COLUMN IF NOT EXISTS module text NOT NULL DEFAULT 'kitchenstars';

-- Backfill module from the coin ledger entry of the purchase, when available
UPDATE public.battle_cosmetics_owned o
SET module = l.module
FROM public.battle_coins_ledger l
WHERE l.user_id = o.user_id
  AND l.ref_id = o.cosmetic_id
  AND l.reason = 'cosmetic_purchase'
  AND l.module IN ('kitchenstars','reel_battles','megatalent')
  AND o.module <> l.module;

ALTER TABLE public.battle_cosmetics_owned
  ADD CONSTRAINT battle_cosmetics_owned_module_check
  CHECK (module IN ('kitchenstars','reel_battles','megatalent'));

-- Replace old uniqueness (user + cosmetic) with (user + cosmetic + module)
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT c.conname
    FROM pg_constraint c
    WHERE c.conrelid = 'public.battle_cosmetics_owned'::regclass
      AND c.contype = 'u'
  LOOP
    EXECUTE format('ALTER TABLE public.battle_cosmetics_owned DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

DROP INDEX IF EXISTS battle_cosmetics_owned_user_id_cosmetic_id_idx;
DROP INDEX IF EXISTS battle_cosmetics_owned_user_cosmetic_key;

CREATE UNIQUE INDEX IF NOT EXISTS battle_cosmetics_owned_user_cosmetic_module_key
  ON public.battle_cosmetics_owned (user_id, cosmetic_id, module);

CREATE INDEX IF NOT EXISTS battle_cosmetics_owned_user_module_idx
  ON public.battle_cosmetics_owned (user_id, module);

-- 2) Purchases are per module
CREATE OR REPLACE FUNCTION public.purchase_battle_cosmetic(_code text, _module text DEFAULT 'kitchenstars'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_item public.battle_cosmetics%ROWTYPE;
  v_balance integer;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF _module NOT IN ('kitchenstars','reel_battles','megatalent') THEN RAISE EXCEPTION 'INVALID_MODULE'; END IF;
  SELECT * INTO v_item FROM public.battle_cosmetics WHERE code = _code AND is_active;
  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
  IF EXISTS (
    SELECT 1 FROM public.battle_cosmetics_owned
    WHERE user_id = v_user_id AND cosmetic_id = v_item.id AND module = _module
  ) THEN
    RAISE EXCEPTION 'ALREADY_OWNED';
  END IF;

  v_balance := public.battle_coins_apply(v_user_id, _module, -v_item.price_coins, 'cosmetic_purchase', 'battle_shop', v_item.id);

  INSERT INTO public.battle_cosmetics_owned (user_id, cosmetic_id, module)
  VALUES (v_user_id, v_item.id, _module);

  RETURN jsonb_build_object('success', true, 'code', v_item.code, 'module', _module, 'coin_balance', v_balance);
END; $function$;

-- 3) Equip / unequip are per module
DROP FUNCTION IF EXISTS public.equip_battle_cosmetic(text, boolean);

CREATE OR REPLACE FUNCTION public.equip_battle_cosmetic(_code text, _equip boolean DEFAULT true, _module text DEFAULT 'kitchenstars'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid := auth.uid();
  v_item public.battle_cosmetics%ROWTYPE;
BEGIN
  IF v_user_id IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  IF _module NOT IN ('kitchenstars','reel_battles','megatalent') THEN RAISE EXCEPTION 'INVALID_MODULE'; END IF;
  SELECT * INTO v_item FROM public.battle_cosmetics WHERE code = _code;
  IF NOT FOUND THEN RAISE EXCEPTION 'ITEM_NOT_FOUND'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.battle_cosmetics_owned
    WHERE user_id = v_user_id AND cosmetic_id = v_item.id AND module = _module
  ) THEN
    RAISE EXCEPTION 'NOT_OWNED';
  END IF;

  IF _equip THEN
    UPDATE public.battle_cosmetics_owned o
    SET is_equipped = false, updated_at = now()
    WHERE o.user_id = v_user_id AND o.module = _module AND o.is_equipped
      AND o.cosmetic_id IN (SELECT id FROM public.battle_cosmetics WHERE kind = v_item.kind);
  END IF;

  UPDATE public.battle_cosmetics_owned
  SET is_equipped = _equip, updated_at = now()
  WHERE user_id = v_user_id AND cosmetic_id = v_item.id AND module = _module;

  RETURN jsonb_build_object('success', true, 'code', v_item.code, 'module', _module, 'equipped', _equip);
END; $function$;

-- 4) Public lookup is per module
DROP FUNCTION IF EXISTS public.get_equipped_battle_cosmetics(uuid[]);

CREATE OR REPLACE FUNCTION public.get_equipped_battle_cosmetics(_user_ids uuid[], _module text DEFAULT 'kitchenstars'::text)
RETURNS TABLE(user_id uuid, kind text, code text, name text, preview text, css_class text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT o.user_id, c.kind, c.code, c.name, c.preview, c.css_class
  FROM public.battle_cosmetics_owned o
  JOIN public.battle_cosmetics c ON c.id = o.cosmetic_id
  WHERE o.is_equipped = true
    AND o.module = _module
    AND o.user_id = ANY(_user_ids)
$function$;

GRANT EXECUTE ON FUNCTION public.get_equipped_battle_cosmetics(uuid[], text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.equip_battle_cosmetic(text, boolean, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.purchase_battle_cosmetic(text, text) TO authenticated, service_role;