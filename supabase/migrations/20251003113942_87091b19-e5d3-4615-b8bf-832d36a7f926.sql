-- Create dating profiles table
CREATE TABLE public.dating_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  bio TEXT,
  age INTEGER NOT NULL CHECK (age >= 18 AND age <= 100),
  gender TEXT NOT NULL,
  looking_for TEXT NOT NULL,
  location TEXT,
  profile_photo_url TEXT,
  additional_photos TEXT[],
  interests TEXT[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dating subscriptions table
CREATE TABLE public.dating_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'active',
  price NUMERIC NOT NULL DEFAULT 2.00,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create swipes table (likes/dislikes)
CREATE TABLE public.dating_swipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swiper_id UUID NOT NULL,
  swiped_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('like', 'dislike')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

-- Create matches table
CREATE TABLE public.dating_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_id UUID NOT NULL,
  user2_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create dating messages table
CREATE TABLE public.dating_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID NOT NULL REFERENCES public.dating_matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.dating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dating_profiles
CREATE POLICY "Subscribed users can view active profiles" 
  ON public.dating_profiles 
  FOR SELECT 
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM public.dating_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Subscribed users can create their profile" 
  ON public.dating_profiles 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.dating_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

CREATE POLICY "Users can update their own profile" 
  ON public.dating_profiles 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile" 
  ON public.dating_profiles 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for dating_subscriptions
CREATE POLICY "Users can view their own subscription" 
  ON public.dating_subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription" 
  ON public.dating_subscriptions 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription" 
  ON public.dating_subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- RLS Policies for dating_swipes
CREATE POLICY "Users can view their own swipes" 
  ON public.dating_swipes 
  FOR SELECT 
  USING (auth.uid() = swiper_id);

CREATE POLICY "Subscribed users can create swipes" 
  ON public.dating_swipes 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = swiper_id AND
    EXISTS (
      SELECT 1 FROM public.dating_subscriptions 
      WHERE user_id = auth.uid() 
      AND status = 'active'
    )
  );

-- RLS Policies for dating_matches
CREATE POLICY "Users can view their matches" 
  ON public.dating_matches 
  FOR SELECT 
  USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "System can create matches" 
  ON public.dating_matches 
  FOR INSERT 
  WITH CHECK (true);

-- RLS Policies for dating_messages
CREATE POLICY "Users can view messages in their matches" 
  ON public.dating_messages 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.dating_matches 
      WHERE id = match_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches" 
  ON public.dating_messages 
  FOR INSERT 
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.dating_matches 
      WHERE id = match_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own messages" 
  ON public.dating_messages 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.dating_matches 
      WHERE id = match_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Create indexes
CREATE INDEX idx_dating_profiles_user_id ON public.dating_profiles(user_id);
CREATE INDEX idx_dating_subscriptions_user_id ON public.dating_subscriptions(user_id);
CREATE INDEX idx_dating_swipes_swiper_id ON public.dating_swipes(swiper_id);
CREATE INDEX idx_dating_swipes_swiped_id ON public.dating_swipes(swiped_id);
CREATE INDEX idx_dating_matches_user1_id ON public.dating_matches(user1_id);
CREATE INDEX idx_dating_matches_user2_id ON public.dating_matches(user2_id);
CREATE INDEX idx_dating_messages_match_id ON public.dating_messages(match_id);

-- Create triggers for updated_at
CREATE TRIGGER update_dating_profiles_updated_at
  BEFORE UPDATE ON public.dating_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dating_subscriptions_updated_at
  BEFORE UPDATE ON public.dating_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Function to create match when both users like each other
CREATE OR REPLACE FUNCTION public.check_and_create_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only proceed if it's a 'like' action
  IF NEW.action = 'like' THEN
    -- Check if the other user also liked this user
    IF EXISTS (
      SELECT 1 FROM public.dating_swipes
      WHERE swiper_id = NEW.swiped_id
      AND swiped_id = NEW.swiper_id
      AND action = 'like'
    ) THEN
      -- Create a match (ensure user1_id < user2_id for uniqueness)
      INSERT INTO public.dating_matches (user1_id, user2_id)
      VALUES (
        LEAST(NEW.swiper_id, NEW.swiped_id),
        GREATEST(NEW.swiper_id, NEW.swiped_id)
      )
      ON CONFLICT (user1_id, user2_id) DO NOTHING;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for automatic match creation
CREATE TRIGGER create_match_on_mutual_like
  AFTER INSERT ON public.dating_swipes
  FOR EACH ROW
  EXECUTE FUNCTION public.check_and_create_match();