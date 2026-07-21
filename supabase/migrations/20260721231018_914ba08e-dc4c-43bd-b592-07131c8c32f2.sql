
-- Extend club_memberships for shipping recipient/phone/note
ALTER TABLE public.club_memberships
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS recipient_name text,
  ADD COLUMN IF NOT EXISTS shipping_note text,
  ADD COLUMN IF NOT EXISTS tracking_number text,
  ADD COLUMN IF NOT EXISTS shipped_at timestamptz,
  ADD COLUMN IF NOT EXISTS delivered_at timestamptz;

-- Idempotency ledger for club perk grants (monthly AI credits etc.)
CREATE TABLE IF NOT EXISTS public.club_perk_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  membership_id uuid REFERENCES public.club_memberships(id) ON DELETE CASCADE,
  perk text NOT NULL,                     -- e.g. 'monthly_ai_credits', 'signup_ai_credits'
  amount numeric NOT NULL DEFAULT 0,
  period_key text NOT NULL,               -- e.g. 'YYYY-MM' or stripe invoice id, unique per user+perk
  stripe_event_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, perk, period_key)
);

GRANT SELECT ON public.club_perk_grants TO authenticated;
GRANT ALL ON public.club_perk_grants TO service_role;

ALTER TABLE public.club_perk_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own perk grants"
  ON public.club_perk_grants
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin update policy for club_memberships (shipping status changes)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='club_memberships'
      AND policyname='Admins can update memberships'
  ) THEN
    CREATE POLICY "Admins can update memberships"
      ON public.club_memberships
      FOR UPDATE
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='club_memberships'
      AND policyname='Admins can view all memberships'
  ) THEN
    CREATE POLICY "Admins can view all memberships"
      ON public.club_memberships
      FOR SELECT
      TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
