-- Create multiverse purchases table
CREATE TABLE IF NOT EXISTS public.multiverse_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  stripe_session_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create parallel universes table
CREATE TABLE IF NOT EXISTS public.parallel_universes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  universe_name TEXT NOT NULL,
  universe_description TEXT,
  parameters JSONB,
  divergence_point TEXT,
  success_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create reality jumps table
CREATE TABLE IF NOT EXISTS public.reality_jumps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  from_universe_id UUID REFERENCES public.parallel_universes(id) ON DELETE CASCADE,
  to_universe_id UUID REFERENCES public.parallel_universes(id) ON DELETE CASCADE,
  jump_reason TEXT,
  decision_data JSONB,
  jumped_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create timeline merges table
CREATE TABLE IF NOT EXISTS public.timeline_merges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  merged_universe_ids UUID[],
  result_universe_id UUID REFERENCES public.parallel_universes(id) ON DELETE CASCADE,
  optimization_data JSONB,
  merged_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create best self versions table
CREATE TABLE IF NOT EXISTS public.best_self_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  universe_id UUID REFERENCES public.parallel_universes(id) ON DELETE CASCADE,
  success_metrics JSONB,
  traits JSONB,
  achievements TEXT[],
  ranking INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.multiverse_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parallel_universes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_jumps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_merges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.best_self_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for multiverse_purchases
CREATE POLICY "Users can view own purchases"
  ON public.multiverse_purchases FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own purchases"
  ON public.multiverse_purchases FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for parallel_universes
CREATE POLICY "Users can view own universes"
  ON public.parallel_universes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own universes"
  ON public.parallel_universes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own universes"
  ON public.parallel_universes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own universes"
  ON public.parallel_universes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for reality_jumps
CREATE POLICY "Users can view own jumps"
  ON public.reality_jumps FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own jumps"
  ON public.reality_jumps FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for timeline_merges
CREATE POLICY "Users can view own merges"
  ON public.timeline_merges FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own merges"
  ON public.timeline_merges FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for best_self_versions
CREATE POLICY "Users can view own versions"
  ON public.best_self_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own versions"
  ON public.best_self_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create access check function
CREATE OR REPLACE FUNCTION public.has_multiverse_access(
  user_id_param UUID,
  service_type_param TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.multiverse_purchases
    WHERE user_id = user_id_param
    AND service_type = service_type_param
    AND status = 'active'
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$;