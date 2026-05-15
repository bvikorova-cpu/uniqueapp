
CREATE TABLE public.megatalent_live_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_user_id uuid NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'scheduled',
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  viewer_count integer NOT NULL DEFAULT 0,
  stream_key text NOT NULL DEFAULT gen_random_uuid()::text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.megatalent_live_streams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live streams are viewable by everyone"
ON public.megatalent_live_streams FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create their own streams"
ON public.megatalent_live_streams FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = host_user_id);

CREATE POLICY "Hosts can update their streams"
ON public.megatalent_live_streams FOR UPDATE
TO authenticated
USING (auth.uid() = host_user_id);

CREATE POLICY "Hosts can delete their streams"
ON public.megatalent_live_streams FOR DELETE
TO authenticated
USING (auth.uid() = host_user_id);

CREATE INDEX idx_megatalent_live_streams_category ON public.megatalent_live_streams(category, status);
CREATE INDEX idx_megatalent_live_streams_status ON public.megatalent_live_streams(status, started_at DESC);

CREATE TRIGGER update_megatalent_live_streams_updated_at
BEFORE UPDATE ON public.megatalent_live_streams
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.megatalent_watch_party_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id uuid NOT NULL REFERENCES public.megatalent_live_streams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 500),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.megatalent_watch_party_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Watch party messages are viewable by everyone"
ON public.megatalent_watch_party_messages FOR SELECT USING (true);

CREATE POLICY "Authenticated users can post watch party messages"
ON public.megatalent_watch_party_messages FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.megatalent_watch_party_messages FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE INDEX idx_megatalent_watch_party_messages_stream ON public.megatalent_watch_party_messages(stream_id, created_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.megatalent_watch_party_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.megatalent_live_streams;
