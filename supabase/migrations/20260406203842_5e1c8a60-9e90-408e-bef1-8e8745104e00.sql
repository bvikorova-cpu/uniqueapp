
CREATE TABLE public.best_friend_mood_journal (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_label TEXT NOT NULL,
  journal_entry TEXT,
  ai_insight TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.best_friend_mood_journal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own mood entries" ON public.best_friend_mood_journal FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own mood entries" ON public.best_friend_mood_journal FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own mood entries" ON public.best_friend_mood_journal FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own mood entries" ON public.best_friend_mood_journal FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_best_friend_mood_journal_user ON public.best_friend_mood_journal(user_id);
CREATE INDEX idx_best_friend_mood_journal_created ON public.best_friend_mood_journal(created_at DESC);
