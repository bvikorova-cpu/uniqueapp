-- Create future_face_progressions table
CREATE TABLE IF NOT EXISTS public.future_face_progressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  original_image_url TEXT NOT NULL,
  healthy_image_url TEXT,
  unhealthy_image_url TEXT,
  years_forward INTEGER NOT NULL,
  anti_aging_tips TEXT,
  has_comparison BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.future_face_progressions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own progressions"
  ON public.future_face_progressions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own progressions"
  ON public.future_face_progressions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progressions"
  ON public.future_face_progressions
  FOR DELETE
  USING (auth.uid() = user_id);

COMMENT ON TABLE public.future_face_progressions IS 'Stores AI-generated future face age progressions with healthy/unhealthy lifestyle comparisons';