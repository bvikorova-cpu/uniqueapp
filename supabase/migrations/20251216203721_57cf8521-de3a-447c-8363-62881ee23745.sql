-- Add new accessory types to enum
ALTER TYPE accessory_type ADD VALUE IF NOT EXISTS 'armor';
ALTER TYPE accessory_type ADD VALUE IF NOT EXISTS 'weapon';
ALTER TYPE accessory_type ADD VALUE IF NOT EXISTS 'helmet';
ALTER TYPE accessory_type ADD VALUE IF NOT EXISTS 'boots';
ALTER TYPE accessory_type ADD VALUE IF NOT EXISTS 'amulet';
ALTER TYPE accessory_type ADD VALUE IF NOT EXISTS 'shield';