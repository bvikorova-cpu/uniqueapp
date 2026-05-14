-- Event RSVPs
CREATE TABLE IF NOT EXISTS public.event_rsvps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('going','waitlist','declined')),
  waitlist_position INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_event_rsvps_event ON public.event_rsvps(event_id, status);
ALTER TABLE public.event_rsvps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view rsvps"
  ON public.event_rsvps FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "User can create own rsvp"
  ON public.event_rsvps FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "User can update own rsvp"
  ON public.event_rsvps FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "User can delete own rsvp"
  ON public.event_rsvps FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE TRIGGER trg_event_rsvps_updated_at
  BEFORE UPDATE ON public.event_rsvps
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Event tickets with QR token
CREATE TABLE IF NOT EXISTS public.event_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL,
  organizer_id UUID NOT NULL,
  holder_id UUID NOT NULL,
  qr_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  seat_label TEXT,
  checked_in_at TIMESTAMPTZ,
  checked_in_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_event_tickets_event ON public.event_tickets(event_id);
CREATE INDEX IF NOT EXISTS idx_event_tickets_holder ON public.event_tickets(holder_id);
ALTER TABLE public.event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Holder or organizer can view"
  ON public.event_tickets FOR SELECT TO authenticated
  USING (auth.uid() = holder_id OR auth.uid() = organizer_id);
CREATE POLICY "Holder can create own ticket"
  ON public.event_tickets FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = holder_id);
CREATE POLICY "Organizer can check in"
  ON public.event_tickets FOR UPDATE TO authenticated
  USING (auth.uid() = organizer_id);