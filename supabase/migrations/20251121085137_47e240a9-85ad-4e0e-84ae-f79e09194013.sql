-- Enable RLS on all dating tables
ALTER TABLE public.dating_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_swipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_sent_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_last_swipe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_likes_you ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dating_super_likes ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view all active profiles" ON public.dating_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.dating_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.dating_profiles;
DROP POLICY IF EXISTS "Users can view own swipes" ON public.dating_swipes;
DROP POLICY IF EXISTS "Users can insert swipes" ON public.dating_swipes;
DROP POLICY IF EXISTS "Users can view own matches" ON public.dating_matches;
DROP POLICY IF EXISTS "Users can view messages in their matches" ON public.dating_messages;
DROP POLICY IF EXISTS "Users can insert messages in their matches" ON public.dating_messages;
DROP POLICY IF EXISTS "Users can update message read status" ON public.dating_messages;
DROP POLICY IF EXISTS "Everyone can view gift templates" ON public.dating_gifts;
DROP POLICY IF EXISTS "Users can view gifts they sent or received" ON public.dating_sent_gifts;
DROP POLICY IF EXISTS "Users can insert sent gifts" ON public.dating_sent_gifts;
DROP POLICY IF EXISTS "Users can view own subscription" ON public.dating_subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.dating_subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.dating_subscriptions;
DROP POLICY IF EXISTS "Users can view own last swipe" ON public.dating_last_swipe;
DROP POLICY IF EXISTS "Users can insert own last swipe" ON public.dating_last_swipe;
DROP POLICY IF EXISTS "Users can update own last swipe" ON public.dating_last_swipe;
DROP POLICY IF EXISTS "Users can view who liked them" ON public.dating_likes_you;
DROP POLICY IF EXISTS "Users can insert likes" ON public.dating_likes_you;
DROP POLICY IF EXISTS "Users can update seen status" ON public.dating_likes_you;
DROP POLICY IF EXISTS "Users can view own super likes" ON public.dating_super_likes;
DROP POLICY IF EXISTS "Users can insert super likes" ON public.dating_super_likes;

-- DATING PROFILES
CREATE POLICY "Users can view all active profiles"
ON public.dating_profiles FOR SELECT
USING (is_active = true);

CREATE POLICY "Users can update own profile"
ON public.dating_profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON public.dating_profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- DATING SWIPES
CREATE POLICY "Users can view own swipes"
ON public.dating_swipes FOR SELECT
USING (auth.uid() = swiper_id);

CREATE POLICY "Users can insert swipes"
ON public.dating_swipes FOR INSERT
WITH CHECK (auth.uid() = swiper_id);

-- DATING MATCHES
CREATE POLICY "Users can view own matches"
ON public.dating_matches FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- DATING MESSAGES
CREATE POLICY "Users can view messages in their matches"
ON public.dating_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.dating_matches
    WHERE id = dating_messages.match_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can insert messages in their matches"
ON public.dating_messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM public.dating_matches
    WHERE id = match_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

CREATE POLICY "Users can update message read status"
ON public.dating_messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.dating_matches
    WHERE id = dating_messages.match_id
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  )
);

-- DATING GIFTS (templates - public)
CREATE POLICY "Everyone can view gift templates"
ON public.dating_gifts FOR SELECT
USING (true);

-- DATING SENT GIFTS
CREATE POLICY "Users can view gifts they sent or received"
ON public.dating_sent_gifts FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can insert sent gifts"
ON public.dating_sent_gifts FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- DATING SUBSCRIPTIONS
CREATE POLICY "Users can view own subscription"
ON public.dating_subscriptions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
ON public.dating_subscriptions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
ON public.dating_subscriptions FOR UPDATE
USING (auth.uid() = user_id);

-- DATING LAST SWIPE
CREATE POLICY "Users can view own last swipe"
ON public.dating_last_swipe FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own last swipe"
ON public.dating_last_swipe FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own last swipe"
ON public.dating_last_swipe FOR UPDATE
USING (auth.uid() = user_id);

-- DATING LIKES YOU
CREATE POLICY "Users can view who liked them"
ON public.dating_likes_you FOR SELECT
USING (auth.uid() = liked_id);

CREATE POLICY "Users can insert likes"
ON public.dating_likes_you FOR INSERT
WITH CHECK (auth.uid() = liker_id);

CREATE POLICY "Users can update seen status"
ON public.dating_likes_you FOR UPDATE
USING (auth.uid() = liked_id);

-- DATING SUPER LIKES
CREATE POLICY "Users can view own super likes"
ON public.dating_super_likes FOR SELECT
USING (auth.uid() = swiper_id OR auth.uid() = swiped_id);

CREATE POLICY "Users can insert super likes"
ON public.dating_super_likes FOR INSERT
WITH CHECK (auth.uid() = swiper_id);