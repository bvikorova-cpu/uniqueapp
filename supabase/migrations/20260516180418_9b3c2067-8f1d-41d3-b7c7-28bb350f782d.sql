
CREATE TABLE public.education_flashcard_decks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  is_public BOOLEAN NOT NULL DEFAULT false,
  card_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education_flashcard_decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "decks_owner_all" ON public.education_flashcard_decks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "decks_public_read" ON public.education_flashcard_decks FOR SELECT USING (is_public = true);
CREATE INDEX IF NOT EXISTS edu_idx_decks_user ON public.education_flashcard_decks(user_id);

CREATE TABLE public.education_flashcards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id UUID NOT NULL REFERENCES public.education_flashcard_decks(id) ON DELETE CASCADE,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  image_url TEXT,
  hint TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education_flashcards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cards_owner_all" ON public.education_flashcards FOR ALL
  USING (EXISTS (SELECT 1 FROM public.education_flashcard_decks d WHERE d.id = deck_id AND d.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.education_flashcard_decks d WHERE d.id = deck_id AND d.user_id = auth.uid()));
CREATE POLICY "cards_public_read" ON public.education_flashcards FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.education_flashcard_decks d WHERE d.id = deck_id AND d.is_public = true));
CREATE INDEX IF NOT EXISTS edu_idx_cards_deck ON public.education_flashcards(deck_id);

CREATE TABLE public.education_srs_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.education_flashcards(id) ON DELETE CASCADE,
  ease NUMERIC NOT NULL DEFAULT 2.5,
  interval_days INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  due_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id)
);
ALTER TABLE public.education_srs_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "srs_owner_all" ON public.education_srs_state FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS edu_idx_srs_user_due ON public.education_srs_state(user_id, due_at);

CREATE TABLE public.education_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Trophy',
  category TEXT NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 50,
  criteria JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_public_read" ON public.education_achievements FOR SELECT USING (true);

CREATE TABLE public.education_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.education_achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE public.education_user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_ach_owner_read" ON public.education_user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_ach_owner_insert" ON public.education_user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS edu_idx_user_ach_user ON public.education_user_achievements(user_id);

CREATE TABLE public.education_daily_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date DATE NOT NULL UNIQUE,
  type TEXT NOT NULL DEFAULT 'quiz',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  xp_reward INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education_daily_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_public_read" ON public.education_daily_challenges FOR SELECT USING (true);

CREATE TABLE public.education_daily_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  challenge_id UUID NOT NULL REFERENCES public.education_daily_challenges(id) ON DELETE CASCADE,
  score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);
ALTER TABLE public.education_daily_completions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "daily_comp_owner_all" ON public.education_daily_completions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS edu_idx_daily_comp_user ON public.education_daily_completions(user_id);

CREATE TABLE public.education_skill_tree_nodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  parent_id UUID REFERENCES public.education_skill_tree_nodes(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  required_xp INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL DEFAULT 0,
  icon TEXT DEFAULT 'BookOpen',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education_skill_tree_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skill_nodes_public_read" ON public.education_skill_tree_nodes FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS edu_idx_skill_subject ON public.education_skill_tree_nodes(subject);

CREATE TABLE public.education_user_skill_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  node_id UUID NOT NULL REFERENCES public.education_skill_tree_nodes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'locked',
  mastery_score INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, node_id)
);
ALTER TABLE public.education_user_skill_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skill_progress_owner_all" ON public.education_user_skill_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS edu_idx_skill_prog_user ON public.education_user_skill_progress(user_id);

CREATE TABLE public.education_weekly_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL,
  league_tier TEXT NOT NULL DEFAULT 'bronze',
  user_id UUID NOT NULL,
  xp_this_week INTEGER NOT NULL DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(week_start, user_id)
);
ALTER TABLE public.education_weekly_leagues ENABLE ROW LEVEL SECURITY;
CREATE POLICY "league_public_read" ON public.education_weekly_leagues FOR SELECT USING (true);
CREATE POLICY "league_owner_write" ON public.education_weekly_leagues FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS edu_idx_league_week_tier ON public.education_weekly_leagues(week_start, league_tier, xp_this_week DESC);

