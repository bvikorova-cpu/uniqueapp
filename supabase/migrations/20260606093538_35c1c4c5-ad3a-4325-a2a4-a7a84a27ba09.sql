
CREATE TABLE public.dating_ai_prompt_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature text NOT NULL,
  variant_key text NOT NULL,
  prompt text NOT NULL,
  weight int NOT NULL DEFAULT 1,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(feature, variant_key)
);
GRANT SELECT ON public.dating_ai_prompt_variants TO authenticated, anon;
GRANT ALL ON public.dating_ai_prompt_variants TO service_role;
ALTER TABLE public.dating_ai_prompt_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "read active variants" ON public.dating_ai_prompt_variants FOR SELECT USING (active = true);

CREATE TABLE public.dating_ai_experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feature text NOT NULL,
  variant_key text NOT NULL,
  match_id uuid,
  used boolean NOT NULL DEFAULT false,
  led_to_message boolean NOT NULL DEFAULT false,
  led_to_reply boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.dating_ai_experiments TO authenticated;
GRANT ALL ON public.dating_ai_experiments TO service_role;
ALTER TABLE public.dating_ai_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own experiments select" ON public.dating_ai_experiments FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own experiments insert" ON public.dating_ai_experiments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own experiments update" ON public.dating_ai_experiments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE INDEX idx_dating_ai_experiments_user_feat ON public.dating_ai_experiments (user_id, feature, created_at DESC);
CREATE INDEX idx_dating_ai_experiments_variant ON public.dating_ai_experiments (feature, variant_key);

INSERT INTO public.dating_ai_prompt_variants (feature, variant_key, prompt, weight) VALUES
('conversation_starter', 'playful_v1',
 'You are a witty wingperson. Generate 3 short, playful conversation starters (max 140 chars each) for a dating app match. Use humor, light teasing and reference something concrete from their profile. Output JSON: {"starters":["...","...","..."]}',
 1),
('conversation_starter', 'sincere_v1',
 'You are a thoughtful relationship coach. Generate 3 sincere, curious openers (max 140 chars each) that ask a meaningful question grounded in the match profile. Output JSON: {"starters":["...","...","..."]}',
 1),
('conversation_starter', 'witty_question_v1',
 'You are a creative copywriter. Generate 3 unexpected "would you rather" / hypothetical questions (max 140 chars each) tailored to interests in the match profile. Output JSON: {"starters":["...","...","..."]}',
 1);
