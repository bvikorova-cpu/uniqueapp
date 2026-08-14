DROP TRIGGER IF EXISTS record_comedy_earning_trigger ON public.comedian_earnings;
DROP FUNCTION IF EXISTS public.record_comedy_platform_earning();

ALTER TABLE public.comedian_earnings DROP CONSTRAINT IF EXISTS valid_source;
ALTER TABLE public.comedian_earnings
  ADD CONSTRAINT valid_source CHECK (source_type = ANY (ARRAY['show'::text, 'ticket'::text, 'gift'::text, 'tip'::text, 'battle'::text, 'clip'::text, 'subscription'::text, 'bonus'::text]));

ALTER TABLE public.comedy_platform_earnings DROP CONSTRAINT IF EXISTS comedy_platform_earnings_transaction_type_check;
ALTER TABLE public.comedy_platform_earnings
  ADD CONSTRAINT comedy_platform_earnings_transaction_type_check CHECK (transaction_type = ANY (ARRAY['ticket_sale'::text, 'ticket'::text, 'gift'::text, 'tip'::text, 'clip_sale'::text, 'battle_prize'::text]));

INSERT INTO public.comedian_earnings (
  comedian_id, amount_coins, source_type, source_id, description,
  commission_rate, platform_commission, net_amount, pending_payout, created_at
)
SELECT
  s.comedian_id,
  t.price_paid * 100,
  'ticket',
  t.id,
  'Comedy show ticket',
  20,
  round(t.price_paid::numeric * 0.20, 2),
  round(t.price_paid::numeric * 0.80, 2),
  round(t.price_paid::numeric * 0.80, 2),
  t.purchased_at
FROM public.comedy_tickets t
JOIN public.comedy_shows s ON s.id = t.show_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.comedian_earnings e
  WHERE e.source_type = 'ticket' AND e.source_id = t.id
);

INSERT INTO public.comedy_platform_earnings (
  comedian_id, transaction_type, total_amount, comedian_amount,
  platform_commission, commission_rate, related_id, status, created_at
)
SELECT
  s.comedian_id,
  'ticket_sale',
  t.price_paid,
  round(t.price_paid::numeric * 0.80, 2),
  round(t.price_paid::numeric * 0.20, 2),
  20,
  t.id,
  'pending',
  t.purchased_at
FROM public.comedy_tickets t
JOIN public.comedy_shows s ON s.id = t.show_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.comedy_platform_earnings e
  WHERE e.transaction_type IN ('ticket', 'ticket_sale') AND e.related_id = t.id
);

INSERT INTO public.comedian_earnings (
  comedian_id, amount_coins, source_type, source_id, description,
  commission_rate, platform_commission, net_amount, pending_payout, created_at
)
SELECT
  s.comedian_id,
  round(g.amount * 100)::integer,
  'gift',
  g.id,
  'Comedy live gift',
  20,
  round(g.amount::numeric * 0.20, 2),
  round(g.amount::numeric * 0.80, 2),
  round(g.amount::numeric * 0.80, 2),
  g.created_at
FROM public.sent_platform_gifts g
JOIN public.comedy_shows s ON s.id = g.context_id
WHERE g.context_type = 'comedy'
  AND g.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM public.comedian_earnings e
    WHERE e.source_type = 'gift' AND e.source_id = g.id
  );

INSERT INTO public.comedy_platform_earnings (
  comedian_id, transaction_type, total_amount, comedian_amount,
  platform_commission, commission_rate, related_id, status, created_at
)
SELECT
  s.comedian_id,
  'gift',
  g.amount,
  round(g.amount::numeric * 0.80, 2),
  round(g.amount::numeric * 0.20, 2),
  20,
  g.id,
  'pending',
  g.created_at
FROM public.sent_platform_gifts g
JOIN public.comedy_shows s ON s.id = g.context_id
WHERE g.context_type = 'comedy'
  AND g.status = 'completed'
  AND NOT EXISTS (
    SELECT 1 FROM public.comedy_platform_earnings e
    WHERE e.transaction_type = 'gift' AND e.related_id = g.id
  );

UPDATE public.comedian_profiles p
SET total_earnings = COALESCE((
  SELECT round(sum(e.net_amount))::integer
  FROM public.comedian_earnings e
  WHERE e.comedian_id = p.id
), 0),
updated_at = now();