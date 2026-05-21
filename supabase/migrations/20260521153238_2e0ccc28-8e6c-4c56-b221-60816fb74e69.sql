CREATE POLICY "App can log Monetag watch ad events"
ON public.monetag_ad_events
FOR INSERT
TO anon, authenticated
WITH CHECK (
  event_type IN ('click', 'impression')
  AND revenue = 0
  AND currency = 'USD'
);

CREATE INDEX IF NOT EXISTS monetag_ad_events_sub_id_idx ON public.monetag_ad_events(sub_id);