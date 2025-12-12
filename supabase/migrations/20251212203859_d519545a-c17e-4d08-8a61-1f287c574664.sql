-- Paid DMs / Exclusive Messages
CREATE TABLE public.creator_paid_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  content TEXT NOT NULL,
  reply TEXT,
  amount_paid NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  creator_payout NUMERIC NOT NULL,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  replied_at TIMESTAMP WITH TIME ZONE
);

-- Creator message pricing settings
CREATE TABLE public.creator_message_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL UNIQUE,
  price_per_message NUMERIC DEFAULT 5,
  is_enabled BOOLEAN DEFAULT true,
  auto_reply_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Live Streams
CREATE TABLE public.creator_live_streams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  stream_url TEXT,
  access_price NUMERIC DEFAULT 0,
  is_free BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'scheduled',
  scheduled_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  viewer_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Live Stream Access (who paid for access)
CREATE TABLE public.creator_live_stream_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID REFERENCES public.creator_live_streams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  amount_paid NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  creator_payout NUMERIC NOT NULL,
  stripe_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Merch Products
CREATE TABLE public.creator_merch (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  image_url TEXT,
  category TEXT,
  stock_quantity INTEGER,
  is_digital BOOLEAN DEFAULT false,
  digital_file_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Merch Orders
CREATE TABLE public.creator_merch_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL,
  creator_id UUID NOT NULL,
  merch_id UUID REFERENCES public.creator_merch(id),
  quantity INTEGER DEFAULT 1,
  amount NUMERIC NOT NULL,
  platform_fee NUMERIC NOT NULL,
  creator_payout NUMERIC NOT NULL,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'pending',
  shipping_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_paid_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_message_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_live_streams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_live_stream_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_merch ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_merch_orders ENABLE ROW LEVEL SECURITY;

-- Paid Messages Policies
CREATE POLICY "Users can view their sent messages" ON public.creator_paid_messages
  FOR SELECT USING (auth.uid() = sender_id);
CREATE POLICY "Creators can view received messages" ON public.creator_paid_messages
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users can send paid messages" ON public.creator_paid_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Creators can reply to messages" ON public.creator_paid_messages
  FOR UPDATE USING (auth.uid() = creator_id);

-- Message Settings Policies
CREATE POLICY "Anyone can view message settings" ON public.creator_message_settings
  FOR SELECT USING (true);
CREATE POLICY "Creators can manage their settings" ON public.creator_message_settings
  FOR ALL USING (auth.uid() = creator_id);

-- Live Streams Policies
CREATE POLICY "Anyone can view live streams" ON public.creator_live_streams
  FOR SELECT USING (true);
CREATE POLICY "Creators can manage their streams" ON public.creator_live_streams
  FOR ALL USING (auth.uid() = creator_id);

-- Stream Access Policies
CREATE POLICY "Users can view their access" ON public.creator_live_stream_access
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Creators can view stream access" ON public.creator_live_stream_access
  FOR SELECT USING (auth.uid() IN (SELECT creator_id FROM public.creator_live_streams WHERE id = stream_id));
CREATE POLICY "Users can purchase access" ON public.creator_live_stream_access
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Merch Policies
CREATE POLICY "Anyone can view active merch" ON public.creator_merch
  FOR SELECT USING (is_active = true);
CREATE POLICY "Creators can manage their merch" ON public.creator_merch
  FOR ALL USING (auth.uid() = creator_id);

-- Merch Orders Policies
CREATE POLICY "Buyers can view their orders" ON public.creator_merch_orders
  FOR SELECT USING (auth.uid() = buyer_id);
CREATE POLICY "Creators can view their sales" ON public.creator_merch_orders
  FOR SELECT USING (auth.uid() = creator_id);
CREATE POLICY "Users can create orders" ON public.creator_merch_orders
  FOR INSERT WITH CHECK (auth.uid() = buyer_id);