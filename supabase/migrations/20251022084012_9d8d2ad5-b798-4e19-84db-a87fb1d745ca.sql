-- Add audio track support to videos table
ALTER TABLE public.videos 
ADD COLUMN audio_track_url TEXT,
ADD COLUMN audio_track_name TEXT;

COMMENT ON COLUMN public.videos.audio_track_url IS 'Optional background music URL';
COMMENT ON COLUMN public.videos.audio_track_name IS 'Original name of the audio file';