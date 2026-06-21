-- Music tracks (referenced by MusicUpload.tsx)
CREATE TABLE IF NOT EXISTS public.music_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  audio_url TEXT NOT NULL,
  cover_url TEXT,
  price_cents INT NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'eur',
  status TEXT NOT NULL DEFAULT 'published',
  stream_count BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.music_tracks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.music_tracks TO authenticated;
GRANT ALL ON public.music_tracks TO service_role;
ALTER TABLE public.music_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read published tracks" ON public.music_tracks FOR SELECT
  USING (status = 'published' OR auth.uid() = creator_id);
CREATE POLICY "creator insert track" ON public.music_tracks FOR INSERT
  WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "creator update own track" ON public.music_tracks FOR UPDATE
  USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "creator delete own track" ON public.music_tracks FOR DELETE
  USING (auth.uid() = creator_id);

-- Bazaar saved searches
CREATE TABLE IF NOT EXISTS public.bazaar_saved_searches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  query TEXT,
  filters JSONB NOT NULL DEFAULT '{}'::jsonb,
  notify BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.bazaar_saved_searches TO authenticated;
GRANT ALL ON public.bazaar_saved_searches TO service_role;
ALTER TABLE public.bazaar_saved_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own saved searches" ON public.bazaar_saved_searches
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Music streams
CREATE TABLE IF NOT EXISTS public.music_streams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.music_tracks(id) ON DELETE CASCADE,
  listener_id UUID,
  duration_ms INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.music_streams TO authenticated;
GRANT SELECT, INSERT ON public.music_streams TO anon;
GRANT ALL ON public.music_streams TO service_role;
ALTER TABLE public.music_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "insert streams" ON public.music_streams FOR INSERT WITH CHECK (true);
CREATE POLICY "read own streams" ON public.music_streams FOR SELECT USING (
  auth.uid() = listener_id OR EXISTS (
    SELECT 1 FROM public.music_tracks t WHERE t.id = track_id AND t.creator_id = auth.uid()
  )
);
CREATE INDEX IF NOT EXISTS idx_music_streams_track ON public.music_streams(track_id, created_at DESC);

-- Music royalties ledger
CREATE TABLE IF NOT EXISTS public.music_royalties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL,
  track_id UUID NOT NULL,
  amount_cents INT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.music_royalties TO authenticated;
GRANT ALL ON public.music_royalties TO service_role;
ALTER TABLE public.music_royalties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own royalties" ON public.music_royalties FOR SELECT USING (auth.uid() = creator_id);

-- Spa deposits
CREATE TABLE IF NOT EXISTS public.spa_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  booking_id UUID,
  salon_id UUID,
  amount_cents INT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  stripe_session_id TEXT,
  stripe_payment_intent TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.spa_deposits TO authenticated;
GRANT ALL ON public.spa_deposits TO service_role;
ALTER TABLE public.spa_deposits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read own deposits" ON public.spa_deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert own deposits" ON public.spa_deposits FOR INSERT WITH CHECK (auth.uid() = user_id);
