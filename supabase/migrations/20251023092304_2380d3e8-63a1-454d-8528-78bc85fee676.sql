-- Add missing columns to mystery_boxes table
ALTER TABLE mystery_boxes 
ADD COLUMN min_rarity_level integer NOT NULL DEFAULT 1,
ADD COLUMN max_rarity_level integer NOT NULL DEFAULT 3,
ADD COLUMN is_active boolean NOT NULL DEFAULT true;

-- Update existing boxes with appropriate rarity levels
-- Basic box: Common to Rare (1-3)
UPDATE mystery_boxes 
SET min_rarity_level = 1, max_rarity_level = 3 
WHERE price = 100;

-- Premium box: Uncommon to Epic (2-4)
UPDATE mystery_boxes 
SET min_rarity_level = 2, max_rarity_level = 4 
WHERE price = 250;

-- Legendary box: Rare to Legendary (3-5)
UPDATE mystery_boxes 
SET min_rarity_level = 3, max_rarity_level = 5 
WHERE price = 500;