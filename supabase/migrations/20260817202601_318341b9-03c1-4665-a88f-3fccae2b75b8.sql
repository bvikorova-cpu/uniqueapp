-- 1. Offerings: region, promotion, completed jobs
ALTER TABLE public.skill_offerings
  ADD COLUMN IF NOT EXISTS region text,
  ADD COLUMN IF NOT EXISTS featured_until timestamptz,
  ADD COLUMN IF NOT EXISTS premium_until timestamptz,
  ADD COLUMN IF NOT EXISTS completed_jobs integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_skill_offerings_promo
  ON public.skill_offerings (premium_until DESC NULLS LAST, featured_until DESC NULLS LAST, created_at DESC);

-- 2. Requests (demand side)
CREATE TABLE IF NOT EXISTS public.skill_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  category public.skill_category NOT NULL,
  region text,
  location text,
  budget_eur numeric,
  deadline date,
  is_open boolean NOT NULL DEFAULT true,
  bids_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.skill_requests TO authenticated;
GRANT ALL ON public.skill_requests TO service_role;
ALTER TABLE public.skill_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "skill_requests_select" ON public.skill_requests;
CREATE POLICY "skill_requests_select" ON public.skill_requests
  FOR SELECT TO authenticated USING (true);
DROP POLICY IF EXISTS "skill_requests_insert_own" ON public.skill_requests;
CREATE POLICY "skill_requests_insert_own" ON public.skill_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "skill_requests_update_own" ON public.skill_requests;
CREATE POLICY "skill_requests_update_own" ON public.skill_requests
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
DROP POLICY IF EXISTS "skill_requests_delete_own" ON public.skill_requests;
CREATE POLICY "skill_requests_delete_own" ON public.skill_requests
  FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_skill_requests_cat ON public.skill_requests (category, is_open, created_at DESC);

-- 3. Bids
CREATE TABLE IF NOT EXISTS public.skill_request_bids (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.skill_requests(id) ON DELETE CASCADE,
  provider_id uuid NOT NULL,
  message text NOT NULL,
  price_eur numeric,
  status text NOT NULL DEFAULT 'pending',
  credits_spent integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (request_id, provider_id)
);

GRANT SELECT, INSERT, UPDATE ON public.skill_request_bids TO authenticated;
GRANT ALL ON public.skill_request_bids TO service_role;
ALTER TABLE public.skill_request_bids ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "skill_bids_select_involved" ON public.skill_request_bids;
CREATE POLICY "skill_bids_select_involved" ON public.skill_request_bids
  FOR SELECT TO authenticated USING (
    provider_id = auth.uid()
    OR EXISTS (SELECT 1 FROM public.skill_requests r WHERE r.id = request_id AND r.user_id = auth.uid())
  );
DROP POLICY IF EXISTS "skill_bids_no_direct_insert" ON public.skill_request_bids;
CREATE POLICY "skill_bids_no_direct_insert" ON public.skill_request_bids
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE INDEX IF NOT EXISTS idx_skill_bids_request ON public.skill_request_bids (request_id, created_at DESC);

-- 4. RPC: publish request (free)
CREATE OR REPLACE FUNCTION public.publish_skill_request(
  _title text, _description text, _category public.skill_category,
  _region text DEFAULT NULL, _location text DEFAULT NULL,
  _budget_eur numeric DEFAULT NULL, _deadline date DEFAULT NULL
) RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_uid uuid := auth.uid(); v_id uuid; v_today int;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT count(*) INTO v_today FROM public.skill_requests
   WHERE user_id = v_uid AND created_at > now() - interval '24 hours';
  IF v_today >= 10 THEN RAISE EXCEPTION 'DAILY_LIMIT_REACHED'; END IF;

  INSERT INTO public.skill_requests (user_id, title, description, category, region, location, budget_eur, deadline)
  VALUES (v_uid, _title, _description, _category, NULLIF(_region,''), NULLIF(_location,''), _budget_eur, _deadline)
  RETURNING id INTO v_id;
  RETURN v_id;
END; $$;

-- 5. RPC: submit bid (1 credit)
CREATE OR REPLACE FUNCTION public.submit_skill_bid(_request_id uuid, _message text, _price_eur numeric DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_owner uuid; v_open boolean; v_title text;
  v_before int; v_after int; v_today int; v_bid uuid;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT r.user_id, r.is_open, r.title INTO v_owner, v_open, v_title
    FROM public.skill_requests r WHERE r.id = _request_id;
  IF v_owner IS NULL THEN RAISE EXCEPTION 'REQUEST_NOT_FOUND'; END IF;
  IF v_owner = v_uid THEN RAISE EXCEPTION 'OWN_REQUEST'; END IF;
  IF NOT v_open THEN RAISE EXCEPTION 'REQUEST_CLOSED'; END IF;
  IF EXISTS (SELECT 1 FROM public.skill_request_bids b WHERE b.request_id = _request_id AND b.provider_id = v_uid) THEN
    RAISE EXCEPTION 'ALREADY_BID';
  END IF;

  SELECT count(*) INTO v_today FROM public.skill_request_bids
   WHERE provider_id = v_uid AND created_at > now() - interval '24 hours';
  IF v_today >= 30 THEN RAISE EXCEPTION 'DAILY_LIMIT_REACHED'; END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < 1 THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - 1, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -1, v_before, v_after, 'skills_marketplace_bid', 'skills_marketplace', v_uid,
          jsonb_build_object('request_id', _request_id));

  INSERT INTO public.skill_request_bids (request_id, provider_id, message, price_eur)
  VALUES (_request_id, v_uid, _message, _price_eur) RETURNING id INTO v_bid;

  UPDATE public.skill_requests SET bids_count = bids_count + 1, updated_at = now() WHERE id = _request_id;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (v_owner, v_uid, 'New offer on your request',
          COALESCE((SELECT NULLIF(p.full_name,'') FROM public.profiles p WHERE p.id = v_uid), 'A provider')
            || ' · ' || COALESCE(v_title,'request') || ': ' || left(_message, 80),
          'skill_request_bid', _request_id, '/marketplace?tab=requests');

  RETURN jsonb_build_object('bid_id', v_bid, 'credits_remaining', v_after);
