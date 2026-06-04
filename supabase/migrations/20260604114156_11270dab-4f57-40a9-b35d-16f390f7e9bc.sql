
CREATE TABLE public.mt_streak_claims (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  day INTEGER NOT NULL,
  reward_label TEXT NOT NULL,
  claimed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, day)
);
GRANT SELECT, INSERT ON public.mt_streak_claims TO authenticated;
GRANT ALL ON public.mt_streak_claims TO service_role;
ALTER TABLE public.mt_streak_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users select own streak claims" ON public.mt_streak_claims FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "users insert own streak claims" ON public.mt_streak_claims FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.mt_pinned_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  submission_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, submission_id)
);
GRANT SELECT ON public.mt_pinned_submissions TO anon;
GRANT SELECT, INSERT, DELETE ON public.mt_pinned_submissions TO authenticated;
GRANT ALL ON public.mt_pinned_submissions TO service_role;
ALTER TABLE public.mt_pinned_submissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "anyone can view pins" ON public.mt_pinned_submissions FOR SELECT USING (true);
CREATE POLICY "users insert own pins" ON public.mt_pinned_submissions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "users delete own pins" ON public.mt_pinned_submissions FOR DELETE TO authenticated USING (auth.uid() = user_id);
