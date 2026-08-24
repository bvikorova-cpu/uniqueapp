
-- 1) Separate credit wallet for the Unlock Videos section
CREATE TABLE IF NOT EXISTS public.video_credits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  credits_remaining integer NOT NULL DEFAULT 0,
  total_credits_purchased integer NOT NULL DEFAULT 0,
  last_used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.video_credits TO authenticated;
GRANT ALL ON public.video_credits TO service_role;
ALTER TABLE public.video_credits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "video_credits_select_own" ON public.video_credits;
CREATE POLICY "video_credits_select_own" ON public.video_credits
  FOR SELECT TO authenticated USING (user_id = auth.uid());
DROP POLICY IF EXISTS "video_credits_insert_own" ON public.video_credits;
CREATE POLICY "video_credits_insert_own" ON public.video_credits
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid() AND credits_remaining = 0);

CREATE TABLE IF NOT EXISTS public.video_credits_ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  delta integer NOT NULL,
  balance_before integer NOT NULL,
  balance_after integer NOT NULL,
  reason text NOT NULL DEFAULT 'unknown',
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.video_credits_ledger TO authenticated;
GRANT ALL ON public.video_credits_ledger TO service_role;
ALTER TABLE public.video_credits_ledger ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "video_credits_ledger_select_own" ON public.video_credits_ledger;
CREATE POLICY "video_credits_ledger_select_own" ON public.video_credits_ledger
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_video_credits_ledger_user ON public.video_credits_ledger(user_id, created_at DESC);

-- 2) Boost columns + history
ALTER TABLE public.premium_videos
  ADD COLUMN IF NOT EXISTS boost_tier text,
  ADD COLUMN IF NOT EXISTS boost_until timestamptz;

CREATE INDEX IF NOT EXISTS idx_premium_videos_boost ON public.premium_videos(boost_until DESC NULLS LAST);

CREATE TABLE IF NOT EXISTS public.premium_video_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  video_id uuid NOT NULL REFERENCES public.premium_videos(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  tier text NOT NULL,
  credits_spent integer NOT NULL,
  starts_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.premium_video_boosts TO anon, authenticated;
GRANT ALL ON public.premium_video_boosts TO service_role;
ALTER TABLE public.premium_video_boosts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "premium_video_boosts_public_read" ON public.premium_video_boosts;
CREATE POLICY "premium_video_boosts_public_read" ON public.premium_video_boosts
  FOR SELECT USING (true);

-- 3) Helper: add video credits (service/definer)
CREATE OR REPLACE FUNCTION public.add_video_credits(
  p_user_id uuid, p_amount integer, p_reason text DEFAULT 'topup', p_source text DEFAULT 'system'
) RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE _before integer; _after integer;
BEGIN
  IF p_amount IS NULL OR p_amount <= 0 THEN RETURN 0; END IF;

  INSERT INTO public.video_credits (user_id, credits_remaining, total_credits_purchased)
  VALUES (p_user_id, 0, 0)
  ON CONFLICT (user_id) DO NOTHING;

  SELECT credits_remaining INTO _before FROM public.video_credits WHERE user_id = p_user_id FOR UPDATE;
  _after := COALESCE(_before, 0) + p_amount;

  UPDATE public.video_credits
     SET credits_remaining = _after,
         total_credits_purchased = total_credits_purchased + CASE WHEN p_source ILIKE '%stripe%' OR p_reason ILIKE '%purchase%' THEN p_amount ELSE 0 END,
         updated_at = now()
   WHERE user_id = p_user_id;

  INSERT INTO public.video_credits_ledger (user_id, delta, balance_before, balance_after, reason, source)
  VALUES (p_user_id, p_amount, COALESCE(_before, 0), _after, COALESCE(p_reason, 'topup'), COALESCE(p_source, 'system'));

  RETURN _after;
