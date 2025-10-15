-- Update media_type check constraint to accept 'image' instead of 'photo'
ALTER TABLE talent_submissions DROP CONSTRAINT IF EXISTS talent_submissions_media_type_check;

ALTER TABLE talent_submissions 
ADD CONSTRAINT talent_submissions_media_type_check 
CHECK (media_type = ANY (ARRAY['image'::text, 'video'::text]));