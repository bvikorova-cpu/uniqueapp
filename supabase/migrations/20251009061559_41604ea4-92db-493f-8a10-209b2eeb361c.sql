-- Create course_progress table to track current progress
CREATE TABLE public.course_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  current_topic INTEGER DEFAULT 0,
  completed_topics INTEGER[] DEFAULT '{}',
  last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_course_progress UNIQUE (user_id, course_name)
);

CREATE INDEX idx_course_progress_user_course ON public.course_progress(user_id, course_name);

ALTER TABLE public.course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress"
  ON public.course_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.course_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.course_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- Create completed_courses table for finished courses with certificates
CREATE TABLE public.completed_courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  completion_date TIMESTAMPTZ DEFAULT NOW(),
  test_score INTEGER CHECK (test_score >= 0 AND test_score <= 100),
  certificate_url TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_completed_courses_user ON public.completed_courses(user_id);
CREATE INDEX idx_completed_courses_user_course ON public.completed_courses(user_id, course_name);

ALTER TABLE public.completed_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their completed courses"
  ON public.completed_courses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their completed courses"
  ON public.completed_courses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create course_statistics table for time tracking
CREATE TABLE public.course_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  time_spent_minutes INTEGER DEFAULT 0,
  topics_completed INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_user_course_stats UNIQUE (user_id, course_name)
);

CREATE INDEX idx_course_statistics_user_course ON public.course_statistics(user_id, course_name);

ALTER TABLE public.course_statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own statistics"
  ON public.course_statistics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics"
  ON public.course_statistics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics"
  ON public.course_statistics FOR UPDATE
  USING (auth.uid() = user_id);