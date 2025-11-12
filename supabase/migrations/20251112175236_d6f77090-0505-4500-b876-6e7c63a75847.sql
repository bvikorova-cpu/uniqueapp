-- Add category column to kids_stories table
ALTER TABLE public.kids_stories
ADD COLUMN category TEXT DEFAULT 'adventure' CHECK (category IN ('adventure', 'fantasy', 'educational', 'mystery', 'friendship', 'animal', 'space', 'fairy-tale'));