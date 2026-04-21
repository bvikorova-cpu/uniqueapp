CREATE OR REPLACE FUNCTION public.create_influencer_balance_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.influencer_balances (
    influencer_id, total_earned, withdrawn, pending_withdrawal
  )
  VALUES (NEW.id, 0, 0, 0)
  ON CONFLICT (influencer_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_influencer_balance ON public.virtual_influencers;
CREATE TRIGGER trg_create_influencer_balance
AFTER INSERT ON public.virtual_influencers
FOR EACH ROW
EXECUTE FUNCTION public.create_influencer_balance_on_insert();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'influencer_balances_influencer_id_key'
  ) THEN
    ALTER TABLE public.influencer_balances
      ADD CONSTRAINT influencer_balances_influencer_id_key UNIQUE (influencer_id);
  END IF;
END$$;

INSERT INTO public.influencer_balances (influencer_id, total_earned, withdrawn, pending_withdrawal)
SELECT vi.id, 0, 0, 0
FROM public.virtual_influencers vi
LEFT JOIN public.influencer_balances ib ON ib.influencer_id = vi.id
WHERE ib.id IS NULL
ON CONFLICT (influencer_id) DO NOTHING;