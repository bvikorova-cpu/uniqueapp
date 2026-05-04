
-- Lock down horse_currency: remove client UPDATE ability, deny direct INSERT (server-side only)
-- Drop duplicate INSERT policies and disallow client mutations
DROP POLICY IF EXISTS "Users can insert their own currency" ON public.horse_currency;
DROP POLICY IF EXISTS "Users can insert own currency" ON public.horse_currency;
DROP POLICY IF EXISTS "Users can view their own currency" ON public.horse_currency;
DROP POLICY IF EXISTS "Users can view own currency" ON public.horse_currency;

CREATE POLICY "horse_currency_select_own"
  ON public.horse_currency FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies → only service_role (edge functions) can mutate

-- Unique race participant per (race_id, user_id) to prevent duplicate joins
ALTER TABLE public.race_participants
  DROP CONSTRAINT IF EXISTS race_participants_race_user_unique;
ALTER TABLE public.race_participants
  ADD CONSTRAINT race_participants_race_user_unique UNIQUE (race_id, user_id);

-- Restrict races INSERT to admins only (use existing has_role function if available)
DROP POLICY IF EXISTS "Authenticated users can create races" ON public.races;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON p.pronamespace=n.oid
    WHERE n.nspname='public' AND p.proname='has_role'
  ) THEN
    EXECUTE 'CREATE POLICY "Admins can create races" ON public.races FOR INSERT WITH CHECK (public.has_role(auth.uid(), ''admin''::app_role))';
  END IF;
END$$;

-- Lock horses INSERT/UPDATE to server-side only (drop client write policies)
DROP POLICY IF EXISTS "Users can create their own horses" ON public.horses;
DROP POLICY IF EXISTS "Users can update their own horses" ON public.horses;

-- Currency purchases ledger (idempotent fulfillment via stripe_session_id)
CREATE TABLE IF NOT EXISTS public.horse_currency_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  package_type TEXT NOT NULL,
  coins_added INTEGER NOT NULL DEFAULT 0,
  gems_added INTEGER NOT NULL DEFAULT 0,
  amount_eur NUMERIC(10,2) NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  fulfilled_at TIMESTAMPTZ
);

ALTER TABLE public.horse_currency_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own purchases"
  ON public.horse_currency_purchases FOR SELECT
  USING (auth.uid() = user_id);
