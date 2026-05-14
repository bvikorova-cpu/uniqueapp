-- Story replies (DM-style replies to a story)
CREATE TABLE IF NOT EXISTS public.story_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  recipient_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_story_replies_story ON public.story_replies(story_id);
CREATE INDEX IF NOT EXISTS idx_story_replies_recipient ON public.story_replies(recipient_id, created_at DESC);

ALTER TABLE public.story_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sender or recipient can view"
  ON public.story_replies FOR SELECT TO authenticated
  USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated can send"
  ON public.story_replies FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Recipient can mark read"
  ON public.story_replies FOR UPDATE TO authenticated
  USING (auth.uid() = recipient_id);

CREATE POLICY "Sender can delete"
  ON public.story_replies FOR DELETE TO authenticated
  USING (auth.uid() = sender_id);

-- Story analytics aggregate (per story)
CREATE TABLE IF NOT EXISTS public.story_analytics (
  story_id UUID NOT NULL PRIMARY KEY,
  user_id UUID NOT NULL,
  views_count INT NOT NULL DEFAULT 0,
  unique_viewers INT NOT NULL DEFAULT 0,
  replies_count INT NOT NULL DEFAULT 0,
  reactions_count INT NOT NULL DEFAULT 0,
  shares_count INT NOT NULL DEFAULT 0,
  avg_view_duration_ms INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.story_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Story owner can view analytics"
  ON public.story_analytics FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can upsert analytics"
  ON public.story_analytics FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);