-- Add video_url column to holographic_concerts
ALTER TABLE holographic_concerts 
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add sample video URLs
UPDATE holographic_concerts 
SET video_url = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'
WHERE video_url IS NULL;