END;
$$;
REVOKE ALL ON FUNCTION public.add_video_credits(uuid, integer, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.add_video_credits(uuid, integer, text, text) TO service_role;

-- 4) Unlock now uses the dedicated video wallet
CREATE OR REPLACE FUNCTION public.unlock_premium_video(_video_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _uid uuid := auth.uid();
  _cost integer;
  _owner uuid;
  _before integer;
  _pending numeric;
  _whole integer;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT unlock_cost, user_id INTO _cost, _owner
  FROM public.premium_videos WHERE id = _video_id AND is_published;
  IF _cost IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'video_not_found');
  END IF;

  IF _owner = _uid THEN
    RETURN jsonb_build_object('ok', true, 'already', true, 'owner', true);
  END IF;

  IF EXISTS (SELECT 1 FROM public.premium_video_unlocks WHERE video_id = _video_id AND user_id = _uid) THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  INSERT INTO public.video_credits (user_id) VALUES (_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT credits_remaining INTO _before FROM public.video_credits WHERE user_id = _uid FOR UPDATE;
  IF COALESCE(_before, 0) < _cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', COALESCE(_before, 0));
  END IF;

  UPDATE public.video_credits
     SET credits_remaining = _before - _cost, last_used_at = now(), updated_at = now()
   WHERE user_id = _uid;

  INSERT INTO public.video_credits_ledger (user_id, delta, balance_before, balance_after, reason, source)
  VALUES (_uid, -_cost, _before, _before - _cost, 'premium_video_unlock', 'unlock_videos');

  INSERT INTO public.premium_video_unlocks (video_id, user_id, credits_spent)
  VALUES (_video_id, _uid, _cost);

  UPDATE public.premium_videos SET unlocks_count = unlocks_count + 1 WHERE id = _video_id;

  INSERT INTO public.premium_video_creator_balance (user_id, pending_credits)
  VALUES (_owner, _cost * 0.5)
  ON CONFLICT (user_id) DO UPDATE
    SET pending_credits = public.premium_video_creator_balance.pending_credits + EXCLUDED.pending_credits,
        updated_at = now();

  SELECT pending_credits INTO _pending FROM public.premium_video_creator_balance WHERE user_id = _owner;
  _whole := floor(_pending)::int;
  IF _whole >= 1 THEN
    PERFORM public.add_video_credits(_owner, _whole, 'premium_video_earnings', 'unlock_videos');
    UPDATE public.premium_video_creator_balance
       SET pending_credits = _pending - _whole,
           credited_total = credited_total + _whole,
           updated_at = now()
     WHERE user_id = _owner;
  END IF;

  RETURN jsonb_build_object('ok', true, 'balance', _before - _cost);
END;
$$;

-- 5) Boost a video with video credits
CREATE OR REPLACE FUNCTION public.boost_premium_video(_video_id uuid, _tier text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  _uid uuid := auth.uid();
  _owner uuid;
  _cost integer;
  _hours integer;
  _before integer;
  _until timestamptz;
BEGIN
  IF _uid IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated'); END IF;

  CASE _tier
    WHEN 'quick' THEN _cost := 5;  _hours := 6;
    WHEN 'daily' THEN _cost := 12; _hours := 24;
    WHEN 'mega'  THEN _cost := 25; _hours := 72;
    ELSE RETURN jsonb_build_object('ok', false, 'error', 'invalid_tier');
  END CASE;

  SELECT user_id INTO _owner FROM public.premium_videos WHERE id = _video_id AND is_published;
  IF _owner IS NULL THEN RETURN jsonb_build_object('ok', false, 'error', 'video_not_found'); END IF;
  IF _owner <> _uid THEN RETURN jsonb_build_object('ok', false, 'error', 'not_owner'); END IF;

  INSERT INTO public.video_credits (user_id) VALUES (_uid) ON CONFLICT (user_id) DO NOTHING;
  SELECT credits_remaining INTO _before FROM public.video_credits WHERE user_id = _uid FOR UPDATE;
  IF COALESCE(_before, 0) < _cost THEN
    RETURN jsonb_build_object('ok', false, 'error', 'insufficient', 'balance', COALESCE(_before, 0), 'cost', _cost);
  END IF;

  UPDATE public.video_credits
     SET credits_remaining = _before - _cost, last_used_at = now(), updated_at = now()
   WHERE user_id = _uid;

  INSERT INTO public.video_credits_ledger (user_id, delta, balance_before, balance_after, reason, source)
  VALUES (_uid, -_cost, _before, _before - _cost, 'premium_video_boost_' || _tier, 'unlock_videos');

  _until := GREATEST(now(), COALESCE((SELECT boost_until FROM public.premium_videos WHERE id = _video_id), now()))
            + make_interval(hours => _hours);

  UPDATE public.premium_videos
     SET boost_tier = _tier, boost_until = _until
   WHERE id = _video_id;

  INSERT INTO public.premium_video_boosts (video_id, user_id, tier, credits_spent, expires_at)
  VALUES (_video_id, _uid, _tier, _cost, _until);

  RETURN jsonb_build_object('ok', true, 'tier', _tier, 'boost_until', _until, 'balance', _before - _cost);
END;
$$;

GRANT EXECUTE ON FUNCTION public.boost_premium_video(uuid, text) TO authenticated;
