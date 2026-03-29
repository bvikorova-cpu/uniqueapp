-- Tag System: tags on posts
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false;
ALTER TABLE public.forum_posts ADD COLUMN IF NOT EXISTS is_markdown boolean DEFAULT false;

-- Thread Subscriptions
CREATE TABLE IF NOT EXISTS public.forum_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid NOT NULL REFERENCES forum_posts(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, post_id)
);
ALTER TABLE public.forum_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own subscriptions" ON public.forum_subscriptions FOR ALL USING (auth.uid() = user_id);

-- Forum Notifications
CREATE TABLE IF NOT EXISTS public.forum_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id uuid REFERENCES forum_posts(id) ON DELETE CASCADE,
  type text NOT NULL DEFAULT 'reply',
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.forum_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own notifications" ON public.forum_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.forum_notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System inserts notifications" ON public.forum_notifications FOR INSERT WITH CHECK (true);

-- Weekly Challenges
CREATE TABLE IF NOT EXISTS public.forum_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  challenge_type text NOT NULL DEFAULT 'posting',
  target_value int NOT NULL DEFAULT 5,
  karma_reward int NOT NULL DEFAULT 50,
  starts_at timestamptz NOT NULL DEFAULT now(),
  ends_at timestamptz NOT NULL DEFAULT (now() + interval '7 days'),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE public.forum_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view challenges" ON public.forum_challenges FOR SELECT USING (true);
CREATE POLICY "Auth users create challenges" ON public.forum_challenges FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE TABLE IF NOT EXISTS public.forum_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES forum_challenges(id) ON DELETE CASCADE,
  current_value int DEFAULT 0,
  completed boolean DEFAULT false,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE public.forum_challenge_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own progress" ON public.forum_challenge_progress FOR ALL USING (auth.uid() = user_id);

-- Trigger to notify subscribers on new comment
CREATE OR REPLACE FUNCTION notify_forum_subscribers()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.forum_notifications (user_id, post_id, type, message)
  SELECT s.user_id, NEW.post_id, 'reply', 'New reply on a thread you follow'
  FROM public.forum_subscriptions s
  WHERE s.post_id = NEW.post_id AND s.user_id != NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_forum_comment_notify ON public.forum_comments;
CREATE TRIGGER on_forum_comment_notify
  AFTER INSERT ON public.forum_comments
  FOR EACH ROW EXECUTE FUNCTION notify_forum_subscribers();