CREATE TABLE IF NOT EXISTS public.free_tier_credits (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 10,
  month_key TEXT NOT NULL DEFAULT to_char(now(), 'YYYY-MM'),
  welcome_shown BOOLEAN NOT NULL DEFAULT false,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.free_tier_credits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users read own free credits"
  ON public.free_tier_credits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users update own free credits"
  ON public.free_tier_credits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "users insert own free credits"
  ON public.free_tier_credits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

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

  IF NOT FOUND THEN
    INSERT INTO public.free_tier_credits (user_id, balance, month_key, welcome_shown)
    VALUES (v_uid, 10, v_month, false)
    RETURNING * INTO v_row;
  ELSIF v_row.month_key <> v_month THEN
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

CREATE OR REPLACE FUNCTION public.handle_new_user_free_credits()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.free_tier_credits (user_id, balance, month_key, welcome_shown)
  VALUES (new.id, 10, to_char(now(), 'YYYY-MM'), false)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_free_credits ON auth.users;
CREATE TRIGGER on_auth_user_created_free_credits
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_free_credits();