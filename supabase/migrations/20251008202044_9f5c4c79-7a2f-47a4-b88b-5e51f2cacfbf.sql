-- Create storage bucket for bazaar images
INSERT INTO storage.buckets (id, name, public)
VALUES ('bazaar_images', 'bazaar_images', true);

-- Create bazaar_items table
CREATE TABLE IF NOT EXISTS public.bazaar_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  condition TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bazaar_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bazaar_items
CREATE POLICY "Anyone can view active bazaar items"
  ON public.bazaar_items
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can create bazaar items"
  ON public.bazaar_items
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bazaar items"
  ON public.bazaar_items
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bazaar items"
  ON public.bazaar_items
  FOR DELETE
  USING (auth.uid() = user_id);

-- Storage policies for bazaar_images
CREATE POLICY "Anyone can view bazaar images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'bazaar_images');

CREATE POLICY "Authenticated users can upload bazaar images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'bazaar_images' 
    AND auth.uid() IS NOT NULL
  );

CREATE POLICY "Users can update their own bazaar images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'bazaar_images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own bazaar images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'bazaar_images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );