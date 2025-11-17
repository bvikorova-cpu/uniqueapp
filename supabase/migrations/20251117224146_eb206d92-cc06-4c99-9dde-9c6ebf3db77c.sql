-- Create MasterChef competitions table
CREATE TABLE IF NOT EXISTS public.masterchef_competitions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming',
  prize_amount DECIMAL(10, 2),
  description TEXT,
  rules TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create MasterChef competition entries table
CREATE TABLE IF NOT EXISTS public.masterchef_competition_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID NOT NULL REFERENCES public.masterchef_competitions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  dish_name TEXT NOT NULL,
  dish_description TEXT NOT NULL,
  dish_image_url TEXT NOT NULL,
  recipe TEXT,
  ingredients TEXT[],
  cooking_time INTEGER,
  difficulty_level TEXT,
  votes_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(competition_id, user_id)
);

-- Create MasterChef votes table
CREATE TABLE IF NOT EXISTS public.masterchef_votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_id UUID NOT NULL REFERENCES public.masterchef_competition_entries(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entry_id, user_id)
);

-- Enable RLS
ALTER TABLE public.masterchef_competitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masterchef_competition_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.masterchef_votes ENABLE ROW LEVEL SECURITY;

-- Policies for competitions (everyone can view)
CREATE POLICY "Anyone can view competitions"
  ON public.masterchef_competitions
  FOR SELECT
  USING (true);

-- Policies for entries (everyone can view, only entry owner can insert/update)
CREATE POLICY "Anyone can view competition entries"
  ON public.masterchef_competition_entries
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create entries"
  ON public.masterchef_competition_entries
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries"
  ON public.masterchef_competition_entries
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policies for votes (everyone can view their own votes, authenticated users can vote)
CREATE POLICY "Users can view their own votes"
  ON public.masterchef_votes
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can vote"
  ON public.masterchef_votes
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own votes"
  ON public.masterchef_votes
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to increment vote count
CREATE OR REPLACE FUNCTION increment_entry_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.masterchef_competition_entries
  SET votes_count = votes_count + 1
  WHERE id = NEW.entry_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrement vote count
CREATE OR REPLACE FUNCTION decrement_entry_votes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.masterchef_competition_entries
  SET votes_count = votes_count - 1
  WHERE id = OLD.entry_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for vote count
CREATE TRIGGER increment_votes_trigger
  AFTER INSERT ON public.masterchef_votes
  FOR EACH ROW
  EXECUTE FUNCTION increment_entry_votes();

CREATE TRIGGER decrement_votes_trigger
  AFTER DELETE ON public.masterchef_votes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_entry_votes();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_masterchef_competitions_updated_at
  BEFORE UPDATE ON public.masterchef_competitions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_masterchef_competition_entries_updated_at
  BEFORE UPDATE ON public.masterchef_competition_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();