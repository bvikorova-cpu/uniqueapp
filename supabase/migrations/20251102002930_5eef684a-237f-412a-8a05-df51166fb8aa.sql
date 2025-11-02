-- Coffee Cafes Table
CREATE TABLE IF NOT EXISTS public.coffee_cafes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url TEXT,
  business_tier TEXT DEFAULT 'free' CHECK (business_tier IN ('free', 'business')),
  business_subscription_expires_at TIMESTAMP WITH TIME ZONE,
  owner_user_id UUID,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coffee Check-ins Table
CREATE TABLE IF NOT EXISTS public.coffee_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cafe_id UUID NOT NULL REFERENCES public.coffee_cafes(id) ON DELETE CASCADE,
  photo_url TEXT,
  notes TEXT,
  drink_type TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coffee Reviews Table
CREATE TABLE IF NOT EXISTS public.coffee_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cafe_id UUID NOT NULL REFERENCES public.coffee_cafes(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photo_urls TEXT[],
  is_featured BOOLEAN DEFAULT false,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coffee User Profiles Table
CREATE TABLE IF NOT EXISTS public.coffee_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  favorite_coffee_types TEXT[],
  preferred_atmosphere TEXT[],
  budget_preference TEXT CHECK (budget_preference IN ('budget', 'moderate', 'premium')),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'premium')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  total_points INTEGER DEFAULT 0,
  total_checkins INTEGER DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  matches_remaining INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coffee Buddy Matches Table
CREATE TABLE IF NOT EXISTS public.coffee_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  match_score INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
  chat_enabled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Coffee Match Messages Table
CREATE TABLE IF NOT EXISTS public.coffee_match_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.coffee_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coffee Events Table
CREATE TABLE IF NOT EXISTS public.coffee_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organizer_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  cafe_id UUID REFERENCES public.coffee_cafes(id) ON DELETE SET NULL,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER DEFAULT 10,
  ticket_price DECIMAL(10, 2) DEFAULT 0,
  image_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Coffee Event Participants Table
CREATE TABLE IF NOT EXISTS public.coffee_event_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID NOT NULL REFERENCES public.coffee_events(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id)
);

-- Coffee Achievements/Badges Table
CREATE TABLE IF NOT EXISTS public.coffee_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  points_required INTEGER,
  achievement_type TEXT CHECK (achievement_type IN ('checkins', 'reviews', 'social', 'explorer')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User Coffee Achievements Table
CREATE TABLE IF NOT EXISTS public.user_coffee_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.coffee_achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Coffee Ads/Promotions Table
CREATE TABLE IF NOT EXISTS public.coffee_ads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cafe_id UUID NOT NULL REFERENCES public.coffee_cafes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  target_url TEXT,
  budget DECIMAL(10, 2) DEFAULT 0,
  spent DECIMAL(10, 2) DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,
  impressions_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.coffee_cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_match_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_coffee_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coffee_ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for coffee_cafes
CREATE POLICY "Cafes are viewable by everyone"
  ON public.coffee_cafes FOR SELECT
  USING (true);

CREATE POLICY "Users can create cafes"
  ON public.coffee_cafes FOR INSERT
  WITH CHECK (auth.uid() = owner_user_id);

CREATE POLICY "Cafe owners can update their cafes"
  ON public.coffee_cafes FOR UPDATE
  USING (auth.uid() = owner_user_id);

-- RLS Policies for coffee_checkins
CREATE POLICY "Checkins are viewable by everyone"
  ON public.coffee_checkins FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own checkins"
  ON public.coffee_checkins FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own checkins"
  ON public.coffee_checkins FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own checkins"
  ON public.coffee_checkins FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for coffee_reviews
CREATE POLICY "Reviews are viewable by everyone"
  ON public.coffee_reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own reviews"
  ON public.coffee_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
  ON public.coffee_reviews FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
  ON public.coffee_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for coffee_profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.coffee_profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own profile"
  ON public.coffee_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.coffee_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for coffee_matches
CREATE POLICY "Users can view their own matches"
  ON public.coffee_matches FOR SELECT
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can create matches"
  ON public.coffee_matches FOR INSERT
  WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Users can update their matches"
  ON public.coffee_matches FOR UPDATE
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- RLS Policies for coffee_match_messages
CREATE POLICY "Users can view messages in their matches"
  ON public.coffee_match_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coffee_matches
      WHERE id = match_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON public.coffee_match_messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.coffee_matches
      WHERE id = match_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
      AND status = 'accepted'
    )
  );

-- RLS Policies for coffee_events
CREATE POLICY "Events are viewable by everyone"
  ON public.coffee_events FOR SELECT
  USING (true);

CREATE POLICY "Users can create events"
  ON public.coffee_events FOR INSERT
  WITH CHECK (auth.uid() = organizer_id);

CREATE POLICY "Event organizers can update their events"
  ON public.coffee_events FOR UPDATE
  USING (auth.uid() = organizer_id);

-- RLS Policies for coffee_event_participants
CREATE POLICY "Participants can view event participants"
  ON public.coffee_event_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join events"
  ON public.coffee_event_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for coffee_achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON public.coffee_achievements FOR SELECT
  USING (true);

-- RLS Policies for user_coffee_achievements
CREATE POLICY "User achievements are viewable by everyone"
  ON public.user_coffee_achievements FOR SELECT
  USING (true);

CREATE POLICY "Users can earn achievements"
  ON public.user_coffee_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for coffee_ads
CREATE POLICY "Active ads are viewable by everyone"
  ON public.coffee_ads FOR SELECT
  USING (is_active = true);

CREATE POLICY "Cafe owners can create ads"
  ON public.coffee_ads FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coffee_cafes
      WHERE id = cafe_id AND owner_user_id = auth.uid()
    )
  );

CREATE POLICY "Cafe owners can update their ads"
  ON public.coffee_ads FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.coffee_cafes
      WHERE id = cafe_id AND owner_user_id = auth.uid()
    )
  );

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION public.update_coffee_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_coffee_cafes_updated_at
  BEFORE UPDATE ON public.coffee_cafes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coffee_updated_at_column();

CREATE TRIGGER update_coffee_reviews_updated_at
  BEFORE UPDATE ON public.coffee_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coffee_updated_at_column();

CREATE TRIGGER update_coffee_profiles_updated_at
  BEFORE UPDATE ON public.coffee_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coffee_updated_at_column();

CREATE TRIGGER update_coffee_matches_updated_at
  BEFORE UPDATE ON public.coffee_matches
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coffee_updated_at_column();

CREATE TRIGGER update_coffee_events_updated_at
  BEFORE UPDATE ON public.coffee_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_coffee_updated_at_column();

-- Insert sample achievements
INSERT INTO public.coffee_achievements (name, description, icon_url, points_required, achievement_type) VALUES
('First Sip', 'Complete your first coffee check-in', '☕', 0, 'checkins'),
('Coffee Explorer', 'Check in at 10 different cafes', '🗺️', 100, 'explorer'),
('Coffee Critic', 'Write 5 detailed reviews', '✍️', 50, 'reviews'),
('Social Butterfly', 'Match with 5 coffee buddies', '🦋', 75, 'social'),
('Regular', 'Check in 20 times', '⭐', 200, 'checkins'),
('Master Taster', 'Write 25 reviews', '👑', 250, 'reviews'),
('Coffee Connoisseur', 'Visit 50 different cafes', '🏆', 500, 'explorer');