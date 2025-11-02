-- Create character_credits table for monetization
CREATE TABLE IF NOT EXISTS public.character_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create characters table
CREATE TABLE IF NOT EXISTS public.characters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- superhero, anime, fantasy, sci-fi, cartoon, villain
  description TEXT,
  backstory TEXT,
  image_url TEXT,
  
  -- Stats
  hp INTEGER NOT NULL DEFAULT 100,
  attack INTEGER NOT NULL DEFAULT 50,
  defense INTEGER NOT NULL DEFAULT 50,
  speed INTEGER NOT NULL DEFAULT 50,
  special_power TEXT,
  
  -- Progression
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  popularity_score INTEGER NOT NULL DEFAULT 0,
  
  -- Premium features
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_animated BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create character_battles table
CREATE TABLE IF NOT EXISTS public.character_battles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_type TEXT NOT NULL, -- quick, tournament, popularity
  character1_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  character2_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  winner_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  battle_commentary TEXT,
  character1_votes INTEGER NOT NULL DEFAULT 0,
  character2_votes INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active, completed
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create character_votes table
CREATE TABLE IF NOT EXISTS public.character_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  battle_id UUID NOT NULL REFERENCES public.character_battles(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(battle_id, user_id)
);

-- Create tournaments table
CREATE TABLE IF NOT EXISTS public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  entry_fee INTEGER NOT NULL DEFAULT 5,
  prize_pool INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'registration', -- registration, in_progress, completed
  max_participants INTEGER NOT NULL DEFAULT 16,
  current_round INTEGER NOT NULL DEFAULT 0,
  winner_id UUID REFERENCES public.characters(id) ON DELETE SET NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tournament_participants table
CREATE TABLE IF NOT EXISTS public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  eliminated BOOLEAN NOT NULL DEFAULT false,
  placement INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(tournament_id, character_id)
);

-- Create character_posts table (Social Feed)
CREATE TABLE IF NOT EXISTS public.character_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  likes_count INTEGER NOT NULL DEFAULT 0,
  comments_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create character_comments table
CREATE TABLE IF NOT EXISTS public.character_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.character_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create character_post_likes table
CREATE TABLE IF NOT EXISTS public.character_post_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.character_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(post_id, user_id)
);

-- Create character_follows table
CREATE TABLE IF NOT EXISTS public.character_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_user_id UUID NOT NULL,
  character_id UUID NOT NULL REFERENCES public.characters(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(follower_user_id, character_id)
);

-- Enable RLS
ALTER TABLE public.character_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.characters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_battles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.character_follows ENABLE ROW LEVEL SECURITY;

-- RLS Policies for character_credits
CREATE POLICY "Users can view their own credits"
  ON public.character_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits"
  ON public.character_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits"
  ON public.character_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for characters
CREATE POLICY "Anyone can view characters"
  ON public.characters FOR SELECT
  USING (true);

CREATE POLICY "Users can create their own characters"
  ON public.characters FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own characters"
  ON public.characters FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own characters"
  ON public.characters FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for character_battles
CREATE POLICY "Anyone can view battles"
  ON public.character_battles FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create battles"
  ON public.character_battles FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for character_votes
CREATE POLICY "Anyone can view votes"
  ON public.character_votes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON public.character_votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for tournaments
CREATE POLICY "Anyone can view tournaments"
  ON public.tournaments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create tournaments"
  ON public.tournaments FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for tournament_participants
CREATE POLICY "Anyone can view tournament participants"
  ON public.tournament_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join tournaments with their characters"
  ON public.tournament_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for character_posts (Social Feed)
CREATE POLICY "Anyone can view posts"
  ON public.character_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts for their characters"
  ON public.character_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON public.character_posts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON public.character_posts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for character_comments
CREATE POLICY "Anyone can view comments"
  ON public.character_comments FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can comment"
  ON public.character_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON public.character_comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for character_post_likes
CREATE POLICY "Anyone can view likes"
  ON public.character_post_likes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can like posts"
  ON public.character_post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unlike posts"
  ON public.character_post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for character_follows
CREATE POLICY "Anyone can view follows"
  ON public.character_follows FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can follow characters"
  ON public.character_follows FOR INSERT
  WITH CHECK (auth.uid() = follower_user_id);

CREATE POLICY "Users can unfollow characters"
  ON public.character_follows FOR DELETE
  USING (auth.uid() = follower_user_id);

-- Triggers
CREATE OR REPLACE FUNCTION public.update_character_credits_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_character_credits_updated_at
  BEFORE UPDATE ON public.character_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_character_credits_timestamp();

CREATE OR REPLACE FUNCTION public.update_character_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON public.characters
  FOR EACH ROW
  EXECUTE FUNCTION public.update_character_timestamp();

-- Trigger to update post likes count
CREATE OR REPLACE FUNCTION public.update_character_post_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.character_posts
    SET likes_count = likes_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.character_posts
    SET likes_count = GREATEST(likes_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_character_post_likes_count_trigger
  AFTER INSERT OR DELETE ON public.character_post_likes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_character_post_likes_count();

-- Trigger to update comments count
CREATE OR REPLACE FUNCTION public.update_character_post_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.character_posts
    SET comments_count = comments_count + 1
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.character_posts
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_character_post_comments_count_trigger
  AFTER INSERT OR DELETE ON public.character_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_character_post_comments_count();

-- Trigger to update battle votes
CREATE OR REPLACE FUNCTION public.update_battle_votes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.character_id = (SELECT character1_id FROM public.character_battles WHERE id = NEW.battle_id) THEN
      UPDATE public.character_battles
      SET character1_votes = character1_votes + 1
      WHERE id = NEW.battle_id;
    ELSE
      UPDATE public.character_battles
      SET character2_votes = character2_votes + 1
      WHERE id = NEW.battle_id;
    END IF;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_battle_votes_count_trigger
  AFTER INSERT ON public.character_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_battle_votes_count();