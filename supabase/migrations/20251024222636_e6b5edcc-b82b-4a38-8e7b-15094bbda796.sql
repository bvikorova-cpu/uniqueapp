-- Recipe interactions (likes, comments, ratings)
CREATE TABLE IF NOT EXISTS public.recipe_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.recipe_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.recipe_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID NOT NULL,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(recipe_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id),
  unlocked_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.recipe_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for recipe_likes
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_likes' AND policyname = 'Users can view all likes') THEN
    CREATE POLICY "Users can view all likes" ON public.recipe_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_likes' AND policyname = 'Users can insert their own likes') THEN
    CREATE POLICY "Users can insert their own likes" ON public.recipe_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_likes' AND policyname = 'Users can delete their own likes') THEN
    CREATE POLICY "Users can delete their own likes" ON public.recipe_likes FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for recipe_comments
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_comments' AND policyname = 'Users can view all comments') THEN
    CREATE POLICY "Users can view all comments" ON public.recipe_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_comments' AND policyname = 'Users can insert their own comments') THEN
    CREATE POLICY "Users can insert their own comments" ON public.recipe_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_comments' AND policyname = 'Users can update their own comments') THEN
    CREATE POLICY "Users can update their own comments" ON public.recipe_comments FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_comments' AND policyname = 'Users can delete their own comments') THEN
    CREATE POLICY "Users can delete their own comments" ON public.recipe_comments FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for recipe_ratings
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_ratings' AND policyname = 'Users can view all ratings') THEN
    CREATE POLICY "Users can view all ratings" ON public.recipe_ratings FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_ratings' AND policyname = 'Users can insert their own ratings') THEN
    CREATE POLICY "Users can insert their own ratings" ON public.recipe_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_ratings' AND policyname = 'Users can update their own ratings') THEN
    CREATE POLICY "Users can update their own ratings" ON public.recipe_ratings FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'recipe_ratings' AND policyname = 'Users can delete their own ratings') THEN
    CREATE POLICY "Users can delete their own ratings" ON public.recipe_ratings FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

-- RLS Policies for achievements
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'achievements' AND policyname = 'Everyone can view achievements') THEN
    CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (true);
  END IF;
END $$;

-- RLS Policies for user_achievements
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can view all user achievements') THEN
    CREATE POLICY "Users can view all user achievements" ON public.user_achievements FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_achievements' AND policyname = 'Users can insert their own achievements') THEN
    CREATE POLICY "Users can insert their own achievements" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Triggers for updated_at
CREATE OR REPLACE FUNCTION public.handle_recipe_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_recipe_comments_updated_at') THEN
    CREATE TRIGGER update_recipe_comments_updated_at
      BEFORE UPDATE ON public.recipe_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_recipe_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_recipe_ratings_updated_at') THEN
    CREATE TRIGGER update_recipe_ratings_updated_at
      BEFORE UPDATE ON public.recipe_ratings
      FOR EACH ROW
      EXECUTE FUNCTION public.handle_recipe_updated_at();
  END IF;
END $$;

-- Insert default achievements
INSERT INTO public.achievements (code, name, description, icon, points) VALUES
  ('first_recipe', 'First Recipe', 'Created your first recipe', 'ChefHat', 10),
  ('social_butterfly', 'Social Butterfly', 'Received 10 likes on your recipes', 'Heart', 25),
  ('master_chef', 'Master Chef', 'Created 50 recipes', 'Trophy', 100),
  ('helpful_critic', 'Helpful Critic', 'Left 25 comments', 'MessageCircle', 50),
  ('five_star_chef', 'Five Star Chef', 'Received 20 five-star ratings', 'Star', 75)
ON CONFLICT (code) DO NOTHING;