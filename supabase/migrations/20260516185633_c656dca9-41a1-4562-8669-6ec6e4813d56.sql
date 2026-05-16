
-- 1. CONVERSATION MEMORY
CREATE TABLE IF NOT EXISTS public.mentor_conversation_memory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  area text NOT NULL,
  fact_key text NOT NULL,
  fact_value text NOT NULL,
  importance int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, area, fact_key)
);
ALTER TABLE public.mentor_conversation_memory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own memory select" ON public.mentor_conversation_memory FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own memory insert" ON public.mentor_conversation_memory FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own memory update" ON public.mentor_conversation_memory FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own memory delete" ON public.mentor_conversation_memory FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_mem_user ON public.mentor_conversation_memory(user_id, area);

-- 2. SKILLS
CREATE TABLE IF NOT EXISTS public.mentor_skills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL,
  name text NOT NULL UNIQUE,
  description text NOT NULL,
  icon text,
  display_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.mentor_skills ENABLE ROW LEVEL SECURITY;
CREATE POLICY "skills read" ON public.mentor_skills FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.mentor_user_skill_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  skill_id uuid NOT NULL REFERENCES public.mentor_skills(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  practice_count int NOT NULL DEFAULT 0,
  last_practiced_at timestamptz,
  history jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);
ALTER TABLE public.mentor_user_skill_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sp select" ON public.mentor_user_skill_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own sp insert" ON public.mentor_user_skill_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sp update" ON public.mentor_user_skill_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sp_user ON public.mentor_user_skill_progress(user_id);

-- 3. PERSONALITY
CREATE TABLE IF NOT EXISTS public.mentor_personality_assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL,
  result jsonb NOT NULL,
  insights text,
  completed_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_personality_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pa select" ON public.mentor_personality_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own pa insert" ON public.mentor_personality_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own pa delete" ON public.mentor_personality_assessments FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_pa_user ON public.mentor_personality_assessments(user_id, type);

-- 4. ROLE-PLAY
CREATE TABLE IF NOT EXISTS public.mentor_roleplay_scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium',
  system_prompt text NOT NULL,
  evaluation_criteria jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order int NOT NULL DEFAULT 0
);
ALTER TABLE public.mentor_roleplay_scenarios ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rs read" ON public.mentor_roleplay_scenarios FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.mentor_roleplay_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  scenario_id uuid NOT NULL REFERENCES public.mentor_roleplay_scenarios(id) ON DELETE CASCADE,
  transcript jsonb NOT NULL DEFAULT '[]'::jsonb,
  score int,
  feedback text,
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_roleplay_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rps select" ON public.mentor_roleplay_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own rps insert" ON public.mentor_roleplay_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own rps update" ON public.mentor_roleplay_sessions FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_rps_user ON public.mentor_roleplay_sessions(user_id);

-- 5. 360 FEEDBACK
CREATE TABLE IF NOT EXISTS public.mentor_360_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(16), 'hex'),
  questions jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'open',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_360_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own 360 select" ON public.mentor_360_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own 360 insert" ON public.mentor_360_requests FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own 360 update" ON public.mentor_360_requests FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_360_user ON public.mentor_360_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_360_token ON public.mentor_360_requests(token);

CREATE TABLE IF NOT EXISTS public.mentor_360_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.mentor_360_requests(id) ON DELETE CASCADE,
  responses jsonb NOT NULL,
  relationship text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_360_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "owner reads 360 responses" ON public.mentor_360_responses FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.mentor_360_requests r WHERE r.id = request_id AND r.user_id = auth.uid()));
CREATE POLICY "anyone can insert 360 response" ON public.mentor_360_responses FOR INSERT WITH CHECK (true);

-- 6. DAILY NUDGES
CREATE TABLE IF NOT EXISTS public.mentor_daily_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  area text NOT NULL,
  message text NOT NULL,
  action_url text,
  read boolean NOT NULL DEFAULT false,
  sent_for_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, sent_for_date, area)
);
ALTER TABLE public.mentor_daily_nudges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own nudge select" ON public.mentor_daily_nudges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own nudge update" ON public.mentor_daily_nudges FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_nudge_user_date ON public.mentor_daily_nudges(user_id, sent_for_date DESC);

-- 7. SMART GOALS + MILESTONES (new, distinct from existing mentor_goals)
CREATE TABLE IF NOT EXISTS public.mentor_smart_goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  area text NOT NULL,
  title text NOT NULL,
  description text,
  smart_specific text,
  smart_measurable text,
  smart_achievable text,
  smart_relevant text,
  deadline date,
  status text NOT NULL DEFAULT 'active',
  progress int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_smart_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sg select" ON public.mentor_smart_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own sg insert" ON public.mentor_smart_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own sg update" ON public.mentor_smart_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own sg delete" ON public.mentor_smart_goals FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_sg_user ON public.mentor_smart_goals(user_id, status);

