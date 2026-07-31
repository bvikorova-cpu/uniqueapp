ALTER TABLE public.stock_withdrawal_requests
ADD COLUMN IF NOT EXISTS stripe_transfer_id TEXT,
ADD COLUMN IF NOT EXISTS processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS wallet_deducted BOOLEAN DEFAULT false;

CREATE OR REPLACE FUNCTION public.stock_withdrawal_lifecycle()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status IS NULL OR NEW.status NOT IN ('rejected', 'completed') THEN
      IF COALESCE(
        (SELECT balance FROM public.wallet_balances WHERE user_id = NEW.creator_id AND currency = 'EUR'),
        0
      ) < NEW.amount THEN
        RAISE EXCEPTION 'Insufficient EUR wallet balance for withdrawal';
      END IF;

      UPDATE public.wallet_balances
      SET balance = COALESCE(balance,0) - NEW.amount, updated_at = now()
      WHERE user_id = NEW.creator_id AND currency = 'EUR';

      IF EXISTS (SELECT 1 FROM public.stock_creator_earnings WHERE creator_id = NEW.creator_id) THEN
        UPDATE public.stock_creator_earnings
        SET pending_balance = COALESCE(pending_balance,0) + NEW.amount, updated_at = now()
        WHERE creator_id = NEW.creator_id;
      ELSE
        INSERT INTO public.stock_creator_earnings (creator_id, total_earnings, pending_balance, total_withdrawn)
        VALUES (
          NEW.creator_id,
          COALESCE((SELECT SUM(creator_earning) FROM public.stock_content_sales WHERE creator_id = NEW.creator_id), 0),
          NEW.amount,
          0
        );
      END IF;

      NEW.wallet_deducted := true;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'completed' AND OLD.status IS DISTINCT FROM 'completed' AND OLD.wallet_deducted THEN
      IF EXISTS (SELECT 1 FROM public.stock_creator_earnings WHERE creator_id = NEW.creator_id) THEN
        UPDATE public.stock_creator_earnings
        SET pending_balance = COALESCE(pending_balance,0) - NEW.amount,
            total_withdrawn = COALESCE(total_withdrawn,0) + NEW.amount,
            updated_at = now()
        WHERE creator_id = NEW.creator_id;
      END IF;
    END IF;

    IF NEW.status = 'rejected' AND OLD.status IS DISTINCT FROM 'rejected' AND OLD.wallet_deducted THEN
      UPDATE public.wallet_balances
      SET balance = COALESCE(balance,0) + NEW.amount, updated_at = now()
      WHERE user_id = NEW.creator_id AND currency = 'EUR';

      IF EXISTS (SELECT 1 FROM public.stock_creator_earnings WHERE creator_id = NEW.creator_id) THEN
        IF OLD.status = 'completed' THEN
          UPDATE public.stock_creator_earnings
          SET total_withdrawn = COALESCE(total_withdrawn,0) - NEW.amount, updated_at = now()
          WHERE creator_id = NEW.creator_id;
        ELSE
          UPDATE public.stock_creator_earnings
          SET pending_balance = COALESCE(pending_balance,0) - NEW.amount, updated_at = now()
          WHERE creator_id = NEW.creator_id;
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_stock_withdrawal_lifecycle ON public.stock_withdrawal_requests;
CREATE TRIGGER trg_stock_withdrawal_lifecycle
BEFORE INSERT OR UPDATE ON public.stock_withdrawal_requests
FOR EACH ROW EXECUTE FUNCTION public.stock_withdrawal_lifecycle();

DROP POLICY IF EXISTS "Admins can view stock withdrawal requests" ON public.stock_withdrawal_requests;
CREATE POLICY "Admins can view stock withdrawal requests"
ON public.stock_withdrawal_requests FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

GRANT ALL ON public.stock_withdrawal_requests TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.stock_withdrawal_requests TO authenticated;