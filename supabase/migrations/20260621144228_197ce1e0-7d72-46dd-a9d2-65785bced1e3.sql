ALTER TABLE public.music_streams ADD COLUMN IF NOT EXISTS royalty_id uuid REFERENCES public.music_royalties(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_music_streams_royalty_null ON public.music_streams(track_id) WHERE royalty_id IS NULL;

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;