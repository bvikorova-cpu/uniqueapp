
-- Rank avatars for animated avatar system
CREATE TABLE IF NOT EXISTS public.brain_duel_rank_avatars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  rank_tier TEXT NOT NULL DEFAULT 'bronze',
  rank_points INTEGER NOT NULL DEFAULT 0,
  avatar_frame TEXT DEFAULT 'default',
  animation_style TEXT DEFAULT 'none',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);
ALTER TABLE public.brain_duel_rank_avatars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view all rank avatars" ON public.brain_duel_rank_avatars FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can manage own rank avatar" ON public.brain_duel_rank_avatars FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own rank avatar" ON public.brain_duel_rank_avatars FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Power-up combos
CREATE TABLE IF NOT EXISTS public.brain_duel_powerup_combos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID,
  combo_type TEXT NOT NULL,
  powerup_1 TEXT NOT NULL,
  powerup_2 TEXT NOT NULL,
  effect_description TEXT,
  credits_cost INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brain_duel_powerup_combos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own combos" ON public.brain_duel_powerup_combos FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create combos" ON public.brain_duel_powerup_combos FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seasonal themes
CREATE TABLE IF NOT EXISTS public.brain_duel_seasonal_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  theme_key TEXT NOT NULL UNIQUE,
  description TEXT,
  gradient_from TEXT NOT NULL DEFAULT '#6366f1',
  gradient_to TEXT NOT NULL DEFAULT '#8b5cf6',
  emoji TEXT DEFAULT '🎮',
  is_active BOOLEAN NOT NULL DEFAULT false,
  starts_at TIMESTAMPTZ,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brain_duel_seasonal_themes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view seasonal themes" ON public.brain_duel_seasonal_themes FOR SELECT TO authenticated USING (true);

-- AI match commentaries (paid feature)
CREATE TABLE IF NOT EXISTS public.brain_duel_ai_commentaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID NOT NULL,
  commentary TEXT NOT NULL,
  style TEXT NOT NULL DEFAULT 'sports',
  credits_used INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.brain_duel_ai_commentaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own commentaries" ON public.brain_duel_ai_commentaries FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create commentaries" ON public.brain_duel_ai_commentaries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Achievement animations
CREATE TABLE IF NOT EXISTS public.brain_duel_achievement_unlocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_code TEXT NOT NULL,
  achievement_name TEXT NOT NULL,
  achievement_icon TEXT NOT NULL DEFAULT '🏆',
  animation_shown BOOLEAN NOT NULL DEFAULT false,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_code)
);
ALTER TABLE public.brain_duel_achievement_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own achievements" ON public.brain_duel_achievement_unlocks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own achievements" ON public.brain_duel_achievement_unlocks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own achievements" ON public.brain_duel_achievement_unlocks FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Daily challenges
CREATE TABLE IF NOT EXISTS public.brain_duel_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  question_count INTEGER NOT NULL DEFAULT 5,
  time_limit INTEGER NOT NULL DEFAULT 60,
  reward_credits INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_date)
);
ALTER TABLE public.brain_duel_daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view daily challenges" ON public.brain_duel_daily_challenges FOR SELECT TO authenticated USING (true);

-- Daily challenge entries (leaderboard)
CREATE TABLE IF NOT EXISTS public.brain_duel_daily_challenge_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES public.brain_duel_daily_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  time_taken INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);
ALTER TABLE public.brain_duel_daily_challenge_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view challenge entries" ON public.brain_duel_daily_challenge_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can submit own entries" ON public.brain_duel_daily_challenge_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Spectator betting
CREATE TABLE IF NOT EXISTS public.brain_duel_spectator_bets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  match_id UUID NOT NULL,
  bet_on_player_id UUID NOT NULL,
  bet_amount INTEGER NOT NULL DEFAULT 5,
  payout_amount INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE public.brain_duel_spectator_bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own bets" ON public.brain_duel_spectator_bets FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can place bets" ON public.brain_duel_spectator_bets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bets" ON public.brain_duel_spectator_bets FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Insert default seasonal themes
INSERT INTO public.brain_duel_seasonal_themes (name, theme_key, description, gradient_from, gradient_to, emoji, is_active) VALUES
  ('Christmas Brain Blitz', 'christmas', 'Holiday-themed questions and snowy effects', '#dc2626', '#16a34a', '🎄', false),
  ('Halloween Horror Quiz', 'halloween', 'Spooky trivia with dark mode effects', '#f97316', '#7c3aed', '🎃', false),
  ('Summer Brain Waves', 'summer', 'Beach-themed knowledge battles', '#0ea5e9', '#f59e0b', '🏖️', false),
  ('Spring Knowledge Bloom', 'spring', 'Fresh seasonal trivia challenge', '#22c55e', '#ec4899', '🌸', true);

-- Insert sample daily challenge
INSERT INTO public.brain_duel_daily_challenges (category, title, description, question_count, time_limit, reward_credits) VALUES
  ('science', 'Speed Science Sprint', 'Answer 5 science questions as fast as possible!', 5, 60, 15);
