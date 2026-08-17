DROP POLICY IF EXISTS "Paid marketplace members can create skill offerings" ON public.skill_offerings;

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