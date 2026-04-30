-- Most ALTERs already applied (IF NOT EXISTS / drop+add idempotent). Just (re)create the view + function.
CREATE OR REPLACE FUNCTION public.payout_requires_review(
  _campaign_type TEXT,
  _campaign_id UUID,
  _amount_cents BIGINT
) RETURNS TABLE(needs_review BOOLEAN, reason TEXT)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _prior_completed INT;
BEGIN
  IF _campaign_type IN ('medical','crisis','pet') THEN
    needs_review := true;
    reason := 'High-risk category (' || _campaign_type || ') — manual review required';
    RETURN NEXT; RETURN;
  END IF;

  IF _amount_cents >= 100000 THEN
    needs_review := true;
    reason := 'Large amount (≥ €1000) — manual review required';
    RETURN NEXT; RETURN;
  END IF;

  SELECT COUNT(*) INTO _prior_completed
  FROM public.campaign_payouts
  WHERE campaign_id = _campaign_id
    AND campaign_type = _campaign_type
    AND status = 'completed';

  IF _prior_completed = 0 THEN
    needs_review := true;
    reason := 'First payout for this campaign — KYC review required';
    RETURN NEXT; RETURN;
  END IF;

  needs_review := false;
  reason := NULL;
  RETURN NEXT;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.payout_requires_review(TEXT, UUID, BIGINT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.payout_requires_review(TEXT, UUID, BIGINT) TO authenticated, service_role;

CREATE OR REPLACE VIEW public.campaign_payouts_pending_review AS
SELECT cp.*, p.email AS owner_email, p.full_name AS owner_name
FROM public.campaign_payouts cp
LEFT JOIN public.profiles p ON p.id = cp.owner_user_id
WHERE cp.status = 'pending_review';