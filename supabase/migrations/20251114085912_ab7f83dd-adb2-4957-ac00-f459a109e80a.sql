-- Create live_lessons table
CREATE TABLE public.live_lessons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  instructor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'ended', 'cancelled')),
  room_url TEXT,
  max_participants INTEGER DEFAULT 50,
  recording_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create live_lesson_participants table
CREATE TABLE public.live_lesson_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.live_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  left_at TIMESTAMP WITH TIME ZONE,
  breakout_room_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(lesson_id, user_id)
);

-- Create whiteboard_strokes table for collaborative whiteboard
CREATE TABLE public.whiteboard_strokes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lesson_id UUID NOT NULL REFERENCES public.live_lessons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stroke_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.live_lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.live_lesson_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboard_strokes ENABLE ROW LEVEL SECURITY;

-- Policies for live_lessons
CREATE POLICY "Anyone can view live lessons"
  ON public.live_lessons
  FOR SELECT
  USING (true);

CREATE POLICY "Instructors can create live lessons"
  ON public.live_lessons
  FOR INSERT
  WITH CHECK (auth.uid() = instructor_id);

CREATE POLICY "Instructors can update their live lessons"
  ON public.live_lessons
  FOR UPDATE
  USING (auth.uid() = instructor_id);

CREATE POLICY "Instructors can delete their live lessons"
  ON public.live_lessons
  FOR DELETE
  USING (auth.uid() = instructor_id);

-- Policies for live_lesson_participants
CREATE POLICY "Users can view participants of lessons they're in"
  ON public.live_lesson_participants
  FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.live_lessons
      WHERE id = lesson_id AND instructor_id = auth.uid()
    )
  );

CREATE POLICY "Users can join live lessons"
  ON public.live_lesson_participants
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their participation"
  ON public.live_lesson_participants
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for whiteboard_strokes
CREATE POLICY "Participants can view whiteboard strokes"
  ON public.whiteboard_strokes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.live_lesson_participants
      WHERE lesson_id = whiteboard_strokes.lesson_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Participants can create whiteboard strokes"
  ON public.whiteboard_strokes
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.live_lesson_participants
      WHERE lesson_id = whiteboard_strokes.lesson_id AND user_id = auth.uid()
    )
  );

-- Create indexes for performance
CREATE INDEX idx_live_lessons_course_id ON public.live_lessons(course_id);
CREATE INDEX idx_live_lessons_instructor_id ON public.live_lessons(instructor_id);
CREATE INDEX idx_live_lessons_status ON public.live_lessons(status);
CREATE INDEX idx_live_lessons_scheduled_at ON public.live_lessons(scheduled_at);
CREATE INDEX idx_live_lesson_participants_lesson_id ON public.live_lesson_participants(lesson_id);
CREATE INDEX idx_live_lesson_participants_user_id ON public.live_lesson_participants(user_id);
CREATE INDEX idx_whiteboard_strokes_lesson_id ON public.whiteboard_strokes(lesson_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_live_lessons_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_live_lessons_updated_at
  BEFORE UPDATE ON public.live_lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.update_live_lessons_updated_at();

-- Enable realtime for live updates
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_lesson_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whiteboard_strokes;
ALTER TABLE public.live_lesson_participants REPLICA IDENTITY FULL;
ALTER TABLE public.whiteboard_strokes REPLICA IDENTITY FULL;