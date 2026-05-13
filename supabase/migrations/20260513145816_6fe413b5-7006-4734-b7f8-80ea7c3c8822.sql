-- Audio spaces (scheduled rooms)
CREATE TABLE IF NOT EXISTS public.audio_spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  scheduled_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  recording_url text,
  transcript text,
  transcript_status text NOT NULL DEFAULT 'pending',
  status text NOT NULL DEFAULT 'scheduled',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audio_spaces_scheduled_at ON public.audio_spaces(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_audio_spaces_host ON public.audio_spaces(host_id);
ALTER TABLE public.audio_spaces ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Spaces readable by all"
  ON public.audio_spaces FOR SELECT USING (true);
CREATE POLICY "Hosts insert own spaces"
  ON public.audio_spaces FOR INSERT WITH CHECK (auth.uid() = host_id);
CREATE POLICY "Hosts update own spaces"
  ON public.audio_spaces FOR UPDATE USING (auth.uid() = host_id);
CREATE POLICY "Hosts delete own spaces"
  ON public.audio_spaces FOR DELETE USING (auth.uid() = host_id);

-- Live stream chat messages
CREATE TABLE IF NOT EXISTS public.live_stream_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lsm_live ON public.live_stream_messages(live_post_id, created_at);
ALTER TABLE public.live_stream_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Live messages readable by all"
  ON public.live_stream_messages FOR SELECT USING (true);
CREATE POLICY "Authenticated users can post live messages"
  ON public.live_stream_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own live messages"
  ON public.live_stream_messages FOR DELETE USING (auth.uid() = user_id);

-- Live tips
CREATE TABLE IF NOT EXISTS public.live_tips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  live_post_id uuid NOT NULL,
  tipper_id uuid NOT NULL,
  streamer_id uuid NOT NULL,
  amount_cents integer NOT NULL CHECK (amount_cents > 0),
  currency text NOT NULL DEFAULT 'eur',
  message text,
  stripe_session_id text,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_live_tips_live ON public.live_tips(live_post_id);
CREATE INDEX IF NOT EXISTS idx_live_tips_streamer ON public.live_tips(streamer_id);
ALTER TABLE public.live_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tips visible to streamer and tipper"
  ON public.live_tips FOR SELECT
  USING (auth.uid() = streamer_id OR auth.uid() = tipper_id);
CREATE POLICY "Users insert their own tips"
  ON public.live_tips FOR INSERT
  WITH CHECK (auth.uid() = tipper_id);

-- Video remixes (duet / stitch)
CREATE TABLE IF NOT EXISTS public.video_remixes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_post_id uuid NOT NULL,
  remix_post_id uuid NOT NULL,
  user_id uuid NOT NULL,
  remix_type text NOT NULL CHECK (remix_type IN ('duet','stitch')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_video_remixes_parent ON public.video_remixes(parent_post_id);
ALTER TABLE public.video_remixes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Remixes readable by all"
  ON public.video_remixes FOR SELECT USING (true);
CREATE POLICY "Users create own remixes"
  ON public.video_remixes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own remixes"
  ON public.video_remixes FOR DELETE USING (auth.uid() = user_id);

-- AR / CSS filter presets catalog
CREATE TABLE IF NOT EXISTS public.ar_filters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  css_filter text,
  sticker_url text,
  category text,
  is_premium boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.ar_filters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "AR filters readable by all"
  ON public.ar_filters FOR SELECT USING (true);

INSERT INTO public.ar_filters (name, css_filter, category) VALUES
  ('Vintage', 'sepia(0.6) contrast(1.1)', 'classic'),
  ('Cool', 'hue-rotate(180deg) saturate(1.3)', 'mood'),
  ('Dramatic', 'contrast(1.4) brightness(0.9) saturate(1.2)', 'mood'),
  ('B&W', 'grayscale(1) contrast(1.1)', 'classic'),
  ('Glow', 'brightness(1.15) saturate(1.4) blur(0.3px)', 'beauty'),
  ('Neon', 'saturate(2) hue-rotate(90deg) contrast(1.2)', 'fun')
ON CONFLICT DO NOTHING;