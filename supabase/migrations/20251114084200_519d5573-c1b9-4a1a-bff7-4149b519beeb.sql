-- Create course discussions table
CREATE TABLE IF NOT EXISTS public.course_discussions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false,
  is_answered BOOLEAN DEFAULT false,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create discussion replies table
CREATE TABLE IF NOT EXISTS public.discussion_replies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  discussion_id UUID NOT NULL REFERENCES public.course_discussions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  is_instructor_reply BOOLEAN DEFAULT false,
  is_accepted_answer BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.course_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_discussions
CREATE POLICY "Anyone can view discussions"
ON public.course_discussions
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create discussions"
ON public.course_discussions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own discussions"
ON public.course_discussions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own discussions"
ON public.course_discussions
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for discussion_replies
CREATE POLICY "Anyone can view replies"
ON public.discussion_replies
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create replies"
ON public.discussion_replies
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own replies"
ON public.discussion_replies
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own replies"
ON public.discussion_replies
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_course_discussions_course_id ON public.course_discussions(course_id);
CREATE INDEX idx_course_discussions_user_id ON public.course_discussions(user_id);
CREATE INDEX idx_course_discussions_created_at ON public.course_discussions(created_at DESC);
CREATE INDEX idx_discussion_replies_discussion_id ON public.discussion_replies(discussion_id);
CREATE INDEX idx_discussion_replies_user_id ON public.discussion_replies(user_id);

-- Update timestamp triggers
CREATE TRIGGER update_course_discussions_updated_at
BEFORE UPDATE ON public.course_discussions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_discussion_replies_updated_at
BEFORE UPDATE ON public.discussion_replies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();