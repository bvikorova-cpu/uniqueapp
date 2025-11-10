-- Add sharing columns to stories table
ALTER TABLE public.stories
ADD COLUMN IF NOT EXISTS share_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS is_shareable BOOLEAN DEFAULT false;

-- Create index for share_code lookups
CREATE INDEX IF NOT EXISTS idx_stories_share_code ON public.stories(share_code)
WHERE share_code IS NOT NULL;

-- Update RLS policy to allow viewing of shareable stories
DROP POLICY IF EXISTS "Anyone can view shareable stories" ON public.stories;
CREATE POLICY "Anyone can view shareable stories" 
ON public.stories 
FOR SELECT 
USING (is_shareable = true AND share_code IS NOT NULL);

-- Function to generate unique share code
CREATE OR REPLACE FUNCTION public.generate_story_share_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.stories WHERE share_code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;