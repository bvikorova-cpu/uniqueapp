DROP POLICY IF EXISTS "Subscribed users can create skill offerings" ON public.skill_offerings;
CREATE POLICY "Paid marketplace members can create skill offerings"
ON public.skill_offerings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.marketplace_subscriptions ms
    WHERE ms.user_id = auth.uid()
      AND ms.status = 'active'
      AND (ms.expires_at IS NULL OR ms.expires_at > now())
  )
);

CREATE OR REPLACE FUNCTION public.publish_skill_offering(
  _title text,
  _description text,
  _category public.skill_category,
  _price_per_hour numeric,
  _location text DEFAULT NULL,
  _image_url text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_offering_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'AUTH_REQUIRED';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.marketplace_subscriptions ms
    WHERE ms.user_id = v_user_id
      AND ms.status = 'active'
      AND (ms.expires_at IS NULL OR ms.expires_at > now())
  ) THEN
    RAISE EXCEPTION 'MARKETPLACE_ACCESS_REQUIRED';
  END IF;

  PERFORM set_config('app.credit_reason', 'skills_marketplace_publish', true);
  PERFORM set_config('app.credit_source', 'skills_marketplace', true);
  PERFORM public.deduct_ai_credits_atomic(v_user_id, 2);

  INSERT INTO public.skill_offerings (
    user_id, title, description, category, price_per_hour, location, image_url, is_active
  ) VALUES (
    v_user_id, _title, _description, _category, _price_per_hour,
    NULLIF(_location, ''), _image_url, true
  )
  RETURNING id INTO v_offering_id;

  RETURN v_offering_id;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_skill_offering(text, text, public.skill_category, numeric, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.publish_skill_offering(text, text, public.skill_category, numeric, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.publish_skill_offering(text, text, public.skill_category, numeric, text, text) TO service_role;