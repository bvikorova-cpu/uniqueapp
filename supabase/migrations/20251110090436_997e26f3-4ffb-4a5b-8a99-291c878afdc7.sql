-- Add new customization columns to created_characters table
ALTER TABLE created_characters 
ADD COLUMN IF NOT EXISTS eye_color TEXT DEFAULT 'blue',
ADD COLUMN IF NOT EXISTS costume_color TEXT DEFAULT 'rainbow',
ADD COLUMN IF NOT EXISTS age_group TEXT DEFAULT 'kid',
ADD COLUMN IF NOT EXISTS personality TEXT DEFAULT 'brave';