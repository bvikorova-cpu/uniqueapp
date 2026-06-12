
ALTER TABLE public.live_concert_streams
  ADD COLUMN IF NOT EXISTS playback_url text,
  ADD COLUMN IF NOT EXISTS ingest_url text,
  ADD COLUMN IF NOT EXISTS started_at timestamptz,
  ADD COLUMN IF NOT EXISTS ended_at timestamptz,
  ADD COLUMN IF NOT EXISTS viewer_count integer NOT NULL DEFAULT 0;

-- Helper function: can current user watch this concert?
CREATE OR REPLACE FUNCTION public.can_watch_concert(_concert_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    -- Musician (owner) can always watch
    EXISTS (
      SELECT 1 FROM public.live_concert_streams s
      JOIN public.musician_profiles m ON m.id = s.musician_id
      WHERE s.id = _concert_id AND m.user_id = _user_id
    )
    OR
    -- Ticket holder
    EXISTS (
      SELECT 1 FROM public.concert_ticket_purchases p
      WHERE p.concert_id = _concert_id
        AND p.user_id = _user_id
        AND p.payment_status = 'completed'
    );
$$;

GRANT EXECUTE ON FUNCTION public.can_watch_concert(uuid, uuid) TO authenticated, anon;
