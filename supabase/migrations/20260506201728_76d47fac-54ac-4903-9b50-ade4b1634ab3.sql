
-- Missing UPDATE policy on emotion_wallets
CREATE POLICY "Users can update their own wallet"
ON public.emotion_wallets
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Atomic deduction function for emotion_credits
CREATE OR REPLACE FUNCTION public.deduct_emotion_credits(amount integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  remaining integer;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  IF amount IS NULL OR amount <= 0 THEN
    RAISE EXCEPTION 'Invalid amount';
  END IF;

  UPDATE public.emotion_credits
     SET credits_remaining = credits_remaining - amount,
         total_credits_used = COALESCE(total_credits_used, 0) + amount,
         updated_at = now()
   WHERE user_id = uid
     AND credits_remaining >= amount
   RETURNING credits_remaining INTO remaining;

  IF remaining IS NULL THEN
    RETURN false;
  END IF;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.deduct_emotion_credits(integer) FROM public;
GRANT EXECUTE ON FUNCTION public.deduct_emotion_credits(integer) TO authenticated;
