-- Create live_streams table
CREATE TABLE public.live_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  influencer_id UUID NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_key TEXT UNIQUE NOT NULL,
  is_live BOOLEAN DEFAULT false,
  viewer_count INTEGER DEFAULT 0,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stream_viewers table
CREATE TABLE public.stream_viewers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(stream_id, user_id)
);

-- Create stream_messages table (chat)
CREATE TABLE public.stream_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create stream_gifts table
CREATE TABLE public.stream_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stream_id UUID NOT NULL REFERENCES public.live_streams(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  gift_type TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 1.00,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_viewers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stream_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for live_streams
CREATE POLICY "Anyone can view active streams"
  ON public.live_streams FOR SELECT
  USING (is_live = true);

CREATE POLICY "Influencers can create their streams"
  ON public.live_streams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.influencer_profiles
      WHERE id = live_streams.influencer_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Influencers can update their streams"
  ON public.live_streams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.influencer_profiles
      WHERE id = live_streams.influencer_id
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Influencers can delete their streams"
  ON public.live_streams FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.influencer_profiles
      WHERE id = live_streams.influencer_id
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for stream_viewers
CREATE POLICY "Anyone can view stream viewers"
  ON public.stream_viewers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can join streams"
  ON public.stream_viewers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their viewer status"
  ON public.stream_viewers FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for stream_messages
CREATE POLICY "Anyone can view stream messages"
  ON public.stream_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send messages"
  ON public.stream_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for stream_gifts
CREATE POLICY "Anyone can view stream gifts"
  ON public.stream_gifts FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can send gifts"
  ON public.stream_gifts FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create indexes for performance
CREATE INDEX idx_live_streams_influencer ON public.live_streams(influencer_id);
CREATE INDEX idx_live_streams_is_live ON public.live_streams(is_live);
CREATE INDEX idx_stream_viewers_stream ON public.stream_viewers(stream_id);
CREATE INDEX idx_stream_messages_stream ON public.stream_messages(stream_id);
CREATE INDEX idx_stream_gifts_stream ON public.stream_gifts(stream_id);

-- Function to update viewer count
CREATE OR REPLACE FUNCTION public.update_viewer_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.left_at IS NULL THEN
    UPDATE public.live_streams
    SET viewer_count = viewer_count + 1
    WHERE id = NEW.stream_id;
  ELSIF TG_OP = 'UPDATE' AND NEW.left_at IS NOT NULL AND OLD.left_at IS NULL THEN
    UPDATE public.live_streams
    SET viewer_count = GREATEST(viewer_count - 1, 0)
    WHERE id = NEW.stream_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for viewer count
CREATE TRIGGER update_stream_viewer_count
  AFTER INSERT OR UPDATE ON public.stream_viewers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_viewer_count();