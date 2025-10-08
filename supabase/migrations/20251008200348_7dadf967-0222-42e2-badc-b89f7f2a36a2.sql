-- Create marketplace responses table to track interests in offerings
CREATE TABLE IF NOT EXISTS public.marketplace_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id UUID NOT NULL REFERENCES public.skill_offerings(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.marketplace_responses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can create responses
CREATE POLICY "Users can create responses"
ON public.marketplace_responses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = sender_id);

-- Policy: Users can view responses to their offerings
CREATE POLICY "Users can view responses to their offerings"
ON public.marketplace_responses
FOR SELECT
TO authenticated
USING (auth.uid() = receiver_id);

-- Policy: Users can view their sent responses
CREATE POLICY "Users can view their sent responses"
ON public.marketplace_responses
FOR SELECT
TO authenticated
USING (auth.uid() = sender_id);

-- Policy: Users can update read status of responses to their offerings
CREATE POLICY "Users can update their received responses"
ON public.marketplace_responses
FOR UPDATE
TO authenticated
USING (auth.uid() = receiver_id);

-- Create index for better query performance
CREATE INDEX idx_marketplace_responses_receiver ON public.marketplace_responses(receiver_id);
CREATE INDEX idx_marketplace_responses_offering ON public.marketplace_responses(offering_id);
CREATE INDEX idx_marketplace_responses_created ON public.marketplace_responses(created_at DESC);