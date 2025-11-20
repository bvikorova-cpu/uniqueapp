-- Add table for comedy show messages (live chat)
CREATE TABLE IF NOT EXISTS public.comedy_show_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  show_id UUID NOT NULL REFERENCES public.comedy_shows(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.comedy_show_messages ENABLE ROW LEVEL SECURITY;

-- Policy for viewing messages
CREATE POLICY "Anyone can view show messages"
ON public.comedy_show_messages
FOR SELECT
USING (true);

-- Policy for sending messages
CREATE POLICY "Authenticated users can send messages"
ON public.comedy_show_messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);

-- Add realtime support
ALTER PUBLICATION supabase_realtime ADD TABLE public.comedy_show_messages;

-- Function to deduct comedian balance
CREATE OR REPLACE FUNCTION deduct_comedian_balance(p_comedian_id UUID, p_amount DECIMAL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.comedian_earnings
  SET pending_payout = pending_payout - p_amount
  WHERE comedian_id = p_comedian_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;