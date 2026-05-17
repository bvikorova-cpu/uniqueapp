
-- 1. Chat Import Analyzer
CREATE TABLE public.lie_chat_imports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  source_app text NOT NULL DEFAULT 'whatsapp',
  raw_text text NOT NULL,
  message_count int NOT NULL DEFAULT 0,
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  overall_score int,
  credits_used int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_chat_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own chat_imports" ON public.lie_chat_imports FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 2. Email Lie Scan
CREATE TABLE public.lie_email_scans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  subject text,
  sender text,
  body text NOT NULL,
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  truthfulness_score int,
  credits_used int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_email_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own email_scans" ON public.lie_email_scans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Sentiment Timeline v2
CREATE TABLE public.lie_sentiment_timelines_v2 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Sentiment Timeline',
  points jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  credits_used int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_sentiment_timelines_v2 ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sentiment_timelines" ON public.lie_sentiment_timelines_v2 FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 4. Watchlist Triggers (no AI)
CREATE TABLE public.lie_watchlist_triggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  label text NOT NULL,
  keywords text[] NOT NULL DEFAULT '{}',
  notify boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_watchlist_triggers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own watchlist" ON public.lie_watchlist_triggers FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 5. Red Flag Dictionary
CREATE TABLE public.lie_red_flag_lookups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  phrase text NOT NULL,
  analysis jsonb NOT NULL DEFAULT '{}'::jsonb,
  credits_used int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_red_flag_lookups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own red_flag_lookups" ON public.lie_red_flag_lookups FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 6. Truth Chat Sessions
CREATE TABLE public.lie_truth_chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'Truth Chat',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_message_at timestamptz NOT NULL DEFAULT now(),
  credits_used int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_truth_chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own truth_chat" ON public.lie_truth_chat_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 7. Trust Scores
CREATE TABLE public.lie_trust_scores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contact_name text NOT NULL,
  score int NOT NULL DEFAULT 50,
  sample_count int NOT NULL DEFAULT 0,
  evidence jsonb NOT NULL DEFAULT '[]'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_trust_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own trust_scores" ON public.lie_trust_scores FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 8. Manipulation Tactic Classifications
CREATE TABLE public.lie_tactic_classifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  text text NOT NULL,
  tactics jsonb NOT NULL DEFAULT '[]'::jsonb,
  summary text,
  credits_used int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.lie_tactic_classifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tactic_classifications" ON public.lie_tactic_classifications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
