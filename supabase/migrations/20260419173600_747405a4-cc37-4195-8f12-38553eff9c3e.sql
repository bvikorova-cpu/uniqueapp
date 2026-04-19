-- Daily AI question per match
CREATE TABLE IF NOT EXISTS public.anonymous_dating_daily_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.anonymous_dating_matches(id) ON DELETE CASCADE,
  question_date DATE NOT NULL DEFAULT CURRENT_DATE,
  question TEXT NOT NULL,
  user1_answer TEXT,
  user2_answer TEXT,
  generated_by UUID NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, question_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_q_match ON public.anonymous_dating_daily_questions(match_id);

ALTER TABLE public.anonymous_dating_daily_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants read daily questions"
ON public.anonymous_dating_daily_questions FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.anonymous_dating_matches mt
  WHERE mt.id = anonymous_dating_daily_questions.match_id
    AND (mt.user1_id = auth.uid() OR mt.user2_id = auth.uid())
));

CREATE POLICY "Participants insert daily questions"
ON public.anonymous_dating_daily_questions FOR INSERT
WITH CHECK (
  generated_by = auth.uid() AND EXISTS (
    SELECT 1 FROM public.anonymous_dating_matches mt
    WHERE mt.id = anonymous_dating_daily_questions.match_id
      AND (mt.user1_id = auth.uid() OR mt.user2_id = auth.uid())
  )
);

CREATE POLICY "Participants update their answer"
ON public.anonymous_dating_daily_questions FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.anonymous_dating_matches mt
  WHERE mt.id = anonymous_dating_daily_questions.match_id
    AND (mt.user1_id = auth.uid() OR mt.user2_id = auth.uid())
));

ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_dating_daily_questions;
ALTER TABLE public.anonymous_dating_daily_questions REPLICA IDENTITY FULL;

-- Safe word per user per match
CREATE TABLE IF NOT EXISTS public.anonymous_dating_safe_words (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.anonymous_dating_matches(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  safe_word TEXT NOT NULL,
  triggered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (match_id, user_id)
);

ALTER TABLE public.anonymous_dating_safe_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner reads own safe word"
ON public.anonymous_dating_safe_words FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Owner upserts own safe word"
ON public.anonymous_dating_safe_words FOR INSERT
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owner updates own safe word"
ON public.anonymous_dating_safe_words FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Owner deletes own safe word"
ON public.anonymous_dating_safe_words FOR DELETE
USING (user_id = auth.uid());

-- Mutual reveal lock window
ALTER TABLE public.anonymous_dating_matches
ADD COLUMN IF NOT EXISTS reveal_request_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reveal_request_by UUID;