CREATE TABLE public.education_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_id UUID,
  course_title TEXT NOT NULL,
  certificate_code TEXT NOT NULL UNIQUE DEFAULT lower(encode(gen_random_bytes(8), 'hex')),
  score NUMERIC NOT NULL DEFAULT 0,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  pdf_url TEXT,
  recipient_name TEXT
);
ALTER TABLE public.education_certificates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cert_owner_all" ON public.education_certificates FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "cert_public_verify" ON public.education_certificates FOR SELECT USING (true);
CREATE INDEX IF NOT EXISTS edu_idx_cert_code ON public.education_certificates(certificate_code);

CREATE TABLE public.education_study_groups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  subject TEXT,
  invite_code TEXT NOT NULL UNIQUE DEFAULT lower(encode(gen_random_bytes(4), 'hex')),
  is_private BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education_study_groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.education_study_group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES public.education_study_groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(group_id, user_id)
);
ALTER TABLE public.education_study_group_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.edu_is_study_group_member(_group_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.education_study_group_members WHERE group_id = _group_id AND user_id = _user_id);
$$;

CREATE POLICY "groups_read" ON public.education_study_groups FOR SELECT USING (is_private = false OR public.edu_is_study_group_member(id, auth.uid()) OR owner_id = auth.uid());
CREATE POLICY "groups_owner_write" ON public.education_study_groups FOR ALL USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "members_read" ON public.education_study_group_members FOR SELECT USING (public.edu_is_study_group_member(group_id, auth.uid()));
CREATE POLICY "members_join" ON public.education_study_group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "members_leave" ON public.education_study_group_members FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS edu_idx_group_members_group ON public.education_study_group_members(group_id);
CREATE INDEX IF NOT EXISTS edu_idx_group_members_user ON public.education_study_group_members(user_id);

CREATE TABLE public.education_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content_md TEXT NOT NULL DEFAULT '',
  subject TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notes_owner_all" ON public.education_notes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notes_public_read" ON public.education_notes FOR SELECT USING (is_public = true);
CREATE INDEX IF NOT EXISTS edu_idx_notes_user ON public.education_notes(user_id);

CREATE TABLE public.education_math_solves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT,
  problem_text TEXT,
  solution_steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.education_math_solves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "math_owner_all" ON public.education_math_solves FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS edu_idx_math_user ON public.education_math_solves(user_id);

CREATE TRIGGER trg_edu_decks_updated BEFORE UPDATE ON public.education_flashcard_decks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_edu_cards_updated BEFORE UPDATE ON public.education_flashcards FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_edu_srs_updated BEFORE UPDATE ON public.education_srs_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_edu_skill_prog_updated BEFORE UPDATE ON public.education_user_skill_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_edu_league_updated BEFORE UPDATE ON public.education_weekly_leagues FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_edu_groups_updated BEFORE UPDATE ON public.education_study_groups FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_edu_notes_updated BEFORE UPDATE ON public.education_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.education_achievements (code, title, description, icon, category, xp_reward, criteria) VALUES
('first_quiz', 'First Steps', 'Complete your first quiz', 'Footprints', 'beginner', 25, '{"quizzes":1}'),
('streak_7', 'Week Warrior', 'Maintain a 7-day learning streak', 'Flame', 'streak', 100, '{"streak":7}'),
('streak_30', 'Monthly Master', '30-day learning streak', 'Flame', 'streak', 500, '{"streak":30}'),
('xp_1000', 'Rising Scholar', 'Earn 1,000 XP', 'Star', 'xp', 100, '{"xp":1000}'),
('xp_10000', 'Knowledge Knight', 'Earn 10,000 XP', 'Crown', 'xp', 1000, '{"xp":10000}'),
('flashcards_100', 'Card Collector', 'Review 100 flashcards', 'Layers', 'srs', 150, '{"reviews":100}'),
('perfect_quiz', 'Perfectionist', 'Score 100%% on a quiz', 'Target', 'quiz', 75, '{"perfect":1}'),
('daily_7', 'Daily Devotee', 'Complete 7 daily challenges', 'Calendar', 'daily', 200, '{"daily":7}'),
('first_certificate', 'Certified', 'Earn your first certificate', 'Award', 'cert', 250, '{"certs":1}'),
('study_group', 'Team Player', 'Join a study group', 'Users', 'social', 50, '{"groups":1}')
ON CONFLICT (code) DO NOTHING;