CREATE TABLE IF NOT EXISTS public.mentor_smart_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id uuid NOT NULL REFERENCES public.mentor_smart_goals(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  due_date date,
  display_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_smart_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ms via goal" ON public.mentor_smart_milestones FOR ALL
  USING (EXISTS (SELECT 1 FROM public.mentor_smart_goals g WHERE g.id = goal_id AND g.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mentor_smart_goals g WHERE g.id = goal_id AND g.user_id = auth.uid()));

-- 8. REFLECTION PROMPTS
CREATE TABLE IF NOT EXISTS public.mentor_reflection_prompts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  area text NOT NULL,
  mood text,
  prompt text NOT NULL,
  follow_up text
);
ALTER TABLE public.mentor_reflection_prompts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rp read" ON public.mentor_reflection_prompts FOR SELECT USING (true);

-- 9. HABITS
CREATE TABLE IF NOT EXISTS public.mentor_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  area text NOT NULL,
  frequency text NOT NULL DEFAULT 'daily',
  current_streak int NOT NULL DEFAULT 0,
  best_streak int NOT NULL DEFAULT 0,
  freeze_tokens int NOT NULL DEFAULT 2,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own h select" ON public.mentor_habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own h insert" ON public.mentor_habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own h update" ON public.mentor_habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "own h delete" ON public.mentor_habits FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_habits_user ON public.mentor_habits(user_id);

CREATE TABLE IF NOT EXISTS public.mentor_habit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  habit_id uuid NOT NULL REFERENCES public.mentor_habits(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  log_date date NOT NULL DEFAULT CURRENT_DATE,
  completed boolean NOT NULL DEFAULT true,
  used_freeze boolean NOT NULL DEFAULT false,
  note text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(habit_id, log_date)
);
ALTER TABLE public.mentor_habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own hl select" ON public.mentor_habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own hl insert" ON public.mentor_habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 10. COACH PERSONALITIES
CREATE TABLE IF NOT EXISTS public.mentor_coach_personalities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL,
  system_prompt text NOT NULL,
  icon text,
  color text
);
ALTER TABLE public.mentor_coach_personalities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cp read" ON public.mentor_coach_personalities FOR SELECT USING (true);

-- 11. SESSION SUMMARIES
CREATE TABLE IF NOT EXISTS public.mentor_session_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  area text NOT NULL,
  summary text NOT NULL,
  commitments jsonb NOT NULL DEFAULT '[]'::jsonb,
  key_insights jsonb NOT NULL DEFAULT '[]'::jsonb,
  next_steps jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_session_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own ss select" ON public.mentor_session_summaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own ss insert" ON public.mentor_session_summaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_ss_user ON public.mentor_session_summaries(user_id, created_at DESC);

-- 12. VOICE JOURNALS
CREATE TABLE IF NOT EXISTS public.mentor_voice_journals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  transcript text NOT NULL,
  detected_emotion text,
  ai_insights text,
  duration_sec int,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_voice_journals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own vj select" ON public.mentor_voice_journals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own vj insert" ON public.mentor_voice_journals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own vj delete" ON public.mentor_voice_journals FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_vj_user ON public.mentor_voice_journals(user_id, created_at DESC);

-- 13. CBT
CREATE TABLE IF NOT EXISTS public.mentor_cbt_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  duration_days int NOT NULL DEFAULT 21,
  area text NOT NULL,
  days jsonb NOT NULL DEFAULT '[]'::jsonb
);
ALTER TABLE public.mentor_cbt_programs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cbt read" ON public.mentor_cbt_programs FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.mentor_cbt_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  program_id uuid NOT NULL REFERENCES public.mentor_cbt_programs(id) ON DELETE CASCADE,
  current_day int NOT NULL DEFAULT 1,
  completed_days jsonb NOT NULL DEFAULT '[]'::jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  UNIQUE(user_id, program_id)
);
ALTER TABLE public.mentor_cbt_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cbtp select" ON public.mentor_cbt_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own cbtp insert" ON public.mentor_cbt_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own cbtp update" ON public.mentor_cbt_progress FOR UPDATE USING (auth.uid() = user_id);

