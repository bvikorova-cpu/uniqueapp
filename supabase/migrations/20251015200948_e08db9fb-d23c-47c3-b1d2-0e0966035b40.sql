-- Add stream_url field to live_streams table for HLS streaming
ALTER TABLE public.live_streams
  ADD COLUMN IF NOT EXISTS stream_url TEXT;