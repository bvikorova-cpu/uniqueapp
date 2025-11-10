-- Create certificates table for educational achievements
CREATE TABLE IF NOT EXISTS public.educational_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  certificate_number TEXT NOT NULL UNIQUE DEFAULT generate_certificate_number(),
  student_name TEXT NOT NULL,
  total_topics_completed INTEGER NOT NULL DEFAULT 0,
  total_stars_earned INTEGER NOT NULL DEFAULT 0,
  average_quiz_score DECIMAL(5,2) NOT NULL DEFAULT 0,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.educational_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own certificates"
  ON public.educational_certificates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificates"
  ON public.educational_certificates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_educational_certificates_user_id ON public.educational_certificates(user_id);
CREATE INDEX idx_educational_certificates_certificate_number ON public.educational_certificates(certificate_number);