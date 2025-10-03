-- Create destinations table
CREATE TABLE public.destinations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Create destination photos table
CREATE TABLE public.destination_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create destination reviews table
CREATE TABLE public.destination_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  destination_id UUID NOT NULL REFERENCES public.destinations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destination_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for destinations
CREATE POLICY "Anyone can view active destinations" 
  ON public.destinations 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Authenticated users can create destinations" 
  ON public.destinations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own destinations" 
  ON public.destinations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own destinations" 
  ON public.destinations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- RLS Policies for destination photos
CREATE POLICY "Anyone can view destination photos" 
  ON public.destination_photos 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can create photos for their destinations" 
  ON public.destination_photos 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.destinations 
      WHERE id = destination_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete photos from their destinations" 
  ON public.destination_photos 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.destinations 
      WHERE id = destination_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for destination reviews
CREATE POLICY "Anyone can view reviews" 
  ON public.destination_reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create reviews" 
  ON public.destination_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.destination_reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.destination_reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_destinations_user_id ON public.destinations(user_id);
CREATE INDEX idx_destination_photos_destination_id ON public.destination_photos(destination_id);
CREATE INDEX idx_destination_reviews_destination_id ON public.destination_reviews(destination_id);
CREATE INDEX idx_destination_reviews_user_id ON public.destination_reviews(user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_destination_reviews_updated_at
  BEFORE UPDATE ON public.destination_reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();