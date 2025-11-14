-- Create table for storing historical matches
CREATE TABLE public.historical_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL,
  user_image_url TEXT,
  matches JSONB NOT NULL,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.historical_matches ENABLE ROW LEVEL SECURITY;

-- Create policies for historical_matches
CREATE POLICY "Users can view their own matches" 
ON public.historical_matches 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public matches" 
ON public.historical_matches 
FOR SELECT 
USING (is_public = true);

CREATE POLICY "Users can create their own matches" 
ON public.historical_matches 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own matches" 
ON public.historical_matches 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own matches" 
ON public.historical_matches 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_historical_matches_updated_at
BEFORE UPDATE ON public.historical_matches
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster queries
CREATE INDEX idx_historical_matches_user_id ON public.historical_matches(user_id);
CREATE INDEX idx_historical_matches_public ON public.historical_matches(is_public) WHERE is_public = true;
CREATE INDEX idx_historical_matches_created_at ON public.historical_matches(created_at DESC);