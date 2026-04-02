
-- Daily/Weekly challenges
CREATE TABLE public.secret_santa_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'daily',
  reward_credits INTEGER NOT NULL DEFAULT 5,
  target_count INTEGER NOT NULL DEFAULT 1,
  gift_category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ
);

ALTER TABLE public.secret_santa_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read active challenges" ON public.secret_santa_challenges
  FOR SELECT TO authenticated USING (is_active = true);

-- Challenge progress per user
CREATE TABLE public.secret_santa_challenge_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.secret_santa_challenges(id) ON DELETE CASCADE,
  current_count INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN DEFAULT false,
  reward_claimed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.secret_santa_challenge_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own challenge progress" ON public.secret_santa_challenge_progress
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Wishlists
CREATE TABLE public.secret_santa_wishlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gift_type TEXT NOT NULL,
  gift_emoji TEXT NOT NULL,
  gift_label TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  note TEXT,
  is_fulfilled BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.secret_santa_wishlists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own wishlist" ON public.secret_santa_wishlists
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Public wishlists readable" ON public.secret_santa_wishlists
  FOR SELECT TO authenticated USING (true);

-- Streak rewards log
CREATE TABLE public.secret_santa_streak_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  streak_milestone INTEGER NOT NULL,
  reward_credits INTEGER NOT NULL,
  claimed_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, streak_milestone)
);

ALTER TABLE public.secret_santa_streak_rewards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own streak rewards" ON public.secret_santa_streak_rewards
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Insert default challenges
INSERT INTO public.secret_santa_challenges (title, description, challenge_type, reward_credits, target_count, expires_at) VALUES
  ('Daily Gifter', 'Send 1 gift today', 'daily', 5, 1, now() + interval '1 day'),
  ('Generous Soul', 'Send 3 gifts today', 'daily', 15, 3, now() + interval '1 day'),
  ('Big Spender', 'Send a gift worth 50+ credits', 'daily', 20, 1, now() + interval '1 day'),
  ('Social Butterfly', 'Send gifts to 3 different people', 'daily', 25, 3, now() + interval '1 day'),
  ('Weekly Champion', 'Send 10 gifts this week', 'weekly', 50, 10, now() + interval '7 days'),
  ('Category Explorer', 'Send gifts from 5 different categories', 'weekly', 40, 5, now() + interval '7 days'),
  ('Roulette Master', 'Spin the Gift Roulette 3 times', 'weekly', 30, 3, now() + interval '7 days'),
  ('Streak Builder', 'Maintain a 7-day gift streak', 'weekly', 75, 7, now() + interval '7 days');
