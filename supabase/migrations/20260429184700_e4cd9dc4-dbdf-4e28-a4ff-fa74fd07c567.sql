CREATE TABLE public.chat_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  credits_remaining INTEGER NOT NULL DEFAULT 0,
  total_purchased INTEGER NOT NULL DEFAULT 0,
  last_purchase_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own chat credits"
ON public.chat_credits
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies for users — service role only (bypasses RLS).

CREATE INDEX idx_chat_credits_user_id ON public.chat_credits(user_id);

CREATE TRIGGER update_chat_credits_updated_at
BEFORE UPDATE ON public.chat_credits
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();