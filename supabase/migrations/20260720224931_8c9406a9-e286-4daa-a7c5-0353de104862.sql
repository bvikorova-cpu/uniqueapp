
CREATE TABLE public.exclusive_forum_threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_locked BOOLEAN NOT NULL DEFAULT false,
  reply_count INTEGER NOT NULL DEFAULT 0,
  view_count INTEGER NOT NULL DEFAULT 0,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exclusive_forum_threads TO authenticated;
GRANT ALL ON public.exclusive_forum_threads TO service_role;
ALTER TABLE public.exclusive_forum_threads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read threads" ON public.exclusive_forum_threads FOR SELECT TO authenticated
  USING (public.is_exclusive_member(auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Members create threads" ON public.exclusive_forum_threads FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = author_id AND (public.is_exclusive_member(auth.uid()) OR public.has_role(auth.uid(),'admin')));
CREATE POLICY "Author or admin update" ON public.exclusive_forum_threads FOR UPDATE TO authenticated
  USING (auth.uid() = author_id OR public.has_role(auth.uid(),'admin'))
  WITH CHECK (auth.uid() = author_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Author or admin delete" ON public.exclusive_forum_threads FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_excl_threads_activity ON public.exclusive_forum_threads (is_pinned DESC, last_activity_at DESC);

CREATE TABLE public.exclusive_forum_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.exclusive_forum_threads(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pseudonym TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exclusive_forum_replies TO authenticated;
GRANT ALL ON public.exclusive_forum_replies TO service_role;
ALTER TABLE public.exclusive_forum_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members read replies" ON public.exclusive_forum_replies FOR SELECT TO authenticated
  USING (public.is_exclusive_member(auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Members create replies" ON public.exclusive_forum_replies FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = author_id
    AND (public.is_exclusive_member(auth.uid()) OR public.has_role(auth.uid(),'admin'))
    AND NOT EXISTS (SELECT 1 FROM public.exclusive_forum_threads t WHERE t.id = thread_id AND t.is_locked = true)
  );
CREATE POLICY "Author or admin delete reply" ON public.exclusive_forum_replies FOR DELETE TO authenticated
  USING (auth.uid() = author_id OR public.has_role(auth.uid(),'admin'));

CREATE INDEX idx_excl_replies_thread ON public.exclusive_forum_replies (thread_id, created_at);

-- Trigger to bump reply count + last activity
CREATE OR REPLACE FUNCTION public.bump_exclusive_thread_activity()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.exclusive_forum_threads
      SET reply_count = reply_count + 1, last_activity_at = now()
      WHERE id = NEW.thread_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.exclusive_forum_threads
      SET reply_count = GREATEST(reply_count - 1, 0)
      WHERE id = OLD.thread_id;
  END IF;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_excl_replies_activity
AFTER INSERT OR DELETE ON public.exclusive_forum_replies
FOR EACH ROW EXECUTE FUNCTION public.bump_exclusive_thread_activity();
