CREATE OR REPLACE FUNCTION public.ensure_free_tier_credits()
RETURNS public.free_tier_credits
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID := auth.uid();
  v_row public.free_tier_credits;
  v_month TEXT := to_char(now(), 'YYYY-MM');
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO v_row FROM public.free_tier_credits WHERE user_id = v_uid;

  -- No row = user registered before free tier existed. Do NOT grant retroactively.
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- New calendar month -> top up +10 once
  IF v_row.month_key <> v_month THEN
    UPDATE public.free_tier_credits
       SET balance = GREATEST(balance, 0) + 10,
           month_key = v_month,
           updated_at = now()
     WHERE user_id = v_uid
     RETURNING * INTO v_row;
  END IF;

  RETURN v_row;
END;
$$;