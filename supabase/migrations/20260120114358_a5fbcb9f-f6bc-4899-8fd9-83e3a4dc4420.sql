-- Create table for user recipes
CREATE TABLE public.user_recipes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  difficulty TEXT NOT NULL DEFAULT 'Medium',
  time TEXT NOT NULL,
  servings INTEGER NOT NULL DEFAULT 2,
  calories INTEGER,
  description TEXT,
  ingredients TEXT[] DEFAULT '{}',
  instructions TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  image_url TEXT,
  video_url TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_recipes ENABLE ROW LEVEL SECURITY;

-- Anyone can view public recipes
CREATE POLICY "Anyone can view public recipes"
ON public.user_recipes
FOR SELECT
USING (is_public = true);

-- Users can view their own recipes
CREATE POLICY "Users can view their own recipes"
ON public.user_recipes
FOR SELECT
USING (auth.uid() = user_id);

-- Users can create their own recipes
CREATE POLICY "Users can create their own recipes"
ON public.user_recipes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own recipes
CREATE POLICY "Users can update their own recipes"
ON public.user_recipes
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own recipes
CREATE POLICY "Users can delete their own recipes"
ON public.user_recipes
FOR DELETE
USING (auth.uid() = user_id);

-- Create storage bucket for recipe media
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES ('recipe-media', 'recipe-media', true, 52428800)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for recipe media
CREATE POLICY "Anyone can view recipe media"
ON storage.objects FOR SELECT
USING (bucket_id = 'recipe-media');

CREATE POLICY "Authenticated users can upload recipe media"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'recipe-media' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own recipe media"
ON storage.objects FOR UPDATE
USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own recipe media"
ON storage.objects FOR DELETE
USING (bucket_id = 'recipe-media' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_user_recipes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_user_recipes_updated_at
BEFORE UPDATE ON public.user_recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_user_recipes_updated_at();