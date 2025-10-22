-- Create photo credits table
CREATE TABLE IF NOT EXISTS public.photo_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_credits_purchased INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photo_credits ENABLE ROW LEVEL SECURITY;

-- RLS policies for photo_credits
CREATE POLICY "Users can view own credits"
  ON public.photo_credits
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own credits"
  ON public.photo_credits
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own credits"
  ON public.photo_credits
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create old photos table
CREATE TABLE IF NOT EXISTS public.old_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  original_url TEXT NOT NULL,
  restored_url TEXT,
  title TEXT,
  description TEXT,
  estimated_year INTEGER,
  restoration_type TEXT, -- 'colorize', 'repair', 'enhance'
  credits_used INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.old_photos ENABLE ROW LEVEL SECURITY;

-- RLS policies for old_photos
CREATE POLICY "Users can view own photos"
  ON public.old_photos
  FOR SELECT
  USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can insert own photos"
  ON public.old_photos
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own photos"
  ON public.old_photos
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own photos"
  ON public.old_photos
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for old photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('old-photos', 'old-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own photos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'old-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Anyone can view public photos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'old-photos');

CREATE POLICY "Users can update own photos"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'old-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own photos"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'old-photos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_photo_credits_updated_at
  BEFORE UPDATE ON public.photo_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();