
-- Create creative_forge_credits table
CREATE TABLE public.creative_forge_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create creative_forge_projects table
CREATE TABLE public.creative_forge_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  input_data JSONB,
  generated_content TEXT,
  style_reference TEXT,
  credits_used INTEGER NOT NULL DEFAULT 0,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.creative_forge_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_forge_projects ENABLE ROW LEVEL SECURITY;

-- RLS policies for credits
CREATE POLICY "Users can view own credits" ON public.creative_forge_credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits" ON public.creative_forge_credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits" ON public.creative_forge_credits
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for projects
CREATE POLICY "Users can view own projects" ON public.creative_forge_projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects" ON public.creative_forge_projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects" ON public.creative_forge_projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects" ON public.creative_forge_projects
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger for updated_at
CREATE TRIGGER update_creative_forge_credits_updated_at
  BEFORE UPDATE ON public.creative_forge_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creative_forge_projects_updated_at
  BEFORE UPDATE ON public.creative_forge_projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