-- 14. PREMIUM SUBSCRIPTIONS (monthly / yearly)
CREATE TABLE IF NOT EXISTS public.mentor_premium_subs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  email text NOT NULL,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan text NOT NULL DEFAULT 'monthly',
  status text NOT NULL DEFAULT 'inactive',
  current_period_end timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.mentor_premium_subs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own premium select" ON public.mentor_premium_subs FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_premium_user ON public.mentor_premium_subs(user_id);

-- TRIGGERS
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    CREATE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $f$
    BEGIN NEW.updated_at = now(); RETURN NEW; END;
    $f$ LANGUAGE plpgsql SET search_path = public;
  END IF;
END $$;

CREATE TRIGGER trg_mentor_mem_upd BEFORE UPDATE ON public.mentor_conversation_memory FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mentor_sp_upd BEFORE UPDATE ON public.mentor_user_skill_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mentor_rps_upd BEFORE UPDATE ON public.mentor_roleplay_sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mentor_sg_upd BEFORE UPDATE ON public.mentor_smart_goals FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mentor_habits_upd BEFORE UPDATE ON public.mentor_habits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_mentor_premium_upd BEFORE UPDATE ON public.mentor_premium_subs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- SEED
INSERT INTO public.mentor_skills (area, name, description, icon, display_order) VALUES
('career','Interview Skills','Answering tough questions with confidence','Briefcase',1),
('career','Salary Negotiation','Getting the compensation you deserve','TrendingUp',2),
('career','Public Speaking','Presenting ideas clearly','Mic',3),
('career','Time Management','Prioritising what matters','Clock',4),
('career','Delegation','Empowering others effectively','Users',5),
('fitness','Workout Consistency','Showing up even on hard days','Dumbbell',6),
('fitness','Nutrition Planning','Eating with intention','Apple',7),
('fitness','Sleep Hygiene','Recovering like an athlete','Moon',8),
('fitness','Mobility','Maintaining range of motion','Activity',9),
('fitness','Hydration','Optimal water intake','Droplet',10),
('mindset','Self-Talk','Speaking to yourself with respect','MessageCircle',11),
('mindset','Goal Setting','Clarity on what you want','Target',12),
('mindset','Resilience','Bouncing back from setbacks','Shield',13),
('mindset','Focus','Deep work without distraction','Crosshair',14),
('mindset','Stress Response','Regulating in tough moments','Wind',15),
('relationships','Active Listening','Truly hearing the other person','Ear',16),
('relationships','Boundary Setting','Saying no with kindness','GitBranchPlus',17),
('relationships','Conflict Resolution','Handling disagreements maturely','Handshake',18),
('relationships','Emotional Intelligence','Reading the room','Heart',19),
('relationships','Vulnerability','Showing up authentically','HeartHandshake',20)
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.mentor_roleplay_scenarios (area, title, description, difficulty, system_prompt, evaluation_criteria, display_order) VALUES
('career','Job Interview – Behavioral','Tough behavioral interview at a top company','medium','You are a strict interviewer at a Fortune-500 company. Ask 5 behavioral STAR questions, push back on weak answers, and stay professional.','["STAR structure","Specificity","Confidence","Self-awareness"]'::jsonb,1),
('career','Salary Negotiation','Negotiate a 20% raise with a tough manager','hard','You are a budget-conscious manager. Resist raises, ask for proof of value. Concede only with strong arguments.','["Anchoring","Data-driven","Confidence","Active listening"]'::jsonb,2),
('career','Resigning Professionally','Tell your boss you are leaving','medium','You are a manager surprised by the resignation. Try to retain, then accept gracefully.','["Clarity","Gratitude","Firmness","Transition planning"]'::jsonb,3),
('career','Asking for Promotion','Make the case for promotion','medium','You are the skip-level. Probe for measurable impact. Push back unless the case is strong.','["Impact metrics","Self-advocacy","Future vision"]'::jsonb,4),
('mindset','Imposter Syndrome Talk','Coach yourself through self-doubt','easy','You are a wise inner mentor. Help the user reframe imposter thoughts using CBT techniques.','["Reframing","Evidence-based thinking","Self-compassion"]'::jsonb,5),
('mindset','Saying No to Extra Work','Decline without guilt','easy','You are a manager who keeps adding tasks. Pressure with urgency. Accept only firm, kind no.','["Firmness","Kindness","Alternative options"]'::jsonb,6),
('relationships','Difficult Conversation with Partner','Bring up a sensitive topic','medium','You are the partner, initially defensive. Soften only with non-violent communication.','["NVC framework","I-statements","Empathy","Resolution"]'::jsonb,7),
('relationships','Setting Boundaries with Family','Tell a parent you need space','hard','You are a guilt-tripping parent. Use emotional appeals. Accept only firm boundaries with love.','["Clarity","Love","Consistency"]'::jsonb,8),
('relationships','Apologising Authentically','Repair after hurting someone','medium','You are the hurt party. Test sincerity. Accept only when accountability is clear.','["Ownership","No excuses","Repair plan"]'::jsonb,9),
('relationships','Asking for Help','Vulnerability practice','easy','You are a friend. Receive the ask warmly. Help the user normalise asking.','["Vulnerability","Specificity","Gratitude"]'::jsonb,10),
('fitness','Gym Plateau Coaching','Break through stalled progress','medium','You are a strength coach. Diagnose plateau causes (volume, sleep, food). Give a 4-week plan.','["Root cause","Plan structure","Accountability"]'::jsonb,11),
('fitness','Saying No to Sugar','Decline dessert at dinner','easy','You are a friend offering cake. Tease, insist. Accept only kind firm no.','["Firmness","Kindness","Self-respect"]'::jsonb,12)
ON CONFLICT DO NOTHING;

