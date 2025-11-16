-- Drop existing table if it exists
DROP TABLE IF EXISTS public.property_inquiries CASCADE;

-- Create property inquiries table
CREATE TABLE public.property_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_name TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  sender_phone TEXT,
  message TEXT NOT NULL,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('contact', 'viewing')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes
CREATE INDEX idx_property_inquiries_property_id ON public.property_inquiries(property_id);
CREATE INDEX idx_property_inquiries_sender_id ON public.property_inquiries(sender_id);

-- Enable RLS
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own inquiries"
  ON public.property_inquiries
  FOR SELECT
  USING (auth.uid() = sender_id);

CREATE POLICY "Property owners can view inquiries"
  ON public.property_inquiries
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_inquiries.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create inquiries"
  ON public.property_inquiries
  FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Property owners can update inquiry status"
  ON public.property_inquiries
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_inquiries.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Create updated_at trigger
CREATE TRIGGER update_property_inquiries_updated_at
  BEFORE UPDATE ON public.property_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();