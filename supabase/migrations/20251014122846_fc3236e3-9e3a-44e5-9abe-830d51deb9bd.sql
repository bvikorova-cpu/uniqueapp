-- Create plants table for user's plant collection
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  scientific_name TEXT,
  common_name TEXT,
  plant_type TEXT,
  location TEXT,
  image_url TEXT,
  identified_from_photo BOOLEAN DEFAULT false,
  care_instructions JSONB DEFAULT '{}'::jsonb,
  notes TEXT,
  added_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plant_care_schedules table
CREATE TABLE public.plant_care_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE CASCADE,
  care_type TEXT NOT NULL, -- 'watering', 'fertilizing', 'pruning', etc.
  frequency_days INTEGER NOT NULL,
  last_done_date DATE,
  next_due_date DATE NOT NULL,
  notes TEXT,
  reminder_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plant_diagnoses table
CREATE TABLE public.plant_diagnoses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  plant_id UUID REFERENCES public.plants(id) ON DELETE SET NULL,
  image_url TEXT NOT NULL,
  symptoms_description TEXT,
  diagnosis TEXT,
  possible_diseases JSONB DEFAULT '[]'::jsonb,
  treatment_recommendations JSONB DEFAULT '[]'::jsonb,
  severity_level TEXT, -- 'low', 'medium', 'high'
  credits_used INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create plant_identifications table
CREATE TABLE public.plant_identifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  image_url TEXT NOT NULL,
  identified_name TEXT,
  scientific_name TEXT,
  confidence_score NUMERIC(3,2),
  care_tips JSONB DEFAULT '{}'::jsonb,
  additional_info TEXT,
  credits_used INTEGER DEFAULT 3,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_care_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_identifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for plants
CREATE POLICY "Users can view their own plants"
  ON public.plants FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own plants"
  ON public.plants FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own plants"
  ON public.plants FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plants"
  ON public.plants FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plant_care_schedules
CREATE POLICY "Users can view their own care schedules"
  ON public.plant_care_schedules FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own care schedules"
  ON public.plant_care_schedules FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own care schedules"
  ON public.plant_care_schedules FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own care schedules"
  ON public.plant_care_schedules FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plant_diagnoses
CREATE POLICY "Users can view their own diagnoses"
  ON public.plant_diagnoses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own diagnoses"
  ON public.plant_diagnoses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own diagnoses"
  ON public.plant_diagnoses FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for plant_identifications
CREATE POLICY "Users can view their own identifications"
  ON public.plant_identifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own identifications"
  ON public.plant_identifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own identifications"
  ON public.plant_identifications FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_plants_user_id ON public.plants(user_id);
CREATE INDEX idx_plant_care_schedules_user_id ON public.plant_care_schedules(user_id);
CREATE INDEX idx_plant_care_schedules_next_due ON public.plant_care_schedules(next_due_date);
CREATE INDEX idx_plant_diagnoses_user_id ON public.plant_diagnoses(user_id);
CREATE INDEX idx_plant_identifications_user_id ON public.plant_identifications(user_id);