INSERT INTO public.mentor_coach_personalities (slug, name, description, system_prompt, icon, color) VALUES
('tough-love','Tough Love','Direct, no excuses, push you harder','You are a tough-love mentor. Be blunt, call out excuses, demand action. No fluff, no sympathy. Push for the next concrete step.','Flame','from-red-500 to-orange-500'),
('empathic','Empathic','Warm, validating, holds space','You are a warm, empathic coach. Validate emotions, hold space, ask gentle questions. Lead with care before challenge.','Heart','from-pink-500 to-rose-500'),
('socratic','Socratic','Asks deep questions to unlock insight','You are a Socratic coach. Almost never give advice. Ask one powerful question at a time. Let the user discover the answer.','Brain','from-purple-500 to-indigo-500'),
('motivator','Motivator','High-energy, hype-up coach','You are a high-energy motivator. Celebrate wins loudly, reframe setbacks as fuel, end every reply with an energising call to action.','Zap','from-yellow-500 to-amber-500')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.mentor_reflection_prompts (area, mood, prompt, follow_up) VALUES
('career','low','What part of your work drained you most today, and why?','What would have made it 10% better?'),
('career','neutral','What did you learn at work today that surprised you?','How will you apply it?'),
('career','high','What did you do today that future-you will thank you for?','How do you build on this?'),
('mindset','low','What story are you telling yourself right now that might not be true?','What is the kinder version?'),
('mindset','neutral','What is one thing you are grateful for right now?','Why specifically that?'),
('mindset','high','What strength did you use today?','When else can it serve you?'),
('fitness','low','What got in the way of your health goals today?','One smaller step for tomorrow?'),
('fitness','neutral','How did your body feel today on a 1-10?','What contributed to that?'),
('fitness','high','What movement made you feel most alive today?','How do you make it routine?'),
('relationships','low','Who did you withdraw from today, and why?','What is a 5-minute repair move?'),
('relationships','neutral','Who made you feel seen today?','How did they do it?'),
('relationships','high','How did you show up for someone today?','How does this feel in your body?');

INSERT INTO public.mentor_cbt_programs (slug, title, description, duration_days, area, days) VALUES
('21-day-anxiety','21-Day Anxiety Reset','CBT-based program to rewire anxious thinking patterns',21,'mindset',
 '[{"day":1,"title":"Identifying triggers","exercise":"List 5 anxiety triggers from this week"},{"day":2,"title":"Body scan","exercise":"5-minute body scan, note where anxiety lives"},{"day":3,"title":"Thought records","exercise":"Write 3 anxious thoughts and challenge each"}]'::jsonb),
('21-day-confidence','21-Day Confidence Builder','Daily exposure + reframing exercises',21,'mindset',
 '[{"day":1,"title":"Baseline","exercise":"Rate your confidence in 5 life areas"},{"day":2,"title":"Power pose","exercise":"2 minutes of expansive posture before a challenge"},{"day":3,"title":"Win journal","exercise":"List 10 past wins, big or small"}]'::jsonb),
('14-day-relationship-repair','14-Day Relationship Repair','Daily NVC + connection rituals',14,'relationships',
 '[{"day":1,"title":"Assessment","exercise":"Score 5 relationships on closeness 1-10"},{"day":2,"title":"Appreciation","exercise":"Send a specific appreciation text to one person"},{"day":3,"title":"Active listening","exercise":"15-min conversation, only ask questions"}]'::jsonb)
ON CONFLICT (slug) DO NOTHING;
