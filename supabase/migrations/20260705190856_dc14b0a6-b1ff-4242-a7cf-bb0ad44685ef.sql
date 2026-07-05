CREATE TABLE public.challenge_xp_grant_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tier TEXT NOT NULL CHECK (tier IN ('pro','top')),
  sub_id TEXT,
  period_key TEXT,
  xp_amount INTEGER NOT NULL DEFAULT 0,
  result TEXT NOT NULL CHECK (result IN ('granted','skipped_already_granted','skipped_wrong_tier','error')),
  reason TEXT,
  upsert_ok BOOLEAN,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT ALL ON public.challenge_xp_grant_log TO service_role;

ALTER TABLE public.challenge_xp_grant_log ENABLE ROW LEVEL SECURITY;

-- Admin read-only access (uses existing has_role function, admin app_role)
CREATE POLICY "Admins can read grant log"
  ON public.challenge_xp_grant_log FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_challenge_xp_grant_log_user_created
  ON public.challenge_xp_grant_log(user_id, created_at DESC);
CREATE INDEX idx_challenge_xp_grant_log_created
  ON public.challenge_xp_grant_log(created_at DESC);
CREATE INDEX idx_challenge_xp_grant_log_result
  ON public.challenge_xp_grant_log(result);