-- Create enum for talent categories
CREATE TYPE talent_category AS ENUM (
  'drawing',
  'funny_video',
  'life_advice',
  'tattoo',
  'training'
);

-- Add category column to talent_submissions
ALTER TABLE public.talent_submissions
ADD COLUMN category talent_category NOT NULL DEFAULT 'drawing';

-- Create index for better filtering performance
CREATE INDEX idx_talent_submissions_category ON public.talent_submissions(category);