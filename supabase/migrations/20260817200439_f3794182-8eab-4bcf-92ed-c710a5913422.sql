CREATE TABLE IF NOT EXISTS public.skill_contact_unlocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  offering_id uuid NOT NULL REFERENCES public.skill_offerings(id) ON DELETE CASCADE,
  buyer_id uuid NOT NULL,
  credits_spent integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (offering_id, buyer_id)
);

GRANT SELECT ON public.skill_contact_unlocks TO authenticated;
GRANT ALL ON public.skill_contact_unlocks TO service_role;

ALTER TABLE public.skill_contact_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buyers view own contact unlocks"
  ON public.skill_contact_unlocks FOR SELECT TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Providers view unlocks on their offerings"
  ON public.skill_contact_unlocks FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.skill_offerings o WHERE o.id = offering_id AND o.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.has_skill_contact_unlock(_user_id uuid, _offering_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.skill_contact_unlocks u
    WHERE u.buyer_id = _user_id AND u.offering_id = _offering_id
  );
$$;

CREATE OR REPLACE FUNCTION public.unlock_skill_contact(_offering_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_owner uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  SELECT o.user_id INTO v_owner FROM public.skill_offerings o WHERE o.id = _offering_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'OFFERING_NOT_FOUND';
  END IF;

  IF v_owner = v_user_id THEN
    RETURN jsonb_build_object('unlocked', true, 'charged', 0);
  END IF;

  IF public.has_skill_contact_unlock(v_user_id, _offering_id) THEN
    RETURN jsonb_build_object('unlocked', true, 'charged', 0);
  END IF;

  PERFORM public.deduct_ai_credits_atomic(v_user_id, 1);

  INSERT INTO public.ai_credits_ledger (user_id, amount, reason, metadata)
  VALUES (v_user_id, -1, 'skills_marketplace_contact_unlock',
          jsonb_build_object('offering_id', _offering_id, 'seller_id', v_owner));

  INSERT INTO public.skill_contact_unlocks (offering_id, buyer_id, credits_spent)
  VALUES (_offering_id, v_user_id, 1)
  ON CONFLICT (offering_id, buyer_id) DO NOTHING;

  RETURN jsonb_build_object('unlocked', true, 'charged', 1);
END;
$$;

DROP POLICY IF EXISTS "Users can create responses" ON public.marketplace_responses;

CREATE POLICY "Users can create responses after contact unlock"
  ON public.marketplace_responses FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND (
      EXISTS (SELECT 1 FROM public.skill_offerings o WHERE o.id = offering_id AND o.user_id = auth.uid())
      OR public.has_skill_contact_unlock(auth.uid(), offering_id)
    )
  );