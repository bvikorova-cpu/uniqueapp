-- Add columns to post_comments for enhanced features
ALTER TABLE post_comments 
ADD COLUMN IF NOT EXISTS image_url TEXT,
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS feeling TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS tagged_friends UUID[] DEFAULT '{}';