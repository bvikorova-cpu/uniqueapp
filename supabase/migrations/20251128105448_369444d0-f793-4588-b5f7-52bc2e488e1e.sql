-- Safety Journal for tracking incidents
CREATE TABLE public.safety_journal_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  incident_type TEXT,
  description TEXT,
  location TEXT,
  witnesses TEXT,
  mood_rating INTEGER CHECK (mood_rating >= 1 AND mood_rating <= 10),
  evidence_urls TEXT[],
  is_reported BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.safety_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own journal entries"
ON public.safety_journal_entries FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Anonymous Stories for community sharing
CREATE TABLE public.safety_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  is_anonymous BOOLEAN DEFAULT true,
  support_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.safety_stories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved stories"
ON public.safety_stories FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create stories"
ON public.safety_stories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own stories"
ON public.safety_stories FOR UPDATE
USING (auth.uid() = user_id);

-- Story support tracking
CREATE TABLE public.safety_story_supports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID REFERENCES public.safety_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(story_id, user_id)
);

ALTER TABLE public.safety_story_supports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their supports"
ON public.safety_story_supports FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Anonymous Support Wall messages
CREATE TABLE public.safety_support_wall (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  encouragement_count INTEGER DEFAULT 0,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.safety_support_wall ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved messages"
ON public.safety_support_wall FOR SELECT
USING (is_approved = true);

CREATE POLICY "Users can create messages"
ON public.safety_support_wall FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Course progress tracking
CREATE TABLE public.safety_course_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  quiz_score INTEGER,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id, lesson_id)
);

ALTER TABLE public.safety_course_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their progress"
ON public.safety_course_progress FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Badges earned by users
CREATE TABLE public.safety_badges_earned (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

ALTER TABLE public.safety_badges_earned ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their badges"
ON public.safety_badges_earned FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can earn badges"
ON public.safety_badges_earned FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Function to increment support count
CREATE OR REPLACE FUNCTION public.increment_story_support()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.safety_stories 
  SET support_count = support_count + 1 
  WHERE id = NEW.story_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_story_support_added
  AFTER INSERT ON public.safety_story_supports
  FOR EACH ROW EXECUTE FUNCTION public.increment_story_support();