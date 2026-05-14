-- Live chat bans
CREATE TABLE IF NOT EXISTS public.live_chat_bans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL,
  banned_user_id UUID NOT NULL,
  banned_by UUID NOT NULL,
  reason TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (stream_id, banned_user_id)
);
CREATE INDEX IF NOT EXISTS idx_live_chat_bans_stream ON public.live_chat_bans(stream_id);
ALTER TABLE public.live_chat_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Banned user or moderator can view"
  ON public.live_chat_bans FOR SELECT TO authenticated
  USING (auth.uid() = banned_user_id OR auth.uid() = banned_by);

CREATE POLICY "Moderator can create"
  ON public.live_chat_bans FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = banned_by);

CREATE POLICY "Moderator can delete"
  ON public.live_chat_bans FOR DELETE TO authenticated
  USING (auth.uid() = banned_by);

-- Live super chats (paid highlighted chat)
CREATE TABLE IF NOT EXISTS public.live_super_chats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  amount_cents INT NOT NULL CHECK (amount_cents > 0),
  message TEXT,
  highlight_color TEXT NOT NULL DEFAULT '#a855f7',
  duration_seconds INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_live_super_chats_stream ON public.live_super_chats(stream_id, created_at DESC);
ALTER TABLE public.live_super_chats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view super chats"
  ON public.live_super_chats FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "Sender can create own super chat"
  ON public.live_super_chats FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

-- Live recordings (archived streams)
CREATE TABLE IF NOT EXISTS public.live_recordings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  stream_id UUID NOT NULL,
  owner_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  playback_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT NOT NULL DEFAULT 0,
  views_count INT NOT NULL DEFAULT 0,
  is_public BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_live_recordings_owner ON public.live_recordings(owner_id, created_at DESC);
ALTER TABLE public.live_recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public recordings are viewable"
  ON public.live_recordings FOR SELECT TO authenticated
  USING (is_public = true OR auth.uid() = owner_id);

CREATE POLICY "Owner can create"
  ON public.live_recordings FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owner can update"
  ON public.live_recordings FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY "Owner can delete"
  ON public.live_recordings FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);