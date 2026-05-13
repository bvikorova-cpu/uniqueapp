
ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS is_group BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_by UUID;

CREATE TABLE IF NOT EXISTS public.conversation_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  shared_post_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_cm_conv ON public.conversation_messages(conversation_id, created_at DESC);
ALTER TABLE public.conversation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cm_select" ON public.conversation_messages FOR SELECT USING (public.is_conversation_participant(conversation_id, auth.uid()));
CREATE POLICY "cm_insert" ON public.conversation_messages FOR INSERT WITH CHECK (auth.uid() = sender_id AND public.is_conversation_participant(conversation_id, auth.uid()));

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS banner_url TEXT;

CREATE TABLE IF NOT EXISTS public.profile_pinned_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  post_id UUID NOT NULL,
  position SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, post_id)
);
CREATE INDEX IF NOT EXISTS idx_pinned_user ON public.profile_pinned_posts(user_id);
ALTER TABLE public.profile_pinned_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pp_select" ON public.profile_pinned_posts FOR SELECT USING (true);
CREATE POLICY "pp_insert" ON public.profile_pinned_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pp_update" ON public.profile_pinned_posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pp_delete" ON public.profile_pinned_posts FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.enforce_pinned_limit()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF (SELECT count(*) FROM public.profile_pinned_posts WHERE user_id = NEW.user_id) >= 3 THEN
    RAISE EXCEPTION 'Maximum 3 pinned posts allowed';
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_pinned_limit ON public.profile_pinned_posts;
CREATE TRIGGER trg_pinned_limit BEFORE INSERT ON public.profile_pinned_posts
FOR EACH ROW EXECUTE FUNCTION public.enforce_pinned_limit();

CREATE TABLE IF NOT EXISTS public.profile_featured_links (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  icon TEXT,
  position SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_featured_user ON public.profile_featured_links(user_id);
ALTER TABLE public.profile_featured_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pfl_select" ON public.profile_featured_links FOR SELECT USING (true);
CREATE POLICY "pfl_insert" ON public.profile_featured_links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pfl_update" ON public.profile_featured_links FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "pfl_delete" ON public.profile_featured_links FOR DELETE USING (auth.uid() = user_id);
