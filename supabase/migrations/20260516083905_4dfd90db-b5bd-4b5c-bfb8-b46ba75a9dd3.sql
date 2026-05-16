
-- Unified Hub XP tracking across Megatalent / KitchenStars / ProClass
CREATE TABLE IF NOT EXISTS public.hub_xp (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hub text NOT NULL CHECK (hub IN ('megatalent','kitchenstars','proclass')),
  xp integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, hub)
);

CREATE INDEX IF NOT EXISTS idx_hub_xp_user ON public.hub_xp(user_id);
CREATE INDEX IF NOT EXISTS idx_hub_xp_hub_xp ON public.hub_xp(hub, xp DESC);

ALTER TABLE public.hub_xp ENABLE ROW LEVEL SECURITY;

CREATE POLICY "hub_xp public read" ON public.hub_xp FOR SELECT USING (true);
CREATE POLICY "hub_xp self insert" ON public.hub_xp FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "hub_xp self update" ON public.hub_xp FOR UPDATE USING (auth.uid() = user_id);

-- Award hub XP (called from edge fns or client via RPC); also bumps unified user_xp.total_xp
CREATE OR REPLACE FUNCTION public.award_hub_xp(_hub text, _amount integer)
RETURNS TABLE(hub_total integer, unified_total integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _uid uuid := auth.uid();
  _hub_total integer;
  _unified integer;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'auth required'; END IF;
  IF _amount IS NULL OR _amount <= 0 THEN RAISE EXCEPTION 'invalid amount'; END IF;
  IF _hub NOT IN ('megatalent','kitchenstars','proclass') THEN RAISE EXCEPTION 'invalid hub'; END IF;

  INSERT INTO public.hub_xp(user_id, hub, xp) VALUES (_uid, _hub, _amount)
  ON CONFLICT (user_id, hub) DO UPDATE
    SET xp = public.hub_xp.xp + EXCLUDED.xp, updated_at = now()
  RETURNING xp INTO _hub_total;

  INSERT INTO public.user_xp(user_id, total_xp) VALUES (_uid, _amount)
  ON CONFLICT (user_id) DO UPDATE
    SET total_xp = public.user_xp.total_xp + EXCLUDED.total_xp, updated_at = now()
  RETURNING total_xp INTO _unified;

  RETURN QUERY SELECT _hub_total, _unified;
END;
$$;

-- Cross-hub leaderboard: top users by combined hub xp with per-hub breakdown
CREATE OR REPLACE FUNCTION public.get_unified_xp_leaderboard(_limit integer DEFAULT 10)
RETURNS TABLE(
  user_id uuid,
  full_name text,
  avatar_url text,
  total_xp bigint,
  megatalent_xp bigint,
  kitchenstars_xp bigint,
  proclass_xp bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    h.user_id,
    p.full_name,
    p.avatar_url,
    SUM(h.xp)::bigint AS total_xp,
    COALESCE(SUM(h.xp) FILTER (WHERE h.hub='megatalent'),0)::bigint,
    COALESCE(SUM(h.xp) FILTER (WHERE h.hub='kitchenstars'),0)::bigint,
    COALESCE(SUM(h.xp) FILTER (WHERE h.hub='proclass'),0)::bigint
  FROM public.hub_xp h
  LEFT JOIN public.profiles p ON p.id = h.user_id
  GROUP BY h.user_id, p.full_name, p.avatar_url
  ORDER BY total_xp DESC
  LIMIT GREATEST(1, LEAST(_limit, 100));
$$;

CREATE OR REPLACE FUNCTION public.get_my_hub_xp()
RETURNS TABLE(hub text, xp integer)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT hub, xp FROM public.hub_xp WHERE user_id = auth.uid();
$$;
