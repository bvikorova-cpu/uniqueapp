-- Add seasonal and limited edition fields to existing premium tables
ALTER TABLE premium_badges ADD COLUMN IF NOT EXISTS season TEXT;
ALTER TABLE premium_badges ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN DEFAULT false;
ALTER TABLE premium_badges ADD COLUMN IF NOT EXISTS available_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE premium_badges ADD COLUMN IF NOT EXISTS total_supply INTEGER;
ALTER TABLE premium_badges ADD COLUMN IF NOT EXISTS minted_count INTEGER DEFAULT 0;

ALTER TABLE premium_avatars ADD COLUMN IF NOT EXISTS season TEXT;
ALTER TABLE premium_avatars ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN DEFAULT false;
ALTER TABLE premium_avatars ADD COLUMN IF NOT EXISTS available_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE premium_avatars ADD COLUMN IF NOT EXISTS total_supply INTEGER;
ALTER TABLE premium_avatars ADD COLUMN IF NOT EXISTS minted_count INTEGER DEFAULT 0;

ALTER TABLE premium_themes ADD COLUMN IF NOT EXISTS season TEXT;
ALTER TABLE premium_themes ADD COLUMN IF NOT EXISTS is_limited_edition BOOLEAN DEFAULT false;
ALTER TABLE premium_themes ADD COLUMN IF NOT EXISTS available_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE premium_themes ADD COLUMN IF NOT EXISTS total_supply INTEGER;
ALTER TABLE premium_themes ADD COLUMN IF NOT EXISTS minted_count INTEGER DEFAULT 0;

-- Create collectible trades table
CREATE TABLE IF NOT EXISTS collectible_trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- What sender offers
  offered_badge_id UUID REFERENCES premium_badges(id),
  offered_avatar_id UUID REFERENCES premium_avatars(id),
  offered_theme_id UUID REFERENCES premium_themes(id),
  offered_credits INTEGER DEFAULT 0,
  
  -- What sender wants
  requested_badge_id UUID REFERENCES premium_badges(id),
  requested_avatar_id UUID REFERENCES premium_avatars(id),
  requested_theme_id UUID REFERENCES premium_themes(id),
  requested_credits INTEGER DEFAULT 0,
  
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT at_least_one_offer CHECK (
    offered_badge_id IS NOT NULL OR 
    offered_avatar_id IS NOT NULL OR 
    offered_theme_id IS NOT NULL OR 
    offered_credits > 0
  ),
  CONSTRAINT at_least_one_request CHECK (
    requested_badge_id IS NOT NULL OR 
    requested_avatar_id IS NOT NULL OR 
    requested_theme_id IS NOT NULL OR 
    requested_credits > 0
  )
);

-- Enable RLS on collectible_trades
ALTER TABLE collectible_trades ENABLE ROW LEVEL SECURITY;

-- RLS policies for trades
CREATE POLICY "Users can view their trades"
  ON collectible_trades FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create trades"
  ON collectible_trades FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can update their trades"
  ON collectible_trades FOR UPDATE
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can delete their pending trades"
  ON collectible_trades FOR DELETE
  USING (auth.uid() = sender_id AND status = 'pending');

-- Insert sample premium badges with different rarities
INSERT INTO premium_badges (name, description, icon, credit_cost, rarity, is_active, season, is_limited_edition, available_until, total_supply)
VALUES 
  ('Early Adopter', 'First wave community member', '🌟', 50, 'legendary', true, 'Season 1', true, NOW() + INTERVAL '30 days', 100),
  ('Beta Tester', 'Helped test new features', '🧪', 30, 'rare', true, 'Season 1', false, NULL, NULL),
  ('Daily Warrior', 'Logged in for 30 days straight', '⚔️', 20, 'rare', true, NULL, false, NULL, NULL),
  ('Helpful Guide', 'Answered 100 questions', '💡', 15, 'common', true, NULL, false, NULL, NULL),
  ('Winter Champion', 'Winter season winner', '❄️', 100, 'legendary', true, 'Winter 2025', true, NOW() + INTERVAL '60 days', 50)
ON CONFLICT DO NOTHING;

-- Insert sample premium avatars
INSERT INTO premium_avatars (name, description, avatar_url, is_animated, credit_cost, rarity, is_active, season, is_limited_edition, total_supply)
VALUES 
  ('Cosmic Explorer', 'Animated space-themed avatar', '/avatars/cosmic.gif', true, 80, 'legendary', true, 'Space Collection', true, 75),
  ('Neon Warrior', 'Cyberpunk style avatar', '/avatars/neon.png', false, 40, 'rare', true, NULL, false, NULL),
  ('Golden Crown', 'Premium gold-themed avatar', '/avatars/gold.png', false, 60, 'rare', true, 'Royal Collection', true, 150),
  ('Pixel Hero', 'Retro pixel art avatar', '/avatars/pixel.png', false, 25, 'common', true, NULL, false, NULL)
ON CONFLICT DO NOTHING;

-- Insert sample premium themes
INSERT INTO premium_themes (name, description, credit_cost, theme_data, is_active, season, is_limited_edition, total_supply)
VALUES 
  ('Dark Galaxy', 'Space-themed dark mode', 70, '{"primary": "270 80% 60%", "background": "240 10% 10%"}', true, 'Space Collection', true, 200),
  ('Sunset Vibes', 'Warm orange and pink theme', 50, '{"primary": "25 95% 53%", "background": "0 0% 98%"}', true, NULL, false, NULL),
  ('Ocean Deep', 'Deep blue underwater theme', 45, '{"primary": "200 80% 50%", "background": "210 20% 15%"}', true, 'Ocean Collection', true, 300),
  ('Forest Green', 'Natural green theme', 35, '{"primary": "120 60% 50%", "background": "0 0% 100%"}', true, NULL, false, NULL)
ON CONFLICT DO NOTHING;