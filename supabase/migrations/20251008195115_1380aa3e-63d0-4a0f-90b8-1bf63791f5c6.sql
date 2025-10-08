-- Add image_url column to skill_offerings table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'skill_offerings' AND column_name = 'image_url'
  ) THEN
    ALTER TABLE skill_offerings ADD COLUMN image_url TEXT;
  END IF;
END $$;