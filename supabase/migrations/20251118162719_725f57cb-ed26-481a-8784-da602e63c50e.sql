-- Add foreign key relationship between videos and profiles
ALTER TABLE videos
ADD CONSTRAINT videos_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES profiles(id)
ON DELETE CASCADE;