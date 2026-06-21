ALTER TABLE public.megatalent_winners
  ADD COLUMN IF NOT EXISTS paid_at timestamptz,
  ADD COLUMN IF NOT EXISTS payout_reference text;

CREATE OR REPLACE FUNCTION public.admin_mark_megatalent_paid(_winner_id uuid, _reference text DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'admin only';
  END IF;
  UPDATE public.megatalent_winners
     SET paid_at = now(),
         payout_reference = COALESCE(_reference, payout_reference)
   WHERE id = _winner_id;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.admin_mark_megatalent_paid(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_mark_megatalent_paid(uuid, text) TO authenticated;