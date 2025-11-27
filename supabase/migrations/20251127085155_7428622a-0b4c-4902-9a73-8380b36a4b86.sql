-- F1 Racing Currency (like horse_currency)
CREATE TABLE public.f1_currency (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  coins INTEGER NOT NULL DEFAULT 500,
  gems INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.f1_currency ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own f1 currency" ON public.f1_currency FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own f1 currency" ON public.f1_currency FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own f1 currency" ON public.f1_currency FOR INSERT WITH CHECK (auth.uid() = user_id);

-- F1 Cars (like horses)
CREATE TABLE public.f1_cars (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  team TEXT NOT NULL DEFAULT 'Custom Team',
  color TEXT NOT NULL DEFAULT '#e10600',
  engine_stat INTEGER NOT NULL DEFAULT 50,
  aero_stat INTEGER NOT NULL DEFAULT 50,
  tires_stat INTEGER NOT NULL DEFAULT 50,
  handling_stat INTEGER NOT NULL DEFAULT 50,
  level INTEGER NOT NULL DEFAULT 1,
  experience INTEGER NOT NULL DEFAULT 0,
  total_races INTEGER NOT NULL DEFAULT 0,
  total_wins INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.f1_cars ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own f1 cars" ON public.f1_cars FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own f1 cars" ON public.f1_cars FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own f1 cars" ON public.f1_cars FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view all f1 cars" ON public.f1_cars FOR SELECT USING (true);

-- F1 Races (like races)
CREATE TABLE public.f1_races (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT NOT NULL,
  distance INTEGER NOT NULL DEFAULT 5000,
  entry_fee_coins INTEGER NOT NULL DEFAULT 10,
  max_participants INTEGER NOT NULL DEFAULT 8,
  status TEXT NOT NULL DEFAULT 'waiting',
  weather TEXT NOT NULL DEFAULT 'sunny',
  track_condition TEXT NOT NULL DEFAULT 'dry',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  finished_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.f1_races ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view f1 races" ON public.f1_races FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create f1 races" ON public.f1_races FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Authenticated users can update f1 races" ON public.f1_races FOR UPDATE USING (auth.uid() IS NOT NULL);

-- F1 Race Participants (like race_participants)
CREATE TABLE public.f1_race_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  race_id UUID NOT NULL REFERENCES public.f1_races(id) ON DELETE CASCADE,
  car_id UUID NOT NULL REFERENCES public.f1_cars(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  strategy TEXT NOT NULL DEFAULT 'balanced',
  position INTEGER,
  finish_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.f1_race_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view f1 race participants" ON public.f1_race_participants FOR SELECT USING (true);
CREATE POLICY "Users can join f1 races" ON public.f1_race_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

-- F1 Car Marketplace (like horse marketplace)
CREATE TABLE public.f1_car_marketplace (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  car_id UUID NOT NULL REFERENCES public.f1_cars(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL,
  price_coins INTEGER NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.f1_car_marketplace ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view f1 marketplace" ON public.f1_car_marketplace FOR SELECT USING (true);
CREATE POLICY "Users can list own cars" ON public.f1_car_marketplace FOR INSERT WITH CHECK (auth.uid() = seller_id);
CREATE POLICY "Users can update own listings" ON public.f1_car_marketplace FOR UPDATE USING (auth.uid() = seller_id);
CREATE POLICY "Users can delete own listings" ON public.f1_car_marketplace FOR DELETE USING (auth.uid() = seller_id);

-- Function to give F1 starter balance
CREATE OR REPLACE FUNCTION public.give_f1_starter_balance(p_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.f1_currency (user_id, coins, gems)
  VALUES (p_user_id, 500, 50)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Insert default F1 races
INSERT INTO public.f1_races (track_name, distance, entry_fee_coins, max_participants, weather, track_condition) VALUES
('Monaco Grand Prix', 3337, 20, 8, 'sunny', 'dry'),
('Silverstone Circuit', 5891, 15, 8, 'cloudy', 'dry'),
('Monza Speed Track', 5793, 25, 8, 'sunny', 'dry'),
('Spa-Francorchamps', 7004, 30, 8, 'rainy', 'wet');