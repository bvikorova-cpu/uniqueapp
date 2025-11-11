-- Create sponsor_goals table for tracking sponsor performance goals
CREATE TABLE IF NOT EXISTS public.sponsor_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sponsor_id UUID NOT NULL REFERENCES public.brand_sponsors(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('votes', 'rank', 'daily_average')),
  target_value INTEGER NOT NULL CHECK (target_value > 0),
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sponsor_id)
);

-- Enable RLS
ALTER TABLE public.sponsor_goals ENABLE ROW LEVEL SECURITY;

-- Create policies for sponsor_goals
CREATE POLICY "Sponsors can view their own goals"
  ON public.sponsor_goals
  FOR SELECT
  USING (
    sponsor_id IN (
      SELECT id FROM public.brand_sponsors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sponsors can create their own goals"
  ON public.sponsor_goals
  FOR INSERT
  WITH CHECK (
    sponsor_id IN (
      SELECT id FROM public.brand_sponsors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sponsors can update their own goals"
  ON public.sponsor_goals
  FOR UPDATE
  USING (
    sponsor_id IN (
      SELECT id FROM public.brand_sponsors WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Sponsors can delete their own goals"
  ON public.sponsor_goals
  FOR DELETE
  USING (
    sponsor_id IN (
      SELECT id FROM public.brand_sponsors WHERE user_id = auth.uid()
    )
  );

-- Create trigger for updated_at
CREATE TRIGGER update_sponsor_goals_updated_at
  BEFORE UPDATE ON public.sponsor_goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_sponsor_goals_sponsor_id ON public.sponsor_goals(sponsor_id);
CREATE INDEX idx_sponsor_goals_status ON public.sponsor_goals(status);