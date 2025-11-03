-- Add coins column to profiles table for paint by numbers monetization

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 100;