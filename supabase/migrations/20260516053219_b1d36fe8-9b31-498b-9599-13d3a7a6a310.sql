
CREATE TABLE public.megatalent_boosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  submission_id uuid NOT NULL,
  category text NOT NULL,
  amount_cents integer NOT NULL DEFAULT 499,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.megatalent_boosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Boosts publicly readable when active"
ON public.megatalent_boosts FOR SELECT
USING (status = 'active' AND expires_at > now());

CREATE POLICY "Owner can view own boosts"
ON public.megatalent_boosts FOR SELECT
USING (auth.uid() = user_id);

CREATE INDEX idx_megatalent_boosts_active
ON public.megatalent_boosts (category, expires_at)
WHERE status = 'active';

CREATE INDEX idx_megatalent_boosts_submission
ON public.megatalent_boosts (submission_id);
