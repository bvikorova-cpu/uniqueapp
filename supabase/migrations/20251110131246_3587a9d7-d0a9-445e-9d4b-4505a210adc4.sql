-- Create healthcare library items table for pre-made therapeutic coloring pages
CREATE TABLE public.healthcare_library_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  tier_required TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.healthcare_library_items ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to view library items
CREATE POLICY "Authenticated users can view library items"
ON public.healthcare_library_items
FOR SELECT
TO authenticated
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_healthcare_library_items_updated_at
BEFORE UPDATE ON public.healthcare_library_items
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for category filtering
CREATE INDEX idx_healthcare_library_items_category ON public.healthcare_library_items(category);
CREATE INDEX idx_healthcare_library_items_tier ON public.healthcare_library_items(tier_required);

-- Insert some sample therapeutic coloring pages
INSERT INTO public.healthcare_library_items (title, description, category, image_url, tier_required) VALUES
('Mindful Breathing Mandala', 'Circular mandala design to promote mindful breathing exercises', 'Mental Health', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800', 'free'),
('Anxiety Relief Pattern', 'Calming geometric patterns for anxiety management', 'Mental Health', 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=800', 'free'),
('Sensory Integration Shapes', 'Tactile-friendly shapes for sensory processing', 'Occupational Therapy', 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?w=800', 'basic'),
('Fine Motor Skills Practice', 'Intricate patterns for developing fine motor control', 'Occupational Therapy', 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800', 'basic'),
('Speech Therapy Animals', 'Animal illustrations for articulation practice', 'Speech Therapy', 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800', 'basic'),
('Emotional Expression Faces', 'Face templates for emotion recognition therapy', 'Mental Health', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800', 'professional'),
('Social Skills Scenarios', 'Scene-based coloring for social interaction practice', 'Behavioral Therapy', 'https://images.unsplash.com/photo-1516802273409-68526ee1bdd6?w=800', 'professional'),
('Advanced Cognitive Patterns', 'Complex patterns for cognitive rehabilitation', 'Cognitive Therapy', 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800', 'professional');