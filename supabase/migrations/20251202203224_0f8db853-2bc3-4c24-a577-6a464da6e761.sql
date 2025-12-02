
-- Social Gifts Hub Enhancement Tables

-- User progress and levels
CREATE TABLE IF NOT EXISTS public.social_gifts_user_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  level INTEGER DEFAULT 1,
  current_xp INTEGER DEFAULT 0,
  total_xp INTEGER DEFAULT 0,
  gifts_sent INTEGER DEFAULT 0,
  gifts_received INTEGER DEFAULT 0,
  total_credits_spent INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_gift_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Badge definitions
CREATE TABLE IF NOT EXISTS public.social_gifts_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  xp_reward INTEGER DEFAULT 50,
  rarity TEXT DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User earned badges
CREATE TABLE IF NOT EXISTS public.social_gifts_user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.social_gifts_badges(id),
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Gift reactions
CREATE TABLE IF NOT EXISTS public.social_gifts_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  gift_id UUID NOT NULL REFERENCES public.secret_santa_gifts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(gift_id, user_id)
);

-- Mystery box history
CREATE TABLE IF NOT EXISTS public.social_gifts_mystery_boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  box_tier TEXT NOT NULL,
  cost INTEGER NOT NULL,
  revealed_gift_type TEXT,
  revealed_gift_value INTEGER,
  message TEXT,
  is_anonymous BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- AI generated messages history
CREATE TABLE IF NOT EXISTS public.social_gifts_ai_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message_type TEXT NOT NULL,
  prompt TEXT,
  generated_message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_gifts_user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_gifts_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_gifts_user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_gifts_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_gifts_mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_gifts_ai_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view all progress" ON public.social_gifts_user_progress FOR SELECT USING (true);
CREATE POLICY "Users can manage their own progress" ON public.social_gifts_user_progress FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view badges" ON public.social_gifts_badges FOR SELECT USING (true);

CREATE POLICY "Users can view all earned badges" ON public.social_gifts_user_badges FOR SELECT USING (true);
CREATE POLICY "Users can earn badges" ON public.social_gifts_user_badges FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view reactions" ON public.social_gifts_reactions FOR SELECT USING (true);
CREATE POLICY "Users can add reactions" ON public.social_gifts_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their reactions" ON public.social_gifts_reactions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their mystery boxes" ON public.social_gifts_mystery_boxes FOR SELECT USING (auth.uid() = user_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send mystery boxes" ON public.social_gifts_mystery_boxes FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their AI messages" ON public.social_gifts_ai_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create AI messages" ON public.social_gifts_ai_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default badges
INSERT INTO public.social_gifts_badges (code, name, description, icon, requirement_type, requirement_value, xp_reward, rarity) VALUES
('first_gift', 'First Gift', 'Send your first gift', '🎁', 'gifts_sent', 1, 50, 'common'),
('gift_giver_10', 'Gift Enthusiast', 'Send 10 gifts', '🎊', 'gifts_sent', 10, 100, 'common'),
('gift_giver_50', 'Generous Soul', 'Send 50 gifts', '💝', 'gifts_sent', 50, 250, 'uncommon'),
('gift_giver_100', 'Santa Master', 'Send 100 gifts', '🎅', 'gifts_sent', 100, 500, 'rare'),
('gift_giver_500', 'Legendary Giver', 'Send 500 gifts', '👑', 'gifts_sent', 500, 1000, 'legendary'),
('romantic_10', 'Romantic Soul', 'Send 10 romantic gifts', '💕', 'category_romantic', 10, 150, 'uncommon'),
('luxury_5', 'High Roller', 'Send 5 luxury gifts', '💎', 'category_luxury', 5, 300, 'rare'),
('mythical_3', 'Myth Maker', 'Send 3 mythical creatures', '🦄', 'category_mythical', 3, 400, 'epic'),
('streak_7', '7 Day Streak', 'Send gifts 7 days in a row', '🔥', 'streak', 7, 200, 'uncommon'),
('streak_30', '30 Day Streak', 'Send gifts 30 days in a row', '⚡', 'streak', 30, 500, 'epic'),
('big_spender_100', 'Credit Champion', 'Spend 100 credits on gifts', '🏆', 'credits_spent', 100, 100, 'common'),
('big_spender_1000', 'Diamond Donor', 'Spend 1000 credits on gifts', '💠', 'credits_spent', 1000, 500, 'rare'),
('popular_10', 'Popular Person', 'Receive 10 gifts', '⭐', 'gifts_received', 10, 100, 'common'),
('popular_100', 'Gift Magnet', 'Receive 100 gifts', '🌟', 'gifts_received', 100, 400, 'rare'),
('mystery_master', 'Mystery Master', 'Send 5 mystery boxes', '🎲', 'mystery_boxes', 5, 250, 'uncommon'),
('level_10', 'Rising Star', 'Reach level 10', '📈', 'level', 10, 200, 'uncommon'),
('level_25', 'Gift Expert', 'Reach level 25', '🥇', 'level', 25, 400, 'rare'),
('level_50', 'Gift Master', 'Reach level 50', '🏅', 'level', 50, 750, 'epic'),
('level_100', 'Gift Legend', 'Reach level 100', '🌈', 'level', 100, 1500, 'legendary')
ON CONFLICT (code) DO NOTHING;

-- Add AI generated image URL column to gifts
ALTER TABLE public.secret_santa_gifts ADD COLUMN IF NOT EXISTS ai_generated_image_url TEXT;
ALTER TABLE public.secret_santa_gifts ADD COLUMN IF NOT EXISTS animation_type TEXT DEFAULT 'default';
