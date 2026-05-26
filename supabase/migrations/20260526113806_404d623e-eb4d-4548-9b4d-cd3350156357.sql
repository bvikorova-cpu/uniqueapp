-- Add 4-arg overload of add_user_points so reward RPCs (spin_lucky_wheel, redeem_shop_item, gift_xp, place_xp_bet) work
CREATE OR REPLACE FUNCTION public.add_user_points(
  p_user_id uuid,
  p_points integer,
  p_activity_type text,
  p_meta text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Meta is currently informational only; delegate to the canonical 3-arg implementation.
  PERFORM public.add_user_points(p_user_id, p_points, p_activity_type);
END;
$$;