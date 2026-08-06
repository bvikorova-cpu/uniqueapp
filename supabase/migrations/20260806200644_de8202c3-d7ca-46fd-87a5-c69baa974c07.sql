CREATE TABLE public.emotion_mood_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mood_text text NOT NULL,
  dominant_emotion text NOT NULL,
  breakdown jsonb NOT NULL DEFAULT '{}'::jsonb,
  insight text,
  credits_spent integer NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.emotion_mood_generations TO authenticated;
GRANT ALL ON public.emotion_mood_generations TO service_role;
ALTER TABLE public.emotion_mood_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own mood generations"
  ON public.emotion_mood_generations FOR SELECT TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users create own mood generations"
  ON public.emotion_mood_generations FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_emotion_mood_gen_user ON public.emotion_mood_generations(user_id, created_at DESC);

CREATE TABLE public.emotion_exchange_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  offer_emotion text NOT NULL,
  offer_amount integer NOT NULL DEFAULT 10,
  want_emotion text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  matched_with uuid,
  matched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.emotion_exchange_queue TO authenticated;
GRANT ALL ON public.emotion_exchange_queue TO service_role;
ALTER TABLE public.emotion_exchange_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view exchange queue"
  ON public.emotion_exchange_queue FOR SELECT TO authenticated
  USING (true);
CREATE POLICY "Users create own exchange offers"
  ON public.emotion_exchange_queue FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own exchange offers"
  ON public.emotion_exchange_queue FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);
CREATE POLICY "Users delete own exchange offers"
  ON public.emotion_exchange_queue FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX idx_emotion_exchange_queue_open ON public.emotion_exchange_queue(status, offer_emotion, want_emotion);

CREATE TABLE public.emotion_exchange_matches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a uuid NOT NULL,
  emotion_a text NOT NULL,
  amount_a integer NOT NULL,
  user_b uuid NOT NULL,
  emotion_b text NOT NULL,
  amount_b integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.emotion_exchange_matches TO authenticated;
GRANT ALL ON public.emotion_exchange_matches TO service_role;
ALTER TABLE public.emotion_exchange_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants view own exchange matches"
  ON public.emotion_exchange_matches FOR SELECT TO authenticated
  USING (auth.uid() = user_a OR auth.uid() = user_b);

CREATE INDEX idx_emotion_exchange_matches_users ON public.emotion_exchange_matches(user_a, user_b, created_at DESC);