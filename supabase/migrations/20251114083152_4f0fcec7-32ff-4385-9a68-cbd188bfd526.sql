-- Create course reviews table
CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course certificates table
CREATE TABLE IF NOT EXISTS public.course_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  certificate_url TEXT,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Enable RLS
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_reviews
CREATE POLICY "Anyone can view reviews"
ON public.course_reviews
FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create reviews"
ON public.course_reviews
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews"
ON public.course_reviews
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews"
ON public.course_reviews
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- RLS Policies for course_certificates
CREATE POLICY "Users can view their own certificates"
ON public.course_certificates
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "System can create certificates"
ON public.course_certificates
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX idx_course_reviews_course_id ON public.course_reviews(course_id);
CREATE INDEX idx_course_reviews_user_id ON public.course_reviews(user_id);
CREATE INDEX idx_course_certificates_course_id ON public.course_certificates(course_id);
CREATE INDEX idx_course_certificates_user_id ON public.course_certificates(user_id);

-- Update timestamp trigger for reviews
CREATE TRIGGER update_course_reviews_updated_at
BEFORE UPDATE ON public.course_reviews
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();