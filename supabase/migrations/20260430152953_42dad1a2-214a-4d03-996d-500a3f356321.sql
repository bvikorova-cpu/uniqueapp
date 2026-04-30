-- Kids Science Lab — quiz attempts + certificates
CREATE TABLE public.kids_science_quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'explorer',
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 5),
  total_questions INTEGER NOT NULL DEFAULT 5,
  questions_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  passed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ksqa_user ON public.kids_science_quiz_attempts(user_id, created_at DESC);
ALTER TABLE public.kids_science_quiz_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own science quiz attempts"
ON public.kids_science_quiz_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own science quiz attempts"
ON public.kids_science_quiz_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.kids_science_certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  child_name TEXT NOT NULL DEFAULT 'Young Scientist',
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'explorer',
  score INTEGER NOT NULL,
  total_questions INTEGER NOT NULL DEFAULT 5,
  attempt_id UUID REFERENCES public.kids_science_quiz_attempts(id) ON DELETE SET NULL,
  issued_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_ksc_user ON public.kids_science_certificates(user_id, issued_at DESC);
ALTER TABLE public.kids_science_certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own science certificates"
ON public.kids_science_certificates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own science certificates"
ON public.kids_science_certificates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own science certificates"
ON public.kids_science_certificates FOR DELETE
USING (auth.uid() = user_id);