END; $$;

-- 6. RPC: accept bid
CREATE OR REPLACE FUNCTION public.accept_skill_bid(_bid_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_uid uuid := auth.uid(); v_req uuid; v_owner uuid; v_provider uuid; v_title text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'AUTH_REQUIRED'; END IF;
  SELECT b.request_id, b.provider_id INTO v_req, v_provider FROM public.skill_request_bids b WHERE b.id = _bid_id;
  IF v_req IS NULL THEN RAISE EXCEPTION 'BID_NOT_FOUND'; END IF;
  SELECT r.user_id, r.title INTO v_owner, v_title FROM public.skill_requests r WHERE r.id = v_req;
  IF v_owner <> v_uid THEN RAISE EXCEPTION 'NOT_OWNER'; END IF;

  UPDATE public.skill_request_bids SET status = 'accepted' WHERE id = _bid_id;
  UPDATE public.skill_request_bids SET status = 'rejected' WHERE request_id = v_req AND id <> _bid_id AND status = 'pending';
  UPDATE public.skill_requests SET is_open = false, updated_at = now() WHERE id = v_req;

  INSERT INTO public.notifications (user_id, actor_id, title, message, type, related_id, action_url)
  VALUES (v_provider, v_uid, 'Your offer was accepted',
          'Your offer for "' || COALESCE(v_title,'a request') || '" was accepted.',
          'skill_bid_accepted', v_req, '/marketplace?tab=requests');

  RETURN jsonb_build_object('accepted', true);
END; $$;

-- 7. RPC: promote offering (TOP / PREMIUM)
CREATE OR REPLACE FUNCTION public.skill_top_listing(_offering_id uuid, _days integer, _tier text DEFAULT 'top')
RETURNS TABLE(promoted_until timestamptz, credits_remaining integer, tier text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE v_uid uuid := auth.uid(); v_cost int; v_before int; v_after int; v_base timestamptz; v_until timestamptz;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'NOT_AUTHENTICATED'; END IF;
  IF _tier NOT IN ('top','premium') THEN RAISE EXCEPTION 'INVALID_TIER'; END IF;
  IF _tier = 'premium' THEN
    IF _days <> 30 THEN RAISE EXCEPTION 'INVALID_DURATION'; END IF;
    v_cost := 100;
  ELSE
    v_cost := CASE _days WHEN 7 THEN 15 WHEN 14 THEN 25 WHEN 30 THEN 45 ELSE NULL END;
  END IF;
  IF v_cost IS NULL THEN RAISE EXCEPTION 'INVALID_DURATION'; END IF;

  IF NOT EXISTS (SELECT 1 FROM public.skill_offerings o WHERE o.id = _offering_id AND o.user_id = v_uid) THEN
    RAISE EXCEPTION 'NOT_OWNER';
  END IF;

  SELECT c.credits_remaining INTO v_before FROM public.ai_credits c WHERE c.user_id = v_uid FOR UPDATE;
  IF v_before IS NULL OR v_before < v_cost THEN RAISE EXCEPTION 'INSUFFICIENT_CREDITS'; END IF;
  UPDATE public.ai_credits c SET credits_remaining = c.credits_remaining - v_cost, updated_at = now()
   WHERE c.user_id = v_uid RETURNING c.credits_remaining INTO v_after;

  INSERT INTO public.ai_credits_ledger (user_id, delta, balance_before, balance_after, reason, source, actor, metadata)
  VALUES (v_uid, -v_cost, v_before, v_after,
          CASE WHEN _tier='premium' THEN 'skills_premium_listing' ELSE 'skills_top_listing' END,
          'skills_marketplace', v_uid,
          jsonb_build_object('offering_id', _offering_id, 'days', _days, 'tier', _tier));

  IF _tier = 'premium' THEN
    SELECT GREATEST(now(), COALESCE(o.premium_until, now())) INTO v_base FROM public.skill_offerings o WHERE o.id = _offering_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.skill_offerings o SET premium_until = v_until, updated_at = now() WHERE o.id = _offering_id;
  ELSE
    SELECT GREATEST(now(), COALESCE(o.featured_until, now())) INTO v_base FROM public.skill_offerings o WHERE o.id = _offering_id;
    v_until := v_base + (_days || ' days')::interval;
    UPDATE public.skill_offerings o SET featured_until = v_until, updated_at = now() WHERE o.id = _offering_id;
  END IF;

  RETURN QUERY SELECT v_until, v_after, _tier;
END; $$;