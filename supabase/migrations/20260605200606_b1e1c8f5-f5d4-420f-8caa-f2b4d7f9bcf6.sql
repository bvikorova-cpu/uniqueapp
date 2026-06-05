
CREATE TABLE public.pwa_install_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  event_type text NOT NULL CHECK (event_type IN ('banner_shown','install_click','open_click','install_accepted','install_dismissed','banner_dismissed')),
  platform text NOT NULL CHECK (platform IN ('ios','android','desktop','unknown')),
  running_standalone boolean NOT NULL DEFAULT false,
  installed boolean NOT NULL DEFAULT false,
  user_agent text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pwa_install_events_created_at ON public.pwa_install_events (created_at DESC);
CREATE INDEX idx_pwa_install_events_event_platform ON public.pwa_install_events (event_type, platform);

GRANT INSERT ON public.pwa_install_events TO anon;
GRANT INSERT ON public.pwa_install_events TO authenticated;
GRANT ALL ON public.pwa_install_events TO service_role;

ALTER TABLE public.pwa_install_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert PWA install events"
  ON public.pwa_install_events
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Admins can read PWA install events"
  ON public.pwa_install_events
  FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
