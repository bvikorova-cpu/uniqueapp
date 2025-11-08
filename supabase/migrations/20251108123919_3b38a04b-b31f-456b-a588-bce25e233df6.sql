-- Create table for storing user castle certificates
CREATE TABLE IF NOT EXISTS public.user_castle_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  castle_id UUID NOT NULL REFERENCES public.disney_castles(id) ON DELETE CASCADE,
  completion_time_ms INTEGER NOT NULL,
  unlocked_milestones INTEGER[] NOT NULL DEFAULT '{}',
  total_rooms INTEGER NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_castle_certificates ENABLE ROW LEVEL SECURITY;

-- Create policies for certificates
CREATE POLICY "Users can view their own certificates"
  ON public.user_castle_certificates
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own certificates"
  ON public.user_castle_certificates
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certificates"
  ON public.user_castle_certificates
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_user_castle_certificates_user_id 
  ON public.user_castle_certificates(user_id);

CREATE INDEX idx_user_castle_certificates_castle_id 
  ON public.user_castle_certificates(castle_id);