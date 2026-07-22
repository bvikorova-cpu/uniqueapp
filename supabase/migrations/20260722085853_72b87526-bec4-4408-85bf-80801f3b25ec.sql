
CREATE TABLE public.route_404_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path text NOT NULL,
  referrer text,
  redirected_to text,
  user_id uuid,
  user_agent text,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_route_404_events_path ON public.route_404_events (path);
CREATE INDEX idx_route_404_events_occurred_at ON public.route_404_events (occurred_at DESC);

GRANT INSERT ON public.route_404_events TO anon, authenticated;
GRANT SELECT ON public.route_404_events TO authenticated;
GRANT ALL ON public.route_404_events TO service_role;

ALTER TABLE public.route_404_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can insert 404 events"
  ON public.route_404_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Signed-in users may only tag events with their own id (or leave null).
    user_id IS NULL OR user_id = auth.uid()
  );

CREATE POLICY "admins can read 404 events"
  ON public.route_404_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
