-- Create holographic purchases table
CREATE TABLE IF NOT EXISTS public.holographic_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create holographic concerts table
CREATE TABLE IF NOT EXISTS public.holographic_concerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  description TEXT,
  concert_date TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 90,
  thumbnail_url TEXT,
  stream_url TEXT,
  is_live BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create concert tickets table
CREATE TABLE IF NOT EXISTS public.concert_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  concert_id UUID REFERENCES public.holographic_concerts(id) ON DELETE CASCADE,
  ticket_type TEXT NOT NULL,
  purchase_date TIMESTAMPTZ DEFAULT now(),
  seat_number TEXT,
  qr_code TEXT,
  used BOOLEAN DEFAULT false
);

-- Create concert recordings table
CREATE TABLE IF NOT EXISTS public.concert_recordings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  concert_id UUID REFERENCES public.holographic_concerts(id) ON DELETE CASCADE,
  recording_url TEXT NOT NULL,
  quality TEXT NOT NULL DEFAULT '4K',
  duration_minutes INTEGER,
  purchased_at TIMESTAMPTZ DEFAULT now()
);

-- Create AI dedications table
CREATE TABLE IF NOT EXISTS public.ai_dedications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  artist_name TEXT NOT NULL,
  recipient_name TEXT NOT NULL,
  message TEXT NOT NULL,
  dedication_text TEXT,
  video_url TEXT,
  audio_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create merch orders table
CREATE TABLE IF NOT EXISTS public.merch_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  artist_name TEXT NOT NULL,
  items JSONB NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  shipping_address JSONB,
  tracking_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create meet and greet sessions table
CREATE TABLE IF NOT EXISTS public.meet_greet_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  artist_name TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  session_type TEXT NOT NULL DEFAULT 'vip',
  status TEXT NOT NULL DEFAULT 'scheduled',
  meeting_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.holographic_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holographic_concerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_recordings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_dedications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.merch_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meet_greet_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for holographic_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.holographic_purchases FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policies for holographic_concerts (public read)
CREATE POLICY "Anyone can view concerts"
  ON public.holographic_concerts FOR SELECT
  USING (true);

-- RLS Policies for concert_tickets
CREATE POLICY "Users can view their own tickets"
  ON public.concert_tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tickets"
  ON public.concert_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for concert_recordings
CREATE POLICY "Users can view their own recordings"
  ON public.concert_recordings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own recordings"
  ON public.concert_recordings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_dedications
CREATE POLICY "Users can view their own dedications"
  ON public.ai_dedications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dedications"
  ON public.ai_dedications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for merch_orders
CREATE POLICY "Users can view their own merch orders"
  ON public.merch_orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own merch orders"
  ON public.merch_orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for meet_greet_sessions
CREATE POLICY "Users can view their own meet & greet sessions"
  ON public.meet_greet_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own meet & greet sessions"
  ON public.meet_greet_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to check holographic access
CREATE OR REPLACE FUNCTION public.has_holographic_access(
  user_id_param UUID,
  service_type_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.holographic_purchases
    WHERE user_id = user_id_param
      AND service_type = service_type_param
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;

-- Insert sample concerts
INSERT INTO public.holographic_concerts (title, artist_name, description, concert_date, duration_minutes, thumbnail_url, is_live) VALUES
('Legends Live: Freddie Mercury', 'Freddie Mercury', 'Experience the magic of Queen with an AI holographic recreation of Freddie Mercury', now() + interval '7 days', 120, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', false),
('Elvis: The King Returns', 'Elvis Presley', 'The King of Rock and Roll brought back through cutting-edge holographic technology', now() + interval '14 days', 90, 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800', false),
('Michael Jackson: Moonwalk Forever', 'Michael Jackson', 'Relive the greatest performances of the King of Pop in holographic form', now() + interval '21 days', 150, 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800', false),
('Whitney Houston: Voice of an Angel', 'Whitney Houston', 'The legendary voice returns through AI holographic performance', now() + interval '30 days', 100, 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800', false);