
CREATE TABLE public.fanclub_verify_audit (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  email text,
  fan_club_id uuid,
  outcome text NOT NULL,
  error_message text,
  stripe_customer_id text,
  subscriptions_found integer NOT NULL DEFAULT 0,
  memberships_synced integer NOT NULL DEFAULT 0,
  status_summary jsonb,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_fanclub_verify_audit_created ON public.fanclub_verify_audit (created_at DESC);
CREATE INDEX idx_fanclub_verify_audit_user ON public.fanclub_verify_audit (user_id, created_at DESC);
CREATE INDEX idx_fanclub_verify_audit_outcome ON public.fanclub_verify_audit (outcome, created_at DESC);

GRANT SELECT ON public.fanclub_verify_audit TO authenticated;
GRANT ALL ON public.fanclub_verify_audit TO service_role;

ALTER TABLE public.fanclub_verify_audit ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all verify audit entries"
  ON public.fanclub_verify_audit
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
