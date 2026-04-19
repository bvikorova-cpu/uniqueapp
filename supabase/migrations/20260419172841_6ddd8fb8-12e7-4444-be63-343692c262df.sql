CREATE TABLE IF NOT EXISTS public.anonymous_dating_match_meta (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.anonymous_dating_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  mood TEXT,
  theme TEXT DEFAULT 'midnight',
  streak_count INTEGER NOT NULL DEFAULT 0,
  last_message_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_match_meta_match ON public.anonymous_dating_match_meta(match_id);

ALTER TABLE public.anonymous_dating_match_meta ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read match meta"
ON public.anonymous_dating_match_meta FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.anonymous_dating_matches mt
    WHERE mt.id = anonymous_dating_match_meta.match_id
      AND (mt.user1_id = auth.uid() OR mt.user2_id = auth.uid())
  )
);

CREATE POLICY "User inserts own match meta"
ON public.anonymous_dating_match_meta FOR INSERT
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.anonymous_dating_matches mt
    WHERE mt.id = anonymous_dating_match_meta.match_id
      AND (mt.user1_id = auth.uid() OR mt.user2_id = auth.uid())
  )
);

CREATE POLICY "User updates own match meta"
ON public.anonymous_dating_match_meta FOR UPDATE
USING (user_id = auth.uid());

CREATE TRIGGER set_match_meta_updated_at
BEFORE UPDATE ON public.anonymous_dating_match_meta
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_dating_match_meta;
ALTER TABLE public.anonymous_dating_match_meta REPLICA IDENTITY FULL;
