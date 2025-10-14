-- Create tables for Career Hub features

-- Interview Sessions
CREATE TABLE IF NOT EXISTS public.interview_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  job_description TEXT,
  difficulty_level TEXT NOT NULL DEFAULT 'intermediate',
  duration_minutes INTEGER DEFAULT 0,
  questions_asked JSONB DEFAULT '[]'::jsonb,
  answers_given JSONB DEFAULT '[]'::jsonb,
  ai_feedback TEXT,
  overall_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- CV Documents
CREATE TABLE IF NOT EXISTS public.cv_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  original_content TEXT NOT NULL,
  optimized_content TEXT,
  ai_suggestions JSONB DEFAULT '[]'::jsonb,
  target_role TEXT,
  format TEXT DEFAULT 'pdf',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- LinkedIn Profile Enhancements
CREATE TABLE IF NOT EXISTS public.linkedin_enhancements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_profile TEXT NOT NULL,
  enhanced_profile TEXT,
  suggestions JSONB DEFAULT '[]'::jsonb,
  target_industry TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Salary Negotiation Sessions
CREATE TABLE IF NOT EXISTS public.negotiation_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_title TEXT NOT NULL,
  current_salary NUMERIC,
  target_salary NUMERIC,
  conversation_history JSONB DEFAULT '[]'::jsonb,
  ai_advice TEXT,
  negotiation_strategy TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cv_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.linkedin_enhancements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.negotiation_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions"
  ON public.interview_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview sessions"
  ON public.interview_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions"
  ON public.interview_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview sessions"
  ON public.interview_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for cv_documents
CREATE POLICY "Users can view their own CV documents"
  ON public.cv_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own CV documents"
  ON public.cv_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own CV documents"
  ON public.cv_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CV documents"
  ON public.cv_documents FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for linkedin_enhancements
CREATE POLICY "Users can view their own LinkedIn enhancements"
  ON public.linkedin_enhancements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own LinkedIn enhancements"
  ON public.linkedin_enhancements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own LinkedIn enhancements"
  ON public.linkedin_enhancements FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own LinkedIn enhancements"
  ON public.linkedin_enhancements FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for negotiation_sessions
CREATE POLICY "Users can view their own negotiation sessions"
  ON public.negotiation_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own negotiation sessions"
  ON public.negotiation_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own negotiation sessions"
  ON public.negotiation_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own negotiation sessions"
  ON public.negotiation_sessions FOR DELETE
  USING (auth.uid() = user_id);