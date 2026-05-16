
-- Child profiles owned by parent
CREATE TABLE public.kids_child_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  name TEXT NOT NULL,
  age INT NOT NULL CHECK (age BETWEEN 4 AND 14),
  avatar TEXT DEFAULT 'fox',
  pet TEXT DEFAULT 'cat',
  preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_child_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent manages children" ON public.kids_child_profiles
  FOR ALL USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

-- Age band & content filter per child
CREATE TABLE public.kids_age_bands (
  child_id UUID PRIMARY KEY REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  band TEXT NOT NULL DEFAULT '6-8' CHECK (band IN ('6-8','9-10','11-12')),
  allow_videos BOOLEAN NOT NULL DEFAULT true,
  allow_ai_chat BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_age_bands ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent manages age bands" ON public.kids_age_bands
  FOR ALL USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id = kids_age_bands.child_id AND c.parent_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id = kids_age_bands.child_id AND c.parent_id = auth.uid()));

-- Learning paths
CREATE TABLE public.kids_learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  day_date DATE NOT NULL DEFAULT CURRENT_DATE,
  theme TEXT NOT NULL DEFAULT 'Explore',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, day_date)
);
CREATE TABLE public.kids_learning_path_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id UUID NOT NULL REFERENCES public.kids_learning_paths(id) ON DELETE CASCADE,
  position INT NOT NULL,
  title TEXT NOT NULL,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.kids_learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_learning_path_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent owns paths" ON public.kids_learning_paths FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));
CREATE POLICY "parent owns path steps" ON public.kids_learning_path_steps FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_learning_paths p JOIN public.kids_child_profiles c ON c.id=p.child_id WHERE p.id=path_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_learning_paths p JOIN public.kids_child_profiles c ON c.id=p.child_id WHERE p.id=path_id AND c.parent_id=auth.uid()));

-- Saved/offline content
CREATE TABLE public.kids_saved_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_saved_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent owns saved" ON public.kids_saved_content FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- Activity log
CREATE TABLE public.kids_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  duration_seconds INT NOT NULL DEFAULT 0,
  score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_kids_activity_child_date ON public.kids_activity_log(child_id, created_at DESC);
ALTER TABLE public.kids_activity_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent reads activity" ON public.kids_activity_log FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- Screen time rules
CREATE TABLE public.kids_screen_time_rules (
  child_id UUID PRIMARY KEY REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  daily_minutes INT NOT NULL DEFAULT 60,
  bedtime_start TIME NOT NULL DEFAULT '20:30',
  bedtime_end TIME NOT NULL DEFAULT '07:00',
  hard_lock BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_screen_time_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent manages screen time" ON public.kids_screen_time_rules FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- Curriculum progress
CREATE TABLE public.kids_curriculum_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, subject)
);
ALTER TABLE public.kids_curriculum_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent owns curriculum" ON public.kids_curriculum_progress FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- AI recommendations
CREATE TABLE public.kids_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  reason TEXT,
  target_route TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent owns recs" ON public.kids_recommendations FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- Safety flags
CREATE TABLE public.kids_safety_flags (
  parent_id UUID PRIMARY KEY,
  block_violence BOOLEAN NOT NULL DEFAULT true,
  block_scary BOOLEAN NOT NULL DEFAULT true,
  block_external_links BOOLEAN NOT NULL DEFAULT true,
  block_unknown_topics BOOLEAN NOT NULL DEFAULT false,
  custom_blocklist TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_safety_flags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent manages safety" ON public.kids_safety_flags FOR ALL
  USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);

-- Pending AI outputs awaiting approval
CREATE TABLE public.kids_pending_outputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMPTZ
);
ALTER TABLE public.kids_pending_outputs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent reviews outputs" ON public.kids_pending_outputs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- Narration prefs
CREATE TABLE public.kids_narration_prefs (
  child_id UUID PRIMARY KEY REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  voice TEXT NOT NULL DEFAULT 'alloy',
  speed NUMERIC NOT NULL DEFAULT 1.0,
  auto_read BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_narration_prefs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent manages narration" ON public.kids_narration_prefs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- Mini-game scores
CREATE TABLE public.kids_minigame_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  game TEXT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  max_score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_minigame_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent owns scores" ON public.kids_minigame_scores FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- Adaptive difficulty
CREATE TABLE public.kids_difficulty_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  difficulty INT NOT NULL DEFAULT 1,
  streak INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(child_id, subject)
);
ALTER TABLE public.kids_difficulty_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent owns difficulty" ON public.kids_difficulty_state FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- Economy
CREATE TABLE public.kids_economy (
  child_id UUID PRIMARY KEY REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  xp INT NOT NULL DEFAULT 0,
  coins INT NOT NULL DEFAULT 0,
  streak_days INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_economy ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent owns economy" ON public.kids_economy FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_child_profiles c WHERE c.id=child_id AND c.parent_id=auth.uid()));

-- Assignments
CREATE TABLE public.kids_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','done','overdue')),
  reward_coins INT NOT NULL DEFAULT 10,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE public.kids_assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES public.kids_assignments(id) ON DELETE CASCADE,
  note TEXT,
  attachment_url TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kids_assignment_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent owns assignments" ON public.kids_assignments FOR ALL
  USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "parent owns submissions" ON public.kids_assignment_submissions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.kids_assignments a WHERE a.id=assignment_id AND a.parent_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.kids_assignments a WHERE a.id=assignment_id AND a.parent_id=auth.uid()));

-- Family shares
CREATE TABLE public.kids_family_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id UUID NOT NULL,
  child_id UUID NOT NULL REFERENCES public.kids_child_profiles(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  share_token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16),'hex'),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.kids_family_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "parent owns shares" ON public.kids_family_shares FOR ALL
  USING (auth.uid() = parent_id) WITH CHECK (auth.uid() = parent_id);
CREATE POLICY "public can read shares by token" ON public.kids_family_shares
  FOR SELECT USING (true);
