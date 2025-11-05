-- Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  price DECIMAL(10,2) NOT NULL,
  thumbnail_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  total_lessons INTEGER DEFAULT 0,
  total_enrollments INTEGER DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create course lessons table
CREATE TABLE IF NOT EXISTS public.course_lessons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  duration_minutes INTEGER DEFAULT 0,
  order_index INTEGER NOT NULL,
  is_preview BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create course materials table
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size_mb DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create course enrollments table
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount_paid DECIMAL(10,2) NOT NULL,
  platform_fee DECIMAL(10,2) NOT NULL,
  creator_earning DECIMAL(10,2) NOT NULL,
  stripe_payment_intent_id TEXT,
  progress_percentage INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Create lesson progress table
CREATE TABLE IF NOT EXISTS public.lesson_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID REFERENCES public.course_enrollments(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  watch_time_seconds INTEGER DEFAULT 0,
  completed_at TIMESTAMPTZ,
  last_watched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(enrollment_id, lesson_id)
);

-- Create course quizzes table
CREATE TABLE IF NOT EXISTS public.course_quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  passing_score INTEGER DEFAULT 70,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.course_quizzes(id) ON DELETE CASCADE NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  correct_answer TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL
);

-- Create quiz attempts table
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.course_quizzes(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- Create lesson discussions table
CREATE TABLE IF NOT EXISTS public.lesson_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id UUID REFERENCES public.course_lessons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  parent_id UUID REFERENCES public.lesson_discussions(id) ON DELETE CASCADE,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_discussions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses"
  ON public.courses FOR SELECT
  TO authenticated
  USING (is_published = true OR creator_id = auth.uid());

CREATE POLICY "Creators can manage their courses"
  ON public.courses FOR ALL
  TO authenticated
  USING (creator_id = auth.uid());

-- RLS Policies for lessons
CREATE POLICY "Users can view lessons of enrolled courses or preview lessons"
  ON public.course_lessons FOR SELECT
  TO authenticated
  USING (
    is_preview = true OR
    course_id IN (SELECT id FROM public.courses WHERE creator_id = auth.uid()) OR
    course_id IN (SELECT course_id FROM public.course_enrollments WHERE user_id = auth.uid())
  );

CREATE POLICY "Creators can manage lessons"
  ON public.course_lessons FOR ALL
  TO authenticated
  USING (course_id IN (SELECT id FROM public.courses WHERE creator_id = auth.uid()));

-- RLS Policies for materials
CREATE POLICY "Users can view materials of enrolled courses"
  ON public.course_materials FOR SELECT
  TO authenticated
  USING (
    lesson_id IN (
      SELECT cl.id FROM public.course_lessons cl
      JOIN public.course_enrollments ce ON ce.course_id = cl.course_id
      WHERE ce.user_id = auth.uid()
    ) OR
    lesson_id IN (
      SELECT cl.id FROM public.course_lessons cl
      JOIN public.courses c ON c.id = cl.course_id
      WHERE c.creator_id = auth.uid()
    )
  );

CREATE POLICY "Creators can manage materials"
  ON public.course_materials FOR ALL
  TO authenticated
  USING (
    lesson_id IN (
      SELECT cl.id FROM public.course_lessons cl
      JOIN public.courses c ON c.id = cl.course_id
      WHERE c.creator_id = auth.uid()
    )
  );

-- RLS Policies for enrollments
CREATE POLICY "Users can view their enrollments"
  ON public.course_enrollments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR course_id IN (SELECT id FROM public.courses WHERE creator_id = auth.uid()));

CREATE POLICY "Users can create enrollments"
  ON public.course_enrollments FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for lesson progress
CREATE POLICY "Users can view and manage their progress"
  ON public.lesson_progress FOR ALL
  TO authenticated
  USING (enrollment_id IN (SELECT id FROM public.course_enrollments WHERE user_id = auth.uid()));

-- RLS Policies for discussions
CREATE POLICY "Users can view discussions on enrolled courses"
  ON public.lesson_discussions FOR SELECT
  TO authenticated
  USING (
    lesson_id IN (
      SELECT cl.id FROM public.course_lessons cl
      JOIN public.course_enrollments ce ON ce.course_id = cl.course_id
      WHERE ce.user_id = auth.uid()
    )
  );

CREATE POLICY "Enrolled users can post discussions"
  ON public.lesson_discussions FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id AND
    lesson_id IN (
      SELECT cl.id FROM public.course_lessons cl
      JOIN public.course_enrollments ce ON ce.course_id = cl.course_id
      WHERE ce.user_id = auth.uid()
    )
  );

-- Add triggers
CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();