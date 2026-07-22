
CREATE TABLE public.client_error_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL DEFAULT 'error',
  source TEXT NOT NULL DEFAULT 'client',
  message TEXT NOT NULL,
  stack TEXT,
  url TEXT,
  route TEXT,
  user_agent TEXT,
  context JSONB,
  user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT INSERT ON public.client_error_events TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.client_error_events TO service_role;

ALTER TABLE public.client_error_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can log errors"
  ON public.client_error_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "admins can read errors"
  ON public.client_error_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE INDEX idx_client_error_events_created ON public.client_error_events (created_at DESC);
CREATE INDEX idx_client_error_events_route ON public.client_error_events (route);
