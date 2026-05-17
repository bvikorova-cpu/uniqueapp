
-- 1. CBT reframes
CREATE TABLE public.wellness_cbt_reframes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  situation TEXT NOT NULL,
  negative_thought TEXT NOT NULL,
  emotion TEXT,
  intensity_before INT,
  distortions JSONB DEFAULT '[]'::jsonb,
  reframe TEXT,
  balanced_thought TEXT,
  action_step TEXT,
  intensity_after INT,
  credits_used INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_cbt_reframes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own cbt" ON public.wellness_cbt_reframes FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- 2. MH assessments
CREATE TABLE public.wellness_mh_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('phq9','gad7','pss10','wellbeing')),
  answers JSONB NOT NULL,
  total_score INT NOT NULL,
  severity TEXT,
  ai_insight TEXT,
  recommended_actions JSONB DEFAULT '[]'::jsonb,
  credits_used INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_mh_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own mh" ON public.wellness_mh_assessments FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- 3. Stress checkins
CREATE TABLE public.wellness_stress_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  stress_level INT NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
  energy_level INT CHECK (energy_level BETWEEN 1 AND 10),
  note TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_stress_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own stress" ON public.wellness_stress_checkins FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- 4. Pomodoro
CREATE TABLE public.wellness_pomodoro_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  task TEXT,
  duration_minutes INT NOT NULL DEFAULT 25,
  break_minutes INT NOT NULL DEFAULT 5,
  completed BOOLEAN NOT NULL DEFAULT false,
  ambience TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
ALTER TABLE public.wellness_pomodoro_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own pomo" ON public.wellness_pomodoro_sessions FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- 5. Walking meditations
CREATE TABLE public.wellness_walking_meditations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  intention TEXT NOT NULL,
  environment TEXT,
  duration_minutes INT DEFAULT 10,
  script TEXT,
  audio_url TEXT,
  voice_id TEXT,
  status TEXT DEFAULT 'processing',
  credits_used INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_walking_meditations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own walk" ON public.wellness_walking_meditations FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- 6. Soundscape presets
CREATE TABLE public.wellness_soundscape_presets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  layers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_soundscape_presets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sound" ON public.wellness_soundscape_presets FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- 7. Wake alarms
CREATE TABLE public.wellness_wake_alarms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT,
  time_of_day TIME NOT NULL,
  days_of_week INT[] DEFAULT '{0,1,2,3,4,5,6}',
  soundscape TEXT DEFAULT 'sunrise',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_wake_alarms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alarm" ON public.wellness_wake_alarms FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- 8. Group sessions
CREATE TABLE public.wellness_group_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  starts_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 20,
  category TEXT,
  max_attendees INT DEFAULT 100,
  attendee_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.wellness_group_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "view sessions" ON public.wellness_group_sessions FOR SELECT TO authenticated USING (true);
CREATE POLICY "host insert" ON public.wellness_group_sessions FOR INSERT WITH CHECK (auth.uid()=host_id);
CREATE POLICY "host update" ON public.wellness_group_sessions FOR UPDATE USING (auth.uid()=host_id);
CREATE POLICY "host delete" ON public.wellness_group_sessions FOR DELETE USING (auth.uid()=host_id);

-- 9. Group attendees
CREATE TABLE public.wellness_group_attendees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES public.wellness_group_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  reminded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id, user_id)
);
ALTER TABLE public.wellness_group_attendees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own rsvp view" ON public.wellness_group_attendees FOR SELECT USING (
  auth.uid()=user_id OR auth.uid() IN (SELECT host_id FROM public.wellness_group_sessions WHERE id=session_id)
);
CREATE POLICY "own rsvp ins" ON public.wellness_group_attendees FOR INSERT WITH CHECK (auth.uid()=user_id);
CREATE POLICY "own rsvp del" ON public.wellness_group_attendees FOR DELETE USING (auth.uid()=user_id);

-- 10. Courses progress
CREATE TABLE public.wellness_courses_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  course_slug TEXT NOT NULL,
  current_day INT NOT NULL DEFAULT 1,
  total_days INT NOT NULL,
  completed_days INT[] DEFAULT '{}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, course_slug)
);
ALTER TABLE public.wellness_courses_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own course" ON public.wellness_courses_progress FOR ALL USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

CREATE INDEX idx_stress_user_date ON public.wellness_stress_checkins (user_id, created_at DESC);
CREATE INDEX idx_group_starts ON public.wellness_group_sessions (starts_at) WHERE status='scheduled';
