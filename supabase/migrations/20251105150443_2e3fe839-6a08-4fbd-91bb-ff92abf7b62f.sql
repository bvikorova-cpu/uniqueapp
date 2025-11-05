-- Create sports_predictions table
CREATE TABLE IF NOT EXISTS public.sports_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID NOT NULL REFERENCES public.sports_matches(id) ON DELETE CASCADE,
  tipster_id UUID REFERENCES auth.users(id),
  prediction_type TEXT NOT NULL, -- e.g., "Home Win", "Over 2.5", "Home -5.5", etc.
  confidence INTEGER NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  odds DECIMAL(5,2),
  analysis TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sports_predictions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view predictions"
  ON public.sports_predictions
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create predictions"
  ON public.sports_predictions
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own predictions"
  ON public.sports_predictions
  FOR UPDATE
  USING (auth.uid() = tipster_id);

CREATE POLICY "Users can delete their own predictions"
  ON public.sports_predictions
  FOR DELETE
  USING (auth.uid() = tipster_id);

-- Create index for better performance
CREATE INDEX idx_sports_predictions_match_id ON public.sports_predictions(match_id);
CREATE INDEX idx_sports_predictions_tipster_id ON public.sports_predictions(tipster_id);

-- Trigger for updated_at
CREATE TRIGGER update_sports_predictions_updated_at
  BEFORE UPDATE ON public.sports_predictions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_sports_updated_at();