-- Create premium features table
CREATE TABLE IF NOT EXISTS public.premium_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL UNIQUE,
  feature_type TEXT NOT NULL, -- 'story_effect', 'livestream_gift', 'ai_conversation', 'dating_gift', 'badge', 'theme', 'avatar', 'background'
  credit_cost INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  icon TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user premium purchases table
CREATE TABLE IF NOT EXISTS public.user_premium_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_id UUID REFERENCES public.premium_features(id),
  feature_name TEXT NOT NULL,
  credits_spent INTEGER NOT NULL,
  purchased_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create premium badges table
CREATE TABLE IF NOT EXISTS public.premium_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL,
  credit_cost INTEGER NOT NULL DEFAULT 50,
  rarity TEXT DEFAULT 'common', -- 'common', 'rare', 'epic', 'legendary'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user premium badges table
CREATE TABLE IF NOT EXISTS public.user_premium_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID REFERENCES public.premium_badges(id),
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  is_equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, badge_id)
);

-- Create premium themes table
CREATE TABLE IF NOT EXISTS public.premium_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  preview_image TEXT,
  theme_data JSONB NOT NULL, -- colors, fonts, etc.
  credit_cost INTEGER NOT NULL DEFAULT 100,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user premium themes table
CREATE TABLE IF NOT EXISTS public.user_premium_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  theme_id UUID REFERENCES public.premium_themes(id),
  is_active BOOLEAN DEFAULT false,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, theme_id)
);

-- Create premium avatars table
CREATE TABLE IF NOT EXISTS public.premium_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  avatar_url TEXT NOT NULL,
  is_animated BOOLEAN DEFAULT false,
  credit_cost INTEGER NOT NULL DEFAULT 75,
  rarity TEXT DEFAULT 'common',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create user premium avatars table
CREATE TABLE IF NOT EXISTS public.user_premium_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  avatar_id UUID REFERENCES public.premium_avatars(id),
  is_equipped BOOLEAN DEFAULT false,
  acquired_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, avatar_id)
);

-- Enable RLS
ALTER TABLE public.premium_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_premium_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_premium_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_premium_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.premium_avatars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_premium_avatars ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view active premium features"
  ON public.premium_features FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their purchases"
  ON public.user_premium_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create purchases"
  ON public.user_premium_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active premium badges"
  ON public.premium_badges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their badges"
  ON public.user_premium_badges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their badges"
  ON public.user_premium_badges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active themes"
  ON public.premium_themes FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their themes"
  ON public.user_premium_themes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their themes"
  ON public.user_premium_themes FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view active avatars"
  ON public.premium_avatars FOR SELECT
  USING (is_active = true);

CREATE POLICY "Users can view their avatars"
  ON public.user_premium_avatars FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their avatars"
  ON public.user_premium_avatars FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Insert initial premium features
INSERT INTO public.premium_features (feature_name, feature_type, credit_cost, description, icon) VALUES
  ('Premium Story Effect - Glitter', 'story_effect', 10, 'Add magical glitter effects to your stories', '✨'),
  ('Premium Story Effect - Fire', 'story_effect', 15, 'Add fire animation to your stories', '🔥'),
  ('Premium Story Effect - Snow', 'story_effect', 10, 'Add snow effect to your stories', '❄️'),
  ('Livestream Gift - Rose', 'livestream_gift', 5, 'Send a virtual rose during livestream', '🌹'),
  ('Livestream Gift - Diamond', 'livestream_gift', 50, 'Send a diamond gift during livestream', '💎'),
  ('Livestream Gift - Crown', 'livestream_gift', 100, 'Send a crown gift during livestream', '👑'),
  ('AI Friend Extra Conversations', 'ai_conversation', 20, 'Get 10 extra AI friend conversations', '💬'),
  ('Dating Virtual Gift - Heart', 'dating_gift', 10, 'Send a heart to your match', '❤️'),
  ('Dating Virtual Gift - Teddy Bear', 'dating_gift', 25, 'Send a teddy bear to your match', '🧸'),
  ('Dating AI Advice Session', 'ai_advice', 30, 'Get AI dating advice and tips', '💡'),
  ('Featured Listing - 3 Days', 'featured_listing', 50, 'Feature your listing for 3 days', '⭐'),
  ('Featured Listing - 7 Days', 'featured_listing', 100, 'Feature your listing for 7 days', '🌟'),
  ('Featured Listing - 14 Days', 'featured_listing', 175, 'Feature your listing for 14 days', '✨')
ON CONFLICT (feature_name) DO NOTHING;

-- Insert initial premium badges
INSERT INTO public.premium_badges (name, description, icon, credit_cost, rarity) VALUES
  ('Gold Star', 'Show off your premium status', '⭐', 50, 'rare'),
  ('Diamond Elite', 'For the most dedicated users', '💎', 150, 'epic'),
  ('Fire Legend', 'Legendary status badge', '🔥', 300, 'legendary'),
  ('Crown Master', 'Master of the platform', '👑', 200, 'epic'),
  ('Sparkle VIP', 'VIP member badge', '✨', 75, 'rare'),
  ('Heart Lover', 'Spread the love', '❤️', 40, 'common'),
  ('Rocket Pro', 'Pro user badge', '🚀', 100, 'rare'),
  ('Trophy Champion', 'Champion badge', '🏆', 250, 'legendary')
ON CONFLICT DO NOTHING;

-- Insert initial premium themes
INSERT INTO public.premium_themes (name, description, credit_cost, theme_data) VALUES
  ('Dark Galaxy', 'Beautiful dark theme with galaxy colors', 100, '{"primary": "240 10 3.9", "background": "222.2 84% 4.9%"}'),
  ('Ocean Breeze', 'Calming ocean-inspired theme', 100, '{"primary": "199 89% 48%", "background": "210 100% 98%"}'),
  ('Sunset Glow', 'Warm sunset colors', 125, '{"primary": "24 95% 53%", "background": "60 9.1% 97.8%"}'),
  ('Forest Green', 'Natural forest theme', 100, '{"primary": "142 76% 36%", "background": "0 0% 100%"}'),
  ('Royal Purple', 'Elegant purple theme', 150, '{"primary": "271 91% 65%", "background": "0 0% 100%"}')
ON CONFLICT DO NOTHING;

-- Insert initial premium avatars
INSERT INTO public.premium_avatars (name, description, avatar_url, is_animated, credit_cost, rarity) VALUES
  ('Animated Fire', 'Animated fire avatar border', '/avatars/fire.gif', true, 100, 'rare'),
  ('Golden Crown', 'Golden crown avatar frame', '/avatars/crown.png', false, 75, 'rare'),
  ('Diamond Frame', 'Diamond-encrusted avatar frame', '/avatars/diamond.png', false, 150, 'epic'),
  ('Sparkle Effect', 'Sparkle animated effect', '/avatars/sparkle.gif', true, 125, 'epic'),
  ('Rainbow Aura', 'Rainbow aura around avatar', '/avatars/rainbow.gif', true, 200, 'legendary'),
  ('Lightning Strike', 'Lightning animation', '/avatars/lightning.gif', true, 175, 'epic')
ON CONFLICT DO NOTHING;