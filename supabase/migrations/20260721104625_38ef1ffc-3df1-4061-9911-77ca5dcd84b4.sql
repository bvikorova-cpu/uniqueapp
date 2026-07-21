
-- Public read for gift wall (only paid transactions, no sensitive info hidden — sender_id and creator_id are public UIDs)
GRANT SELECT ON public.creator_gifts TO anon, authenticated;
GRANT SELECT ON public.creator_gift_transactions TO anon, authenticated;
GRANT INSERT ON public.creator_gift_transactions TO authenticated;
GRANT ALL ON public.creator_gifts TO service_role;
GRANT ALL ON public.creator_gift_transactions TO service_role;

DROP POLICY IF EXISTS "Public can view paid gift transactions" ON public.creator_gift_transactions;
CREATE POLICY "Public can view paid gift transactions"
  ON public.creator_gift_transactions FOR SELECT
  USING (status = 'paid');

-- Prevent self-gifting
CREATE OR REPLACE FUNCTION public.prevent_self_gift()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  IF NEW.sender_id = NEW.creator_id THEN
    RAISE EXCEPTION 'You cannot send a gift to yourself';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_gift ON public.creator_gift_transactions;
CREATE TRIGGER trg_prevent_self_gift
  BEFORE INSERT ON public.creator_gift_transactions
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_gift();

-- Realtime for live gift wall
ALTER TABLE public.creator_gift_transactions REPLICA IDENTITY FULL;
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public'
      AND tablename = 'creator_gift_transactions'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.creator_gift_transactions;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_creator_gift_tx_creator_paid
  ON public.creator_gift_transactions (creator_id, created_at DESC)
  WHERE status = 'paid';
