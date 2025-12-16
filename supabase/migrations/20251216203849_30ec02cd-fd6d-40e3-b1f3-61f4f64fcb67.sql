-- Create pet mystery boxes table
CREATE TABLE IF NOT EXISTS public.pet_mystery_boxes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  possible_rewards JSONB NOT NULL DEFAULT '[]',
  image_emoji TEXT DEFAULT '📦',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.pet_mystery_boxes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view mystery boxes" 
ON public.pet_mystery_boxes 
FOR SELECT 
USING (true);

-- Add battle power accessories
INSERT INTO public.pet_accessories (name, description, accessory_type, rarity, is_premium, price, effect) VALUES
('Iron Shield', 'A sturdy iron shield. +10 Battle Power', 'armor', 'common', false, 15, '{"battle_power": 10}'),
('Steel Armor', 'Heavy steel plating. +20 Battle Power', 'armor', 'uncommon', false, 30, '{"battle_power": 20}'),
('Dragon Scale Armor', 'Made from dragon scales. +35 Battle Power', 'armor', 'rare', true, 75, '{"battle_power": 35}'),
('Obsidian Armor', 'Dark volcanic armor. +50 Battle Power', 'armor', 'epic', true, 150, '{"battle_power": 50}'),
('Celestial Armor', 'Heavenly protection. +80 Battle Power', 'armor', 'legendary', true, 350, '{"battle_power": 80}'),
('Wooden Sword', 'A basic training sword. +8 Battle Power', 'weapon', 'common', false, 12, '{"battle_power": 8}'),
('Bronze Claws', 'Sharp bronze claws. +15 Battle Power', 'weapon', 'uncommon', false, 25, '{"battle_power": 15}'),
('Silver Fangs', 'Enchanted silver fangs. +30 Battle Power', 'weapon', 'rare', true, 60, '{"battle_power": 30}'),
('Thunder Hammer', 'Electrified war hammer. +45 Battle Power', 'weapon', 'epic', true, 120, '{"battle_power": 45}'),
('Excalibur Jr.', 'A legendary miniature sword. +70 Battle Power', 'weapon', 'legendary', true, 300, '{"battle_power": 70}'),
('Leather Cap', 'Basic head protection. +5 Battle Power', 'helmet', 'common', false, 8, '{"battle_power": 5}'),
('Viking Helmet', 'Horned warrior helmet. +18 Battle Power', 'helmet', 'uncommon', false, 35, '{"battle_power": 18}'),
('Knight Visor', 'Royal knights visor. +28 Battle Power', 'helmet', 'rare', true, 70, '{"battle_power": 28}'),
('Phoenix Crest', 'Burning phoenix helmet. +42 Battle Power', 'helmet', 'epic', true, 130, '{"battle_power": 42}'),
('Crown of Champions', 'Ultimate battle crown. +65 Battle Power', 'helmet', 'legendary', true, 280, '{"battle_power": 65}'),
('Running Shoes', 'Quick movement. +6 Battle Power', 'boots', 'common', false, 10, '{"battle_power": 6}'),
('Combat Boots', 'Military grade boots. +14 Battle Power', 'boots', 'uncommon', false, 28, '{"battle_power": 14}'),
('Winged Sandals', 'Hermes-inspired sandals. +25 Battle Power', 'boots', 'rare', true, 55, '{"battle_power": 25}'),
('Lava Stompers', 'Volcanic power boots. +38 Battle Power', 'boots', 'epic', true, 110, '{"battle_power": 38}'),
('Void Walkers', 'Teleportation boots. +55 Battle Power', 'boots', 'legendary', true, 250, '{"battle_power": 55}'),
('Lucky Charm', 'A simple lucky charm. +7 Battle Power', 'amulet', 'common', false, 12, '{"battle_power": 7}'),
('Crystal Pendant', 'Glowing crystal. +16 Battle Power', 'amulet', 'uncommon', false, 32, '{"battle_power": 16}'),
('Ancient Talisman', 'Mystical protection. +32 Battle Power', 'amulet', 'rare', true, 65, '{"battle_power": 32}'),
('Soul Stone', 'Contains powerful soul energy. +48 Battle Power', 'amulet', 'epic', true, 140, '{"battle_power": 48}'),
('Infinity Amulet', 'Ultimate cosmic power. +75 Battle Power', 'amulet', 'legendary', true, 320, '{"battle_power": 75}');

-- Insert 15 mystery boxes
INSERT INTO public.pet_mystery_boxes (name, description, price, rarity, possible_rewards, image_emoji) VALUES
('Bronze Box', 'Basic mystery box with common items', 20, 'common', '["common_accessory", "10_credits"]', '📦'),
('Silver Box', 'Contains uncommon surprises', 40, 'common', '["common_accessory", "uncommon_accessory", "25_credits"]', '🎁'),
('Gold Box', 'Rare treasures inside!', 75, 'uncommon', '["uncommon_accessory", "rare_accessory", "50_credits"]', '🎀'),
('Diamond Box', 'Premium rewards await!', 120, 'uncommon', '["rare_accessory", "epic_accessory", "100_credits"]', '💎'),
('Platinum Box', 'Elite mystery box', 180, 'rare', '["rare_accessory", "epic_accessory", "legendary_accessory", "150_credits"]', '⭐'),
('Warrior Box', 'Battle gear focused', 100, 'rare', '["armor", "weapon", "helmet"]', '⚔️'),
('Guardian Box', 'Defense equipment', 90, 'rare', '["armor", "helmet", "boots"]', '🛡️'),
('Speed Box', 'Agility focused items', 85, 'uncommon', '["boots", "amulet", "50_credits"]', '💨'),
('Mystic Box', 'Magical accessories', 110, 'rare', '["amulet", "effect", "75_credits"]', '🔮'),
('Royal Box', 'Premium royal items', 200, 'epic', '["epic_accessory", "legendary_accessory", "200_credits"]', '👑'),
('Dragon Box', 'Dragon-themed rewards', 250, 'epic', '["epic_accessory", "legendary_accessory", "rare_pet"]', '🐉'),
('Phoenix Box', 'Rise from ashes!', 300, 'epic', '["legendary_accessory", "300_credits", "rare_pet"]', '🔥'),
('Celestial Box', 'Heavenly treasures', 400, 'legendary', '["legendary_accessory", "500_credits", "epic_pet"]', '✨'),
('Void Box', 'Unknown cosmic powers', 500, 'legendary', '["legendary_accessory", "legendary_pet", "1000_credits"]', '🌌'),
('Infinity Box', 'Ultimate rewards!', 750, 'legendary', '["legendary_accessory", "legendary_pet", "2000_credits", "exclusive_title"]', '♾️');