-- Quantum Chat Rooms
CREATE TABLE public.quantum_chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  room_type TEXT NOT NULL DEFAULT 'superposition',
  max_participants INTEGER DEFAULT 50,
  creator_id UUID NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_chat_rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view rooms" ON public.quantum_chat_rooms FOR SELECT USING (true);
CREATE POLICY "Auth users create rooms" ON public.quantum_chat_rooms FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);

-- Quantum Chat Messages
CREATE TABLE public.quantum_chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.quantum_chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_observed BOOLEAN DEFAULT false,
  observed_by_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view messages" ON public.quantum_chat_messages FOR SELECT USING (true);
CREATE POLICY "Auth users send messages" ON public.quantum_chat_messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);

-- Reality Votes
CREATE TABLE public.quantum_reality_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL,
  voter_id UUID NOT NULL,
  chosen_version_id UUID NOT NULL,
  vote_weight INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(post_id, voter_id)
);
ALTER TABLE public.quantum_reality_votes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view votes" ON public.quantum_reality_votes FOR SELECT USING (true);
CREATE POLICY "Auth users can vote" ON public.quantum_reality_votes FOR INSERT TO authenticated WITH CHECK (auth.uid() = voter_id);

-- Quantum Achievements
CREATE TABLE public.quantum_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER DEFAULT 10,
  category TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view achievements" ON public.quantum_achievements FOR SELECT USING (true);

-- User Achievements
CREATE TABLE public.quantum_user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.quantum_achievements(id) ON DELETE CASCADE NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);
ALTER TABLE public.quantum_user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own achievements" ON public.quantum_user_achievements FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "System grants achievements" ON public.quantum_user_achievements FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- AI Oracle Sessions
CREATE TABLE public.quantum_oracle_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  prediction TEXT,
  credits_used INTEGER DEFAULT 3,
  session_type TEXT DEFAULT 'general',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.quantum_oracle_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own sessions" ON public.quantum_oracle_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users create sessions" ON public.quantum_oracle_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Seed achievements
INSERT INTO public.quantum_achievements (code, name, description, icon, points, category) VALUES
  ('first_post', 'First Quantum Post', 'Create your first quantum post', '⚛️', 10, 'posts'),
  ('observer', 'The Observer', 'Observe 10 different quantum posts', '👁️', 20, 'observation'),
  ('entangler', 'Quantum Entangler', 'Create 5 entanglements', '🔗', 30, 'social'),
  ('voter', 'Reality Voter', 'Vote on 10 reality collapses', '🗳️', 15, 'voting'),
  ('chatter', 'Quantum Chatter', 'Send 50 messages in chat rooms', '💬', 25, 'chat'),
  ('oracle_seeker', 'Oracle Seeker', 'Consult the AI Oracle 3 times', '🔮', 20, 'oracle'),
  ('room_creator', 'Room Creator', 'Create 3 chat rooms', '🚪', 15, 'chat'),
  ('collapse_master', 'Collapse Master', 'Collapse 5 realities', '💥', 40, 'posts'),
  ('premium_user', 'Premium Quantum', 'Upgrade to premium profile', '⭐', 50, 'profile'),
  ('streak_7', '7-Day Streak', 'Visit 7 days in a row', '🔥', 35, 'engagement'),
  ('social_butterfly', 'Social Butterfly', 'Entangle with 10 users', '🦋', 45, 'social'),
  ('quantum_master', 'Quantum Master', 'Earn 500 total points', '👑', 100, 'mastery');