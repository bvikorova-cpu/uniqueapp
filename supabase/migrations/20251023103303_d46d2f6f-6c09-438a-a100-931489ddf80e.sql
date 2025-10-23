-- Create meal plans table
CREATE TABLE public.meal_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  days INTEGER NOT NULL DEFAULT 7,
  target_calories INTEGER NOT NULL,
  target_protein INTEGER,
  target_carbs INTEGER,
  target_fats INTEGER,
  dietary_preferences TEXT[],
  allergens TEXT[],
  plan_data JSONB NOT NULL,
  shopping_list JSONB,
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create food scans table
CREATE TABLE public.food_scans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  food_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  protein DECIMAL(10,2),
  carbs DECIMAL(10,2),
  fats DECIMAL(10,2),
  vitamins JSONB,
  healthier_alternatives JSONB,
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create calorie quests table
CREATE TABLE public.calorie_quests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  quest_type TEXT NOT NULL,
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  xp_reward INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  expires_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user quest progress table
CREATE TABLE public.user_quest_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  level INTEGER DEFAULT 1,
  total_xp INTEGER DEFAULT 0,
  avatar_url TEXT,
  premium_items JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create quest challenges table
CREATE TABLE public.quest_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  entry_fee INTEGER NOT NULL,
  prize_pool INTEGER DEFAULT 0,
  participants_count INTEGER DEFAULT 0,
  winner_id UUID,
  status TEXT NOT NULL DEFAULT 'open',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.quest_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  score INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(challenge_id, user_id)
);

-- Create restaurant menus table
CREATE TABLE public.restaurant_menus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID,
  restaurant_name TEXT NOT NULL,
  menu_image_url TEXT,
  analysis_data JSONB NOT NULL,
  recommendations JSONB,
  scan_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create macro tracking table
CREATE TABLE public.macro_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  calories INTEGER DEFAULT 0,
  protein DECIMAL(10,2) DEFAULT 0,
  carbs DECIMAL(10,2) DEFAULT 0,
  fats DECIMAL(10,2) DEFAULT 0,
  meals JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create workout plans table
CREATE TABLE public.workout_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  duration_weeks INTEGER NOT NULL,
  workout_data JSONB NOT NULL,
  matched_meal_plan_id UUID REFERENCES public.meal_plans(id),
  is_premium BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create nutrition subscriptions table
CREATE TABLE public.nutrition_subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subscription_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  meal_plans_limit INTEGER,
  food_scans_limit INTEGER,
  features JSONB DEFAULT '{}'::jsonb,
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create daily scans counter table
CREATE TABLE public.daily_scans_counter (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  scan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  scans_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, scan_date)
);

-- Enable RLS
ALTER TABLE public.meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calorie_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quest_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.macro_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_scans_counter ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meal_plans
CREATE POLICY "Users can view their own meal plans"
  ON public.meal_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own meal plans"
  ON public.meal_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own meal plans"
  ON public.meal_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own meal plans"
  ON public.meal_plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for food_scans
CREATE POLICY "Users can view their own food scans"
  ON public.food_scans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own food scans"
  ON public.food_scans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own food scans"
  ON public.food_scans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for calorie_quests
CREATE POLICY "Users can view their own quests"
  ON public.calorie_quests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own quests"
  ON public.calorie_quests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own quests"
  ON public.calorie_quests FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for user_quest_progress
CREATE POLICY "Users can view their own progress"
  ON public.user_quest_progress FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progress"
  ON public.user_quest_progress FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress"
  ON public.user_quest_progress FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for quest_challenges
CREATE POLICY "Anyone can view challenges"
  ON public.quest_challenges FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create challenges"
  ON public.quest_challenges FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- RLS Policies for challenge_participants
CREATE POLICY "Anyone can view participants"
  ON public.challenge_participants FOR SELECT
  USING (true);

CREATE POLICY "Users can join challenges"
  ON public.challenge_participants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for restaurant_menus
CREATE POLICY "Users can view their own restaurant analyses"
  ON public.restaurant_menus FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can create restaurant analyses"
  ON public.restaurant_menus FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policies for macro_tracking
CREATE POLICY "Users can view their own macro tracking"
  ON public.macro_tracking FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own macro tracking"
  ON public.macro_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own macro tracking"
  ON public.macro_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for workout_plans
CREATE POLICY "Users can view their own workout plans"
  ON public.workout_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own workout plans"
  ON public.workout_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workout plans"
  ON public.workout_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own workout plans"
  ON public.workout_plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for nutrition_subscriptions
CREATE POLICY "Users can view their own subscription"
  ON public.nutrition_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscription"
  ON public.nutrition_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON public.nutrition_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for daily_scans_counter
CREATE POLICY "Users can view their own scan counter"
  ON public.daily_scans_counter FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own scan counter"
  ON public.daily_scans_counter FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own scan counter"
  ON public.daily_scans_counter FOR UPDATE
  USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_meal_plans_updated_at
  BEFORE UPDATE ON public.meal_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_quest_progress_updated_at
  BEFORE UPDATE ON public.user_quest_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_macro_tracking_updated_at
  BEFORE UPDATE ON public.macro_tracking
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at
  BEFORE UPDATE ON public.workout_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_nutrition_subscriptions_updated_at
  BEFORE UPDATE ON public.nutrition_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();