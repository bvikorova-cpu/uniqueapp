-- P1.2: Auto-create influencer_balances row on virtual_influencers insert.

CREATE OR REPLACE FUNCTION public.create_influencer_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.influencer_balances (influencer_id, total_earned, withdrawn, pending_withdrawal)
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_influencer_balance ON public.virtual_influencers;
CREATE TRIGGER trg_create_influencer_balance
AFTER INSERT ON public.virtual_influencers
FOR EACH ROW
EXECUTE FUNCTION public.create_influencer_balance();

-- Backfill any influencers that don't yet have a balance row.
INSERT INTO public.influencer_balances (influencer_id, total_earned, withdrawn, pending_withdrawal)
SELECT vi.id, 0, 0, 0
FROM public.virtual_influencers vi
LEFT JOIN public.influencer_balances ib ON ib.influencer_id = vi.id
WHERE ib.influencer_id IS NULL;
