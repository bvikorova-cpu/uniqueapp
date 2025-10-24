-- Create cooking credits table
CREATE TABLE IF NOT EXISTS public.cooking_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credits INTEGER NOT NULL DEFAULT 10,
  subscription_tier TEXT CHECK (subscription_tier IN ('free', 'basic', 'premium', 'pro')) DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create recipe generations table
CREATE TABLE IF NOT EXISTS public.recipe_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ingredients TEXT[] NOT NULL,
  dietary_preferences TEXT[],
  generated_recipes JSONB NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create meal plans table
CREATE TABLE IF NOT EXISTS public.meal_plans_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_name TEXT NOT NULL,
  days_count INTEGER NOT NULL,
  meals JSONB NOT NULL,
  shopping_list JSONB,
  total_calories INTEGER,
  dietary_preferences TEXT[],
  credits_used INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create food scans history table
CREATE TABLE IF NOT EXISTS public.food_scans_ai (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  recognized_items JSONB NOT NULL,
  nutritional_info JSONB NOT NULL,
  healthier_alternatives JSONB,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create restaurant menu analysis table
CREATE TABLE IF NOT EXISTS public.restaurant_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  restaurant_name TEXT,
  menu_image_url TEXT,
  analysis JSONB NOT NULL,
  recommendations JSONB NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create chef chat sessions table
CREATE TABLE IF NOT EXISTS public.chef_chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]'::jsonb,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create wine pairing table
CREATE TABLE IF NOT EXISTS public.wine_pairings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dish_name TEXT NOT NULL,
  pairing_suggestions JSONB NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.cooking_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_generations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_plans_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_scans_ai ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chef_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wine_pairings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cooking_credits
CREATE POLICY "Users can view own cooking credits"
  ON public.cooking_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own cooking credits"
  ON public.cooking_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own cooking credits"
  ON public.cooking_credits FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for recipe_generations
CREATE POLICY "Users can view own recipe generations"
  ON public.recipe_generations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recipe generations"
  ON public.recipe_generations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for meal_plans_ai
CREATE POLICY "Users can view own meal plans"
  ON public.meal_plans_ai FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meal plans"
  ON public.meal_plans_ai FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meal plans"
  ON public.meal_plans_ai FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for food_scans_ai
CREATE POLICY "Users can view own food scans"
  ON public.food_scans_ai FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own food scans"
  ON public.food_scans_ai FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for restaurant_analyses
CREATE POLICY "Users can view own restaurant analyses"
  ON public.restaurant_analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own restaurant analyses"
  ON public.restaurant_analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for chef_chat_sessions
CREATE POLICY "Users can view own chef chat sessions"
  ON public.chef_chat_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chef chat sessions"
  ON public.chef_chat_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own chef chat sessions"
  ON public.chef_chat_sessions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for wine_pairings
CREATE POLICY "Users can view own wine pairings"
  ON public.wine_pairings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wine pairings"
  ON public.wine_pairings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for cooking_credits updated_at
CREATE TRIGGER update_cooking_credits_updated_at
  BEFORE UPDATE ON public.cooking_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for chef_chat_sessions updated_at
CREATE TRIGGER update_chef_chat_sessions_updated_at
  BEFORE UPDATE ON public.chef_chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_recipe_generations_user_id ON public.recipe_generations(user_id);
CREATE INDEX idx_meal_plans_ai_user_id ON public.meal_plans_ai(user_id);
CREATE INDEX idx_food_scans_ai_user_id ON public.food_scans_ai(user_id);
CREATE INDEX idx_restaurant_analyses_user_id ON public.restaurant_analyses(user_id);
CREATE INDEX idx_chef_chat_sessions_user_id ON public.chef_chat_sessions(user_id);
CREATE INDEX idx_wine_pairings_user_id ON public.wine_pairings(user_id);