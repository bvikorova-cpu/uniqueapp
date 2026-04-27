
-- ============================================================
-- FIX 1: confessions — hide user_id of anonymous confessions
-- ============================================================

-- Drop the wide-open SELECT policy
DROP POLICY IF EXISTS "Authenticated users can view confessions" ON public.confessions;

-- Owner can always see their own (full row)
CREATE POLICY "Users can view their own confessions"
  ON public.confessions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all
CREATE POLICY "Admins can view all confessions"
  ON public.confessions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public-safe view used by feed UI: strips user_id when anonymous
CREATE OR REPLACE VIEW public.confessions_feed
WITH (security_invoker = on) AS
SELECT
  id,
  CASE WHEN is_anonymous THEN NULL ELSE user_id END AS user_id,
  confession_text,
  sin_category,
  is_anonymous,
  created_at
FROM public.confessions;

GRANT SELECT ON public.confessions_feed TO authenticated;

-- Helper SECURITY DEFINER function so feed can list confessions without
-- the per-row SELECT policy blocking non-owners. Returns sanitized rows only.
CREATE OR REPLACE FUNCTION public.get_confessions_feed(_limit int DEFAULT 50, _offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  confession_text text,
  sin_category text,
  is_anonymous boolean,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    c.id,
    CASE WHEN c.is_anonymous THEN NULL ELSE c.user_id END,
    c.confession_text,
    c.sin_category,
    c.is_anonymous,
    c.created_at
  FROM public.confessions c
  ORDER BY c.created_at DESC
  LIMIT _limit OFFSET _offset
$$;

REVOKE EXECUTE ON FUNCTION public.get_confessions_feed(int, int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_confessions_feed(int, int) TO authenticated;

-- ============================================================
-- FIX 2: safety_stories — strip user_id from anonymous stories
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view approved stories" ON public.safety_stories;

-- Owner sees own stories
CREATE POLICY "Users can view their own safety stories"
  ON public.safety_stories FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins see everything
CREATE POLICY "Admins can view all safety stories"
  ON public.safety_stories FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Public-safe function for the public feed (anon + authenticated)
CREATE OR REPLACE FUNCTION public.get_approved_safety_stories(_limit int DEFAULT 50, _offset int DEFAULT 0)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  is_anonymous boolean,
  created_at timestamptz,
  story_data jsonb
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    CASE WHEN s.is_anonymous THEN NULL ELSE s.user_id END AS user_id,
    s.is_anonymous,
    s.created_at,
    to_jsonb(s.*) - 'user_id' AS story_data
  FROM public.safety_stories s
  WHERE s.is_approved = true
  ORDER BY s.created_at DESC
  LIMIT _limit OFFSET _offset;
END
$$;

GRANT EXECUTE ON FUNCTION public.get_approved_safety_stories(int, int) TO anon, authenticated;

-- ============================================================
-- FIX 3: Remove client-side UPDATE on virtual currency tables
-- All balance changes must go through SECURITY DEFINER fns or
-- service-role edge functions.
-- ============================================================

-- Tables with explicit UPDATE policies
DROP POLICY IF EXISTS "Users can update their own brain duel credits" ON public.brain_duel_credits;
DROP POLICY IF EXISTS "Users can update own currency"                  ON public.comedy_currency;
DROP POLICY IF EXISTS "Users can update their own wallet"              ON public.emotion_wallets;
DROP POLICY IF EXISTS "Users can update own f1 currency"               ON public.f1_currency;
DROP POLICY IF EXISTS "football_coins_update"                          ON public.football_coins;
DROP POLICY IF EXISTS "Users can update their own currency"            ON public.horse_currency;
DROP POLICY IF EXISTS "Users can update own currency"                  ON public.horse_currency;

-- Tables with FOR ALL policies — replace with SELECT-only
DROP POLICY IF EXISTS "Users manage own af coins"          ON public.american_football_coins;
CREATE POLICY "Users view own af coins"
  ON public.american_football_coins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own basketball coins"  ON public.basketball_coins;
CREATE POLICY "Users view own basketball coins"
  ON public.basketball_coins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own hockey coins"      ON public.hockey_coins;
CREATE POLICY "Users view own hockey coins"
  ON public.hockey_coins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users manage own tennis coins"      ON public.tennis_coins;
CREATE POLICY "Users view own tennis coins"
  ON public.tennis_coins FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
