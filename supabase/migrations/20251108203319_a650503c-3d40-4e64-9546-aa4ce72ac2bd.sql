-- Create notifications table if not exists
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  actor_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('like', 'comment', 'reaction', 'repost')),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  repost_id UUID REFERENCES public.reposts(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (true);

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_notifications_user_id;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_is_read;

-- Create indexes
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);

-- Function to create notification
CREATE OR REPLACE FUNCTION public.create_notification(
  p_user_id UUID,
  p_actor_id UUID,
  p_type TEXT,
  p_post_id UUID DEFAULT NULL,
  p_comment_id UUID DEFAULT NULL,
  p_repost_id UUID DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Don't create notification if user is acting on their own content
  IF p_user_id = p_actor_id THEN
    RETURN;
  END IF;

  -- Insert notification
  INSERT INTO public.notifications (
    user_id,
    actor_id,
    type,
    post_id,
    comment_id,
    repost_id
  ) VALUES (
    p_user_id,
    p_actor_id,
    p_type,
    p_post_id,
    p_comment_id,
    p_repost_id
  );
END;
$$;

-- Trigger functions
CREATE OR REPLACE FUNCTION public.notify_post_like()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO v_post_author_id FROM public.posts WHERE id = NEW.post_id;
    PERFORM create_notification(v_post_author_id, NEW.user_id, 'like', NEW.post_id, NULL, NULL);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO v_post_author_id FROM public.posts WHERE id = NEW.post_id;
    PERFORM create_notification(v_post_author_id, NEW.user_id, 'comment', NEW.post_id, NEW.id, NULL);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_reaction()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO v_post_author_id FROM public.posts WHERE id = NEW.post_id;
    PERFORM create_notification(v_post_author_id, NEW.user_id, 'reaction', NEW.post_id, NULL, NULL);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_repost()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_post_author_id UUID;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT user_id INTO v_post_author_id FROM public.posts WHERE id = NEW.original_post_id;
    PERFORM create_notification(v_post_author_id, NEW.user_id, 'repost', NEW.original_post_id, NULL, NEW.id);
  END IF;
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS trigger_notify_post_like ON public.post_likes;
CREATE TRIGGER trigger_notify_post_like
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_post_like();

DROP TRIGGER IF EXISTS trigger_notify_comment ON public.post_comments;
CREATE TRIGGER trigger_notify_comment
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment();

DROP TRIGGER IF EXISTS trigger_notify_reaction ON public.post_reactions;
CREATE TRIGGER trigger_notify_reaction
  AFTER INSERT ON public.post_reactions
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_reaction();

DROP TRIGGER IF EXISTS trigger_notify_repost ON public.reposts;
CREATE TRIGGER trigger_notify_repost
  AFTER INSERT ON public.reposts
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_repost();