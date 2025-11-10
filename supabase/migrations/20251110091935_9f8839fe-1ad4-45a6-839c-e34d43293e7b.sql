-- Add gender column to created_characters table
ALTER TABLE created_characters 
ADD COLUMN IF NOT EXISTS gender TEXT DEFAULT 'hero';