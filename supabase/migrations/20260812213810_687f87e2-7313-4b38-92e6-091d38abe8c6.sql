DROP INDEX IF EXISTS public.musician_earnings_unique_source;
CREATE UNIQUE INDEX IF NOT EXISTS musician_earnings_unique_source
  ON public.musician_earnings (transaction_type, related_id);

CREATE OR REPLACE FUNCTION public.record_concert_ticket_earning()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_musician UUID;
  v_gross NUMERIC;
BEGIN
  IF lower(coalesce(NEW.payment_status, '')) NOT IN ('paid', 'completed', 'succeeded') THEN
    RETURN NEW;
  END IF;

  SELECT musician_id INTO v_musician
  FROM public.live_concert_streams WHERE id = NEW.concert_id;
  IF v_musician IS NULL THEN RETURN NEW; END IF;

  v_gross := coalesce(NEW.amount, 0);
  IF v_gross <= 0 THEN RETURN NEW; END IF;

  INSERT INTO public.musician_earnings
    (musician_id, transaction_type, total_amount, musician_amount, platform_commission, commission_rate, related_id)
  VALUES
    (v_musician, 'ticket_sale', v_gross, round(v_gross * 0.8, 2), round(v_gross * 0.2, 2), 20.00, NEW.id)
  ON CONFLICT (transaction_type, related_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_record_concert_ticket_earning_ins ON public.concert_ticket_purchases;
CREATE TRIGGER trg_record_concert_ticket_earning_ins
  AFTER INSERT ON public.concert_ticket_purchases
  FOR EACH ROW EXECUTE FUNCTION public.record_concert_ticket_earning();

DROP TRIGGER IF EXISTS trg_record_concert_ticket_earning_upd ON public.concert_ticket_purchases;
CREATE TRIGGER trg_record_concert_ticket_earning_upd
  AFTER UPDATE OF payment_status ON public.concert_ticket_purchases
  FOR EACH ROW EXECUTE FUNCTION public.record_concert_ticket_earning();

CREATE OR REPLACE FUNCTION public.record_concert_gift_earning()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_musician UUID;
  v_gross NUMERIC;
BEGIN
  IF NEW.context_type <> 'concert' OR NEW.context_id IS NULL THEN RETURN NEW; END IF;
  IF lower(coalesce(NEW.status, '')) NOT IN ('paid', 'completed', 'succeeded') THEN RETURN NEW; END IF;

  SELECT musician_id INTO v_musician
  FROM public.live_concert_streams WHERE id = NEW.context_id::uuid;
  IF v_musician IS NULL THEN RETURN NEW; END IF;

  v_gross := coalesce(NEW.amount, 0);
  IF v_gross <= 0 THEN RETURN NEW; END IF;

  INSERT INTO public.musician_earnings
    (musician_id, transaction_type, total_amount, musician_amount, platform_commission, commission_rate, related_id)
  VALUES
    (v_musician, 'gift', v_gross, round(v_gross * 0.8, 2), round(v_gross * 0.2, 2), 20.00, NEW.id)
  ON CONFLICT (transaction_type, related_id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_record_concert_gift_earning_ins ON public.sent_platform_gifts;
CREATE TRIGGER trg_record_concert_gift_earning_ins
  AFTER INSERT ON public.sent_platform_gifts
  FOR EACH ROW EXECUTE FUNCTION public.record_concert_gift_earning();

DROP TRIGGER IF EXISTS trg_record_concert_gift_earning_upd ON public.sent_platform_gifts;
CREATE TRIGGER trg_record_concert_gift_earning_upd
  AFTER UPDATE OF status ON public.sent_platform_gifts
  FOR EACH ROW EXECUTE FUNCTION public.record_concert_gift_earning();

INSERT INTO public.musician_earnings
  (musician_id, transaction_type, total_amount, musician_amount, platform_commission, commission_rate, related_id)
SELECT s.musician_id, 'ticket_sale', p.amount, round(p.amount * 0.8, 2), round(p.amount * 0.2, 2), 20.00, p.id
FROM public.concert_ticket_purchases p
JOIN public.live_concert_streams s ON s.id = p.concert_id
WHERE lower(coalesce(p.payment_status, '')) IN ('paid', 'completed', 'succeeded')
  AND coalesce(p.amount, 0) > 0
ON CONFLICT (transaction_type, related_id) DO NOTHING;

INSERT INTO public.musician_earnings
  (musician_id, transaction_type, total_amount, musician_amount, platform_commission, commission_rate, related_id)
SELECT s.musician_id, 'gift', g.amount, round(g.amount * 0.8, 2), round(g.amount * 0.2, 2), 20.00, g.id
FROM public.sent_platform_gifts g
JOIN public.live_concert_streams s ON s.id = g.context_id::uuid
WHERE g.context_type = 'concert'
  AND lower(coalesce(g.status, '')) IN ('paid', 'completed', 'succeeded')
  AND coalesce(g.amount, 0) > 0
ON CONFLICT (transaction_type, related_id) DO NOTHING;

CREATE OR REPLACE FUNCTION public.admin_concert_earnings_overview()
RETURNS TABLE (
  musician_id UUID,
  stage_name TEXT,
  verified BOOLEAN,
  ticket_gross NUMERIC,
  gift_gross NUMERIC,
  total_gross NUMERIC,
  artist_share NUMERIC,
  platform_share NUMERIC,
  pending_balance NUMERIC,
  total_withdrawn NUMERIC,
  transactions BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    mp.id,
    mp.stage_name,
    mp.verified,
    coalesce(sum(e.total_amount) FILTER (WHERE e.transaction_type = 'ticket_sale'), 0),
    coalesce(sum(e.total_amount) FILTER (WHERE e.transaction_type IN ('gift', 'tip')), 0),
    coalesce(sum(e.total_amount), 0),
    coalesce(sum(e.musician_amount), 0),
    coalesce(sum(e.platform_commission), 0),
    coalesce(mp.pending_balance, 0),
    coalesce(mp.total_withdrawn, 0),
    count(e.id)
  FROM public.musician_profiles mp
  LEFT JOIN public.musician_earnings e ON e.musician_id = mp.id
  WHERE public.has_role(auth.uid(), 'admin')
  GROUP BY mp.id, mp.stage_name, mp.verified, mp.pending_balance, mp.total_withdrawn
  ORDER BY coalesce(sum(e.total_amount), 0) DESC;
$$;

GRANT EXECUTE ON FUNCTION public.admin_concert_earnings_overview() TO authenticated;