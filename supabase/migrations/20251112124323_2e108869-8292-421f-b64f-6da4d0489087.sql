-- Create function to spend brain duel credits
CREATE OR REPLACE FUNCTION public.spend_brain_duel_credits(
  p_user_id UUID,
  p_amount INTEGER
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_current_credits INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO v_current_credits
  FROM public.brain_duel_credits
  WHERE user_id = p_user_id;
  
  -- Check if user has enough credits
  IF v_current_credits IS NULL OR v_current_credits < p_amount THEN
    RAISE EXCEPTION 'Insufficient credits';
  END IF;
  
  -- Deduct credits
  UPDATE public.brain_duel_credits
  SET credits = credits - p_amount,
      updated_at = now()
  WHERE user_id = p_user_id;
END;
$$;