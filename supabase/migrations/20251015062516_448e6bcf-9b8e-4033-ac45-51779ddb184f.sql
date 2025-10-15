-- Table for purchased learning content
CREATE TABLE IF NOT EXISTS public.purchased_learning_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'masterclass', 'workshop', 'certification')),
  content_id TEXT NOT NULL,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  purchase_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stripe_session_id TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- Table for course/content progress
CREATE TABLE IF NOT EXISTS public.learning_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'masterclass', 'workshop', 'certification')),
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  completed_modules JSONB DEFAULT '[]'::jsonb,
  current_module INTEGER DEFAULT 0,
  time_spent_minutes INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- Table for certificates
CREATE TABLE IF NOT EXISTS public.learning_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('course', 'masterclass', 'workshop', 'certification')),
  title TEXT NOT NULL,
  certificate_url TEXT,
  issue_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  certificate_number TEXT UNIQUE,
  instructor_name TEXT,
  completion_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, content_id, content_type)
);

-- Enable RLS
ALTER TABLE public.purchased_learning_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_certificates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for purchased_learning_content
CREATE POLICY "Users can view their own purchases"
  ON public.purchased_learning_content
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON public.purchased_learning_content
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchases"
  ON public.purchased_learning_content
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for learning_progress
CREATE POLICY "Users can view their own progress"
  ON public.learning_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress"
  ON public.learning_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.learning_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for learning_certificates
CREATE POLICY "Users can view their own certificates"
  ON public.learning_certificates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can create certificates"
  ON public.learning_certificates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Function to update progress timestamp
CREATE OR REPLACE FUNCTION update_learning_progress_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating progress timestamp
CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_progress_timestamp();

-- Function to generate certificate number
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT AS $$
DECLARE
  cert_number TEXT;
BEGIN
  cert_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  RETURN cert_number;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_purchased_content_user_id ON public.purchased_learning_content(user_id);
CREATE INDEX IF NOT EXISTS idx_purchased_content_content_id ON public.purchased_learning_content(content_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_user_id ON public.learning_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_learning_progress_content_id ON public.learning_progress(content_id);
CREATE INDEX IF NOT EXISTS idx_certificates_user_id ON public.learning_certificates(user_id);