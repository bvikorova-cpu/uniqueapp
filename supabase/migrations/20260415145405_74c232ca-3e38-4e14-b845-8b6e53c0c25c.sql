
-- Mood tracker table
CREATE TABLE public.mentor_moods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  mentor_area TEXT NOT NULL DEFAULT 'career',
  mood_score INT NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  energy_score INT NOT NULL CHECK (energy_score >= 1 AND energy_score <= 10),
  stress_score INT NOT NULL CHECK (stress_score >= 1 AND stress_score <= 10),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- XP / Gamification table
CREATE TABLE public.mentor_xp (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  xp_total INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  badges TEXT[] DEFAULT '{}',
  streak_days INT NOT NULL DEFAULT 0,
  longest_streak INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- AI Action Plans table
CREATE TABLE public.mentor_action_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  mentor_area TEXT NOT NULL DEFAULT 'career',
  title TEXT NOT NULL,
  plan_content TEXT NOT NULL,
  week_start DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'active',
  credits_used INT NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.mentor_moods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_action_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own moods" ON public.mentor_moods FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own xp" ON public.mentor_xp FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own action plans" ON public.mentor_action_plans FOR ALL USING (auth.uid() = user_id);
