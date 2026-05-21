CREATE TABLE IF NOT EXISTS public.monetag_ad_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL,
  zone_id text,
  revenue numeric(12,6) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  ymid text,
  sub_id text,
  country text,
  raw jsonb,
  event_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS monetag_ad_events_event_at_idx ON public.monetag_ad_events(event_at DESC);
CREATE INDEX IF NOT EXISTS monetag_ad_events_event_type_idx ON public.monetag_ad_events(event_type);
CREATE INDEX IF NOT EXISTS monetag_ad_events_zone_idx ON public.monetag_ad_events(zone_id);

ALTER TABLE public.monetag_ad_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read monetag events"
ON public.monetag_ad_events FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));