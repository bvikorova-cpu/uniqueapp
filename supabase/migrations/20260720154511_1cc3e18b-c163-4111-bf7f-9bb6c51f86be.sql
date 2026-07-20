
CREATE TABLE public.exclusive_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  stripe_session_id text,
  stripe_payment_intent text,
  amount_paid_cents integer NOT NULL DEFAULT 10000000,
  currency text NOT NULL DEFAULT 'eur',
  status text NOT NULL DEFAULT 'active',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.exclusive_members TO authenticated;
GRANT ALL ON public.exclusive_members TO service_role;

ALTER TABLE public.exclusive_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members can read own exclusive record"
  ON public.exclusive_members FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "service role manages exclusive"
  ON public.exclusive_members FOR ALL
  TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX exclusive_members_user_idx ON public.exclusive_members(user_id);
