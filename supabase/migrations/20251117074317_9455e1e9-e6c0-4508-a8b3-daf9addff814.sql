-- Blockchain Confessions Tables

-- Table for storing confession purchases
CREATE TABLE IF NOT EXISTS public.confession_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  purchase_type TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for confessions
CREATE TABLE IF NOT EXISTS public.confessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  confession_text TEXT NOT NULL,
  sin_category TEXT,
  severity_score INTEGER,
  is_anonymous BOOLEAN DEFAULT true,
  absolution_votes INTEGER DEFAULT 0,
  condemnation_votes INTEGER DEFAULT 0,
  absolution_tokens_used INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for absolution voting
CREATE TABLE IF NOT EXISTS public.absolution_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confession_id UUID NOT NULL REFERENCES public.confessions(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('absolve', 'condemn')),
  tokens_spent INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(confession_id, voter_id)
);

-- Table for redemption progress
CREATE TABLE IF NOT EXISTS public.redemption_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  confession_id UUID REFERENCES public.confessions(id) ON DELETE SET NULL,
  redemption_plan JSONB,
  milestones_completed INTEGER DEFAULT 0,
  total_milestones INTEGER DEFAULT 0,
  progress_percentage INTEGER DEFAULT 0,
  counseling_sessions JSONB,
  certificate_earned BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for absolution tokens
CREATE TABLE IF NOT EXISTS public.absolution_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  tokens_remaining INTEGER DEFAULT 0,
  tokens_purchased INTEGER DEFAULT 0,
  tokens_used INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.confession_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.confessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absolution_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.redemption_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.absolution_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for confession_purchases
CREATE POLICY "Users can view their own purchases"
  ON public.confession_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchases"
  ON public.confession_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for confessions (public can read, users can insert their own)
CREATE POLICY "Anyone can view confessions"
  ON public.confessions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own confessions"
  ON public.confessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own confessions"
  ON public.confessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for absolution_votes
CREATE POLICY "Anyone can view votes"
  ON public.absolution_votes FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own votes"
  ON public.absolution_votes FOR INSERT
  WITH CHECK (auth.uid() = voter_id);

-- RLS Policies for redemption_progress
CREATE POLICY "Users can view their own redemption progress"
  ON public.redemption_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own redemption progress"
  ON public.redemption_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own redemption progress"
  ON public.redemption_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for absolution_tokens
CREATE POLICY "Users can view their own tokens"
  ON public.absolution_tokens FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tokens"
  ON public.absolution_tokens FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tokens"
  ON public.absolution_tokens FOR UPDATE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_confession_purchases_user_id ON public.confession_purchases(user_id);
CREATE INDEX IF NOT EXISTS idx_confessions_user_id ON public.confessions(user_id);
CREATE INDEX IF NOT EXISTS idx_confessions_status ON public.confessions(status);
CREATE INDEX IF NOT EXISTS idx_absolution_votes_confession_id ON public.absolution_votes(confession_id);
CREATE INDEX IF NOT EXISTS idx_redemption_progress_user_id ON public.redemption_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_absolution_tokens_user_id ON public.absolution_tokens(user_id);

-- Function to check confession service access
CREATE OR REPLACE FUNCTION public.has_confession_access(
  user_id_param UUID,
  service_type_param TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.confession_purchases
    WHERE user_id = user_id_param
    AND service_type = service_type_param
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;