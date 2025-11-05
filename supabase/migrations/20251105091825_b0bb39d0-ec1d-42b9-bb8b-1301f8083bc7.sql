-- Create creator profiles table
CREATE TABLE IF NOT EXISTS public.creator_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  cover_image_url TEXT,
  total_subscribers INTEGER DEFAULT 0,
  total_earnings DECIMAL(10,2) DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create subscription tiers table
CREATE TABLE IF NOT EXISTS public.creator_subscription_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stripe_price_id TEXT,
  benefits TEXT[],
  max_subscribers INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create creator subscriptions table
CREATE TABLE IF NOT EXISTS public.creator_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscriber_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
  tier_id UUID REFERENCES public.creator_subscription_tiers(id) ON DELETE CASCADE NOT NULL,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  UNIQUE(subscriber_id, creator_id)
);

-- Create exclusive posts table
CREATE TABLE IF NOT EXISTS public.creator_exclusive_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[],
  tier_ids UUID[],
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_published BOOLEAN DEFAULT true,
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create community chat rooms table
CREATE TABLE IF NOT EXISTS public.creator_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES public.creator_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  tier_ids UUID[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS public.creator_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.creator_chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creator_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_subscription_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_exclusive_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creator_chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for creator_profiles
CREATE POLICY "Anyone can view creator profiles"
  ON public.creator_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own creator profile"
  ON public.creator_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own creator profile"
  ON public.creator_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for subscription tiers
CREATE POLICY "Anyone can view active tiers"
  ON public.creator_subscription_tiers FOR SELECT
  TO authenticated
  USING (is_active = true);

CREATE POLICY "Creators can manage their tiers"
  ON public.creator_subscription_tiers FOR ALL
  TO authenticated
  USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

-- RLS Policies for memberships
CREATE POLICY "Users can view their own memberships"
  ON public.creator_memberships FOR SELECT
  TO authenticated
  USING (subscriber_id = auth.uid() OR creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

CREATE POLICY "Users can create memberships"
  ON public.creator_memberships FOR INSERT
  TO authenticated
  WITH CHECK (subscriber_id = auth.uid());

-- RLS Policies for exclusive posts
CREATE POLICY "Subscribers can view posts they have access to"
  ON public.creator_exclusive_posts FOR SELECT
  TO authenticated
  USING (
    is_published = true AND
    (
      creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()) OR
      EXISTS (
        SELECT 1 FROM public.creator_memberships cm
        WHERE cm.subscriber_id = auth.uid()
        AND cm.creator_id = creator_exclusive_posts.creator_id
        AND cm.status = 'active'
        AND (tier_ids IS NULL OR cm.tier_id = ANY(tier_ids))
      )
    )
  );

CREATE POLICY "Creators can manage their posts"
  ON public.creator_exclusive_posts FOR ALL
  TO authenticated
  USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

-- RLS Policies for chat rooms
CREATE POLICY "Members can view chat rooms they have access to"
  ON public.creator_chat_rooms FOR SELECT
  TO authenticated
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.creator_memberships cm
      WHERE cm.subscriber_id = auth.uid()
      AND cm.creator_id = creator_chat_rooms.creator_id
      AND cm.status = 'active'
      AND (tier_ids IS NULL OR cm.tier_id = ANY(tier_ids))
    )
  );

CREATE POLICY "Creators can manage their chat rooms"
  ON public.creator_chat_rooms FOR ALL
  TO authenticated
  USING (creator_id IN (SELECT id FROM public.creator_profiles WHERE user_id = auth.uid()));

-- RLS Policies for chat messages
CREATE POLICY "Members can view messages in rooms they have access to"
  ON public.creator_chat_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.creator_chat_rooms cr
      JOIN public.creator_memberships cm ON cm.creator_id = cr.creator_id
      WHERE cr.id = room_id
      AND cm.subscriber_id = auth.uid()
      AND cm.status = 'active'
      AND (cr.tier_ids IS NULL OR cm.tier_id = ANY(cr.tier_ids))
    )
  );

CREATE POLICY "Members can post messages in rooms they have access to"
  ON public.creator_chat_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.creator_chat_rooms cr
      JOIN public.creator_memberships cm ON cm.creator_id = cr.creator_id
      WHERE cr.id = room_id
      AND cm.subscriber_id = auth.uid()
      AND cm.status = 'active'
      AND (cr.tier_ids IS NULL OR cm.tier_id = ANY(cr.tier_ids))
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_creator_profiles_updated_at
  BEFORE UPDATE ON public.creator_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creator_exclusive_posts_updated_at
  BEFORE UPDATE ON public.creator_exclusive_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();