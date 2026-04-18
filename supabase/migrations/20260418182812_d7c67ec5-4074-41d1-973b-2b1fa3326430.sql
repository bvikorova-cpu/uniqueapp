-- Credits table for Safety AI tools
CREATE TABLE public.safety_ai_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 20,
  total_credits_purchased INTEGER NOT NULL DEFAULT 20,
  last_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_ai_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own safety credits" ON public.safety_ai_credits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own safety credits" ON public.safety_ai_credits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own safety credits" ON public.safety_ai_credits FOR UPDATE USING (auth.uid() = user_id);

-- Bully Message Decoder
CREATE TABLE public.safety_bully_decoder (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  input_text TEXT,
  input_image_url TEXT,
  severity TEXT,
  bully_type TEXT,
  emotional_impact TEXT,
  suggested_response TEXT,
  action_steps JSONB,
  red_flags JSONB,
  status TEXT NOT NULL DEFAULT 'completed',
  credits_used INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_bully_decoder ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own decoder results" ON public.safety_bully_decoder FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own decoder results" ON public.safety_bully_decoder FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own decoder results" ON public.safety_bully_decoder FOR DELETE USING (auth.uid() = user_id);

-- Evidence Builder
CREATE TABLE public.safety_evidence_packs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  incident_summary TEXT,
  timeline JSONB,
  recommended_recipients JSONB,
  formal_report TEXT,
  attached_journal_ids JSONB,
  status TEXT NOT NULL DEFAULT 'completed',
  credits_used INTEGER NOT NULL DEFAULT 15,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_evidence_packs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own evidence packs" ON public.safety_evidence_packs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own evidence packs" ON public.safety_evidence_packs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own evidence packs" ON public.safety_evidence_packs FOR DELETE USING (auth.uid() = user_id);

-- Safe Response Coach
CREATE TABLE public.safety_response_coach_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scenario TEXT NOT NULL,
  user_response TEXT NOT NULL,
  assertiveness_score INTEGER,
  empathy_score INTEGER,
  safety_score INTEGER,
  feedback TEXT,
  improved_response TEXT,
  next_steps JSONB,
  credits_used INTEGER NOT NULL DEFAULT 8,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_response_coach_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own coach sessions" ON public.safety_response_coach_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own coach sessions" ON public.safety_response_coach_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own coach sessions" ON public.safety_response_coach_sessions FOR DELETE USING (auth.uid() = user_id);

-- Cyberbullying Risk Scan
CREATE TABLE public.safety_cyberbullying_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_input TEXT NOT NULL,
  risk_level TEXT,
  threat_patterns JSONB,
  flagged_phrases JSONB,
  safety_recommendations JSONB,
  overall_score INTEGER,
  credits_used INTEGER NOT NULL DEFAULT 12,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.safety_cyberbullying_scans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own risk scans" ON public.safety_cyberbullying_scans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own risk scans" ON public.safety_cyberbullying_scans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own risk scans" ON public.safety_cyberbullying_scans FOR DELETE USING (auth.uid() = user_id);

-- Auto-update timestamp
CREATE TRIGGER update_safety_ai_credits_updated_at
BEFORE UPDATE ON public.safety_ai_credits
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();