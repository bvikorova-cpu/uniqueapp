-- Create musician_profiles table for musicians who can host concerts
CREATE TABLE IF NOT EXISTS public.musician_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_name TEXT NOT NULL,
  bio TEXT,
  genre TEXT,
  avatar_url TEXT,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  total_concerts INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id)
);

-- Create live_concert_streams table
CREATE TABLE IF NOT EXISTS public.live_concert_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_id UUID NOT NULL REFERENCES public.musician_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  stream_key TEXT,
  viewer_count INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create concert_ticket_types table
CREATE TABLE IF NOT EXISTS public.concert_ticket_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  concert_id UUID NOT NULL REFERENCES public.live_concert_streams(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (name IN ('standard', 'vip')),
  price DECIMAL(10,2) NOT NULL CHECK (price > 0),
  description TEXT,
  max_quantity INTEGER,
  sold_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(concert_id, name)
);

-- Create concert_ticket_purchases table
CREATE TABLE IF NOT EXISTS public.concert_ticket_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concert_id UUID NOT NULL REFERENCES public.live_concert_streams(id) ON DELETE CASCADE,
  ticket_type_id UUID NOT NULL REFERENCES public.concert_ticket_types(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  musician_amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 20.00,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  stripe_session_id TEXT,
  purchased_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, concert_id)
);

-- Create concert_gifts table for paid gifts during concerts
CREATE TABLE IF NOT EXISTS public.concert_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  concert_id UUID NOT NULL REFERENCES public.live_concert_streams(id) ON DELETE CASCADE,
  musician_id UUID NOT NULL REFERENCES public.musician_profiles(id) ON DELETE CASCADE,
  gift_id UUID NOT NULL REFERENCES public.platform_gifts(id),
  amount DECIMAL(10,2) NOT NULL,
  musician_amount DECIMAL(10,2) NOT NULL,
  platform_commission DECIMAL(10,2) NOT NULL,
  commission_rate DECIMAL(5,2) DEFAULT 20.00,
  message TEXT,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'completed', 'refunded')),
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.musician_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_concert_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_ticket_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_ticket_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concert_gifts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for musician_profiles
CREATE POLICY "Musician profiles are viewable by everyone"
  ON public.musician_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own musician profile"
  ON public.musician_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own musician profile"
  ON public.musician_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for live_concert_streams
CREATE POLICY "Concert streams are viewable by everyone"
  ON public.live_concert_streams FOR SELECT
  USING (true);

CREATE POLICY "Musicians can create their own concerts"
  ON public.live_concert_streams FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.musician_profiles
      WHERE id = musician_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Musicians can update their own concerts"
  ON public.live_concert_streams FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.musician_profiles
      WHERE id = musician_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for concert_ticket_types
CREATE POLICY "Ticket types are viewable by everyone"
  ON public.concert_ticket_types FOR SELECT
  USING (true);

CREATE POLICY "Musicians can manage their concert ticket types"
  ON public.concert_ticket_types FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.live_concert_streams lcs
      JOIN public.musician_profiles mp ON lcs.musician_id = mp.id
      WHERE lcs.id = concert_id AND mp.user_id = auth.uid()
    )
  );

-- RLS Policies for concert_ticket_purchases
CREATE POLICY "Users can view their own ticket purchases"
  ON public.concert_ticket_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create ticket purchases"
  ON public.concert_ticket_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Musicians can view purchases for their concerts"
  ON public.concert_ticket_purchases FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_concert_streams lcs
      JOIN public.musician_profiles mp ON lcs.musician_id = mp.id
      WHERE lcs.id = concert_id AND mp.user_id = auth.uid()
    )
  );

-- RLS Policies for concert_gifts
CREATE POLICY "Users can view their sent gifts"
  ON public.concert_gifts FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Musicians can view gifts for their concerts"
  ON public.concert_gifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.musician_profiles
      WHERE id = musician_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can send gifts"
  ON public.concert_gifts FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Create indexes for better performance
CREATE INDEX idx_concert_streams_musician ON public.live_concert_streams(musician_id);
CREATE INDEX idx_concert_streams_status ON public.live_concert_streams(status);
CREATE INDEX idx_ticket_purchases_concert ON public.concert_ticket_purchases(concert_id);
CREATE INDEX idx_ticket_purchases_user ON public.concert_ticket_purchases(user_id);
CREATE INDEX idx_concert_gifts_concert ON public.concert_gifts(concert_id);
CREATE INDEX idx_concert_gifts_musician ON public.concert_gifts(musician_id);