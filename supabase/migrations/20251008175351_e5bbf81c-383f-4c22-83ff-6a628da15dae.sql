-- Add super likes table
CREATE TABLE IF NOT EXISTS public.dating_super_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  swiper_id UUID NOT NULL,
  swiped_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(swiper_id, swiped_id)
);

ALTER TABLE public.dating_super_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own super likes"
  ON public.dating_super_likes FOR SELECT
  USING (auth.uid() = swiper_id);

CREATE POLICY "Users can create super likes"
  ON public.dating_super_likes FOR INSERT
  WITH CHECK (auth.uid() = swiper_id);

-- Add gifts table
CREATE TABLE IF NOT EXISTS public.dating_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 1.00,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default gifts
INSERT INTO public.dating_gifts (name, icon, price) VALUES
  ('Růže', '🌹', 1.00),
  ('Srdce', '❤️', 0.50),
  ('Čokoláda', '🍫', 1.50),
  ('Šampaňské', '🍾', 3.00),
  ('Diamant', '💎', 5.00),
  ('Hvězda', '⭐', 2.00),
  ('Plyšák', '🧸', 2.50),
  ('Květina', '🌺', 1.00)
ON CONFLICT DO NOTHING;

ALTER TABLE public.dating_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view gifts"
  ON public.dating_gifts FOR SELECT
  USING (true);

-- Add sent gifts table
CREATE TABLE IF NOT EXISTS public.dating_sent_gifts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  gift_id UUID NOT NULL REFERENCES public.dating_gifts(id),
  match_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dating_sent_gifts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view gifts in their matches"
  ON public.dating_sent_gifts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dating_matches
      WHERE id = dating_sent_gifts.match_id
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send gifts"
  ON public.dating_sent_gifts FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Add rewind feature - track last swipe
CREATE TABLE IF NOT EXISTS public.dating_last_swipe (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  swiped_profile_id UUID NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.dating_last_swipe ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their last swipe"
  ON public.dating_last_swipe FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their last swipe"
  ON public.dating_last_swipe FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Update dating_messages to track read status
ALTER TABLE public.dating_messages 
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP WITH TIME ZONE;

-- Add likes_you tracking (who liked you but you haven't seen yet)
CREATE TABLE IF NOT EXISTS public.dating_likes_you (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  liker_id UUID NOT NULL,
  liked_id UUID NOT NULL,
  seen BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(liker_id, liked_id)
);

ALTER TABLE public.dating_likes_you ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view who liked them"
  ON public.dating_likes_you FOR SELECT
  USING (auth.uid() = liked_id);

CREATE POLICY "System can create likes_you records"
  ON public.dating_likes_you FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update seen status"
  ON public.dating_likes_you FOR UPDATE
  USING (auth.uid() = liked_id);