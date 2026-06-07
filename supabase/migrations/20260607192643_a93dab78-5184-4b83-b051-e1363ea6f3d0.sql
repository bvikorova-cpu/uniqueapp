-- P5: security_audit_log — user-scoped security event trail (account changes, MFA, idle logout, failed re-auth)
CREATE TABLE public.security_audit_log (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  resource text,
  ip_address text,
  user_agent text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_audit_log_user_created ON public.security_audit_log (user_id, created_at DESC);
CREATE INDEX idx_security_audit_log_event_created ON public.security_audit_log (event_type, created_at DESC);

GRANT SELECT, INSERT ON public.security_audit_log TO authenticated;
GRANT ALL ON public.security_audit_log TO service_role;

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Users may view only their own security events
CREATE POLICY "Users view own security events"
  ON public.security_audit_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins may view all
CREATE POLICY "Admins view all security events"
  ON public.security_audit_log
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- No direct INSERT policy — all writes go through SECURITY DEFINER RPC `log_security_event`.
-- (INSERT grant is required for the RPC's caller context, but RLS without an INSERT policy blocks ad-hoc inserts.)

-- SECURITY DEFINER RPC: clients call this; it stamps user_id from auth.uid() so it cannot be forged.
CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _resource text DEFAULT NULL,
  _metadata jsonb DEFAULT '{}'::jsonb,
  _user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id uuid;
  _uid uuid := auth.uid();
BEGIN
  IF _event_type IS NULL OR length(_event_type) = 0 OR length(_event_type) > 64 THEN
    RAISE EXCEPTION 'invalid event_type';
  END IF;

  INSERT INTO public.security_audit_log (user_id, event_type, resource, user_agent, metadata)
  VALUES (_uid, _event_type, _resource, left(coalesce(_user_agent, ''), 512), coalesce(_metadata, '{}'::jsonb))
  RETURNING id INTO _id;

  RETURN _id;
END;
$$;

REVOKE ALL ON FUNCTION public.log_security_event(text, text, jsonb, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_security_event(text, text, jsonb, text) TO authenticated, anon;