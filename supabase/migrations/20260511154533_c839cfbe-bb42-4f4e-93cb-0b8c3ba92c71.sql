CREATE TABLE IF NOT EXISTS public.iq_events (
  id BIGSERIAL PRIMARY KEY,
  event_name TEXT NOT NULL,
  user_id UUID,
  session_id TEXT,
  path TEXT,
  referrer TEXT,
  properties JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_iq_events_event_time ON public.iq_events(event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_iq_events_user_time  ON public.iq_events(user_id, created_at DESC);

ALTER TABLE public.iq_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can insert iq event" ON public.iq_events;
CREATE POLICY "anyone can insert iq event"
ON public.iq_events FOR INSERT
WITH CHECK (
  user_id IS NULL OR user_id = auth.uid()
);

DROP POLICY IF EXISTS "admins can read iq events" ON public.iq_events;
CREATE POLICY "admins can read iq events"
ON public.iq_events FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.get_iq_funnel(_from TIMESTAMPTZ DEFAULT now() - interval '30 days', _to TIMESTAMPTZ DEFAULT now())
RETURNS TABLE(event_name TEXT, total BIGINT, unique_users BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'forbidden';
  END IF;
  RETURN QUERY
  SELECT e.event_name,
         COUNT(*)::BIGINT AS total,
         COUNT(DISTINCT e.user_id)::BIGINT AS unique_users
  FROM public.iq_events e
  WHERE e.created_at BETWEEN _from AND _to
  GROUP BY e.event_name
  ORDER BY total DESC;
END;
$$;