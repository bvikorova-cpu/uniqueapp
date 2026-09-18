ALTER TABLE public.influencer_profiles ADD COLUMN IF NOT EXISTS is_adult boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS public.influencer_adult_access (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  influencer_id uuid NOT NULL REFERENCES public.influencer_profiles(id) ON DELETE CASCADE,
  credits_spent integer NOT NULL DEFAULT 2,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, influencer_id)
);

GRANT SELECT ON public.influencer_adult_access TO authenticated;
GRANT ALL ON public.influencer_adult_access TO service_role;
ALTER TABLE public.influencer_adult_access ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "own adult access" ON public.influencer_adult_access;
CREATE POLICY "own adult access" ON public.influencer_adult_access
  FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.unlock_adult_creator(_influencer_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _owner uuid;
  _adult boolean;
  _spend jsonb;
BEGIN
  IF _uid IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  SELECT user_id, is_adult INTO _owner, _adult
  FROM public.influencer_profiles WHERE id = _influencer_id;

  IF _owner IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF _owner = _uid OR COALESCE(_adult, false) = false THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  IF EXISTS (SELECT 1 FROM public.influencer_adult_access
             WHERE user_id = _uid AND influencer_id = _influencer_id) THEN
    RETURN jsonb_build_object('ok', true, 'already', true);
  END IF;

  _spend := public.spend_ai_credits(2, 'Adult creator access', 'influking_adult_access');
  IF COALESCE((_spend->>'ok')::boolean, false) = false THEN
    RETURN _spend;
  END IF;

  INSERT INTO public.influencer_adult_access (user_id, influencer_id, credits_spent)
  VALUES (_uid, _influencer_id, 2)
  ON CONFLICT (user_id, influencer_id) DO NOTHING;

  RETURN jsonb_build_object('ok', true, 'already', false, 'balance', _spend->'balance');
END;
$$;

GRANT EXECUTE ON FUNCTION public.unlock_adult_creator(uuid) TO authenticated;