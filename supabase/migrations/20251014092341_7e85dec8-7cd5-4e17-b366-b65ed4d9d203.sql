-- Create enum for rarity levels
CREATE TYPE public.item_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');

-- Create mystery_boxes table
CREATE TABLE public.mystery_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create mystery_box_items table (possible items in boxes)
CREATE TABLE public.mystery_box_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  box_id UUID REFERENCES public.mystery_boxes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  item_name TEXT NOT NULL,
  item_data JSONB DEFAULT '{}'::jsonb,
  rarity public.item_rarity NOT NULL DEFAULT 'common',
  drop_chance NUMERIC NOT NULL DEFAULT 10.0,
  duration_days INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_mystery_boxes table (purchased boxes)
CREATE TABLE public.user_mystery_boxes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  box_id UUID REFERENCES public.mystery_boxes(id) ON DELETE CASCADE,
  purchased_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  opened_at TIMESTAMP WITH TIME ZONE,
  is_opened BOOLEAN DEFAULT false
);

-- Create mystery_box_rewards table (items won from boxes)
CREATE TABLE public.mystery_box_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  user_box_id UUID REFERENCES public.user_mystery_boxes(id) ON DELETE CASCADE,
  item_id UUID REFERENCES public.mystery_box_items(id) ON DELETE CASCADE,
  received_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true
);

-- Enable RLS
ALTER TABLE public.mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_box_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mystery_boxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mystery_box_rewards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for mystery_boxes
CREATE POLICY "Anyone can view boxes"
  ON public.mystery_boxes FOR SELECT
  USING (true);

-- RLS Policies for mystery_box_items
CREATE POLICY "Anyone can view box items"
  ON public.mystery_box_items FOR SELECT
  USING (true);

-- RLS Policies for user_mystery_boxes
CREATE POLICY "Users can view their boxes"
  ON public.user_mystery_boxes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their boxes"
  ON public.user_mystery_boxes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their boxes"
  ON public.user_mystery_boxes FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for mystery_box_rewards
CREATE POLICY "Users can view their rewards"
  ON public.mystery_box_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their rewards"
  ON public.mystery_box_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Insert sample mystery boxes
INSERT INTO public.mystery_boxes (name, description, price, icon) VALUES
('Basic Mystery Box', 'Základný box s náhodnými items', 100, '📦'),
('Premium Mystery Box', 'Premium box s vyššou šancou na rare items', 250, '🎁'),
('Legendary Mystery Box', 'Exkluzívny box s guaranteed epic+ items', 500, '💎');

-- Insert sample items for Basic Box
INSERT INTO public.mystery_box_items (box_id, item_type, item_name, rarity, drop_chance, duration_days, item_data) 
SELECT id, 'filter', 'Vintage Filter', 'common'::item_rarity, 40.0, 30, '{"effect": "vintage"}'::jsonb FROM mystery_boxes WHERE name = 'Basic Mystery Box'
UNION ALL
SELECT id, 'effect', 'Sparkle Effect', 'common'::item_rarity, 35.0, 30, '{"effect": "sparkle"}'::jsonb FROM mystery_boxes WHERE name = 'Basic Mystery Box'
UNION ALL
SELECT id, 'avatar', 'Cool Avatar Frame', 'rare'::item_rarity, 20.0, 30, '{"frame": "cool"}'::jsonb FROM mystery_boxes WHERE name = 'Basic Mystery Box'
UNION ALL
SELECT id, 'badge', 'Mystery Badge', 'epic'::item_rarity, 5.0, 30, '{"badge": "mystery"}'::jsonb FROM mystery_boxes WHERE name = 'Basic Mystery Box';

-- Insert sample items for Premium Box
INSERT INTO public.mystery_box_items (box_id, item_type, item_name, rarity, drop_chance, duration_days, item_data)
SELECT id, 'filter', 'Neon Glow Filter', 'rare'::item_rarity, 30.0, 30, '{"effect": "neon"}'::jsonb FROM mystery_boxes WHERE name = 'Premium Mystery Box'
UNION ALL
SELECT id, 'effect', 'Aurora Effect', 'rare'::item_rarity, 25.0, 30, '{"effect": "aurora"}'::jsonb FROM mystery_boxes WHERE name = 'Premium Mystery Box'
UNION ALL
SELECT id, 'avatar', 'Golden Frame', 'epic'::item_rarity, 25.0, 30, '{"frame": "golden"}'::jsonb FROM mystery_boxes WHERE name = 'Premium Mystery Box'
UNION ALL
SELECT id, 'theme', 'Dark Galaxy Theme', 'epic'::item_rarity, 15.0, 30, '{"theme": "galaxy"}'::jsonb FROM mystery_boxes WHERE name = 'Premium Mystery Box'
UNION ALL
SELECT id, 'badge', 'VIP Badge', 'legendary'::item_rarity, 5.0, 30, '{"badge": "vip"}'::jsonb FROM mystery_boxes WHERE name = 'Premium Mystery Box';

-- Insert sample items for Legendary Box
INSERT INTO public.mystery_box_items (box_id, item_type, item_name, rarity, drop_chance, duration_days, item_data)
SELECT id, 'filter', 'Rainbow Filter', 'epic'::item_rarity, 40.0, 30, '{"effect": "rainbow"}'::jsonb FROM mystery_boxes WHERE name = 'Legendary Mystery Box'
UNION ALL
SELECT id, 'effect', 'Cosmic Effect', 'epic'::item_rarity, 30.0, 30, '{"effect": "cosmic"}'::jsonb FROM mystery_boxes WHERE name = 'Legendary Mystery Box'
UNION ALL
SELECT id, 'avatar', 'Diamond Crown', 'legendary'::item_rarity, 20.0, 30, '{"frame": "diamond"}'::jsonb FROM mystery_boxes WHERE name = 'Legendary Mystery Box'
UNION ALL
SELECT id, 'badge', 'Legendary Champion', 'legendary'::item_rarity, 10.0, 30, '{"badge": "champion"}'::jsonb FROM mystery_boxes WHERE name = 'Legendary Mystery Box';