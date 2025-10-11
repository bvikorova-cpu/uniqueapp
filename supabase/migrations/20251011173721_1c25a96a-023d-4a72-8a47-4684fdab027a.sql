-- Create user_points table
CREATE TABLE IF NOT EXISTS public.user_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  total_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  current_level_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create daily_rewards table
CREATE TABLE IF NOT EXISTS public.daily_rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  claimed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  day_streak INTEGER DEFAULT 1,
  points_earned INTEGER DEFAULT 10
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL,
  points_earned INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_points
CREATE POLICY "Anyone can view points"
  ON public.user_points FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own points"
  ON public.user_points FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own points"
  ON public.user_points FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for badges
CREATE POLICY "Anyone can view badges"
  ON public.badges FOR SELECT
  USING (true);

-- RLS Policies for user_badges
CREATE POLICY "Anyone can view user badges"
  ON public.user_badges FOR SELECT
  USING (true);

CREATE POLICY "System can award badges"
  ON public.user_badges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for daily_rewards
CREATE POLICY "Users can view their daily rewards"
  ON public.daily_rewards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can claim daily rewards"
  ON public.daily_rewards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their activity logs"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can log activities"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_user_points_user_id ON public.user_points(user_id);
CREATE INDEX idx_user_points_total_points ON public.user_points(total_points DESC);
CREATE INDEX idx_user_badges_user_id ON public.user_badges(user_id);
CREATE INDEX idx_daily_rewards_user_id ON public.daily_rewards(user_id);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);

-- Function to calculate level from points
CREATE OR REPLACE FUNCTION public.calculate_level(points INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level formula: level = sqrt(points / 100)
  RETURN FLOOR(SQRT(points / 100.0)) + 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to add points to user
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_user_id UUID,
  p_points INTEGER,
  p_activity_type TEXT
)
RETURNS void AS $$
DECLARE
  v_current_points INTEGER;
  v_new_total INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Get or create user points record
  INSERT INTO public.user_points (user_id, total_points)
  VALUES (p_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  -- Update points
  UPDATE public.user_points
  SET 
    total_points = total_points + p_points,
    current_level_points = current_level_points + p_points,
    updated_at = now()
  WHERE user_id = p_user_id
  RETURNING total_points INTO v_new_total;

  -- Calculate new level
  v_new_level := calculate_level(v_new_total);

  -- Update level if changed
  UPDATE public.user_points
  SET level = v_new_level
  WHERE user_id = p_user_id AND level != v_new_level;

  -- Log activity
  INSERT INTO public.activity_logs (user_id, activity_type, points_earned)
  VALUES (p_user_id, p_activity_type, p_points);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert default badges
INSERT INTO public.badges (name, description, icon, requirement_type, requirement_value, points_reward) VALUES
  ('Nováčik', 'Vytvoril si svoj prvý príspevok', '🌱', 'posts', 1, 10),
  ('Aktívny', 'Vytvoril si 10 príspevkov', '⚡', 'posts', 10, 50),
  ('Influencer', 'Vytvoril si 50 príspevkov', '⭐', 'posts', 50, 200),
  ('Komentátor', 'Napísal si 50 komentárov', '💬', 'comments', 50, 100),
  ('Videokráľ', 'Zdieľal si 10 videí', '🎥', 'videos', 10, 75),
  ('Priateľský', 'Máš 10 priateľov', '👥', 'friends', 10, 50),
  ('Populárny', 'Získal si 100 lajkov', '❤️', 'likes_received', 100, 150),
  ('Streaker', '7-dňový prihlasovací streak', '🔥', 'login_streak', 7, 100),
  ('Mesačný bojovník', '30-dňový prihlasovací streak', '🏆', 'login_streak', 30, 500)
ON CONFLICT DO NOTHING;