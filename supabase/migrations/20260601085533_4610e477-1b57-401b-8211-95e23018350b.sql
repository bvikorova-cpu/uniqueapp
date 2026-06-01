-- Ledger pre auditovanie každej zmeny ai_credits.credits_remaining
CREATE TABLE public.ai_credits_ledger (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  delta INTEGER NOT NULL,
  balance_before INTEGER NOT NULL,
  balance_after INTEGER NOT NULL,
  reason TEXT NOT NULL DEFAULT 'unknown',
  source TEXT,
  actor UUID,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_ai_credits_ledger_user ON public.ai_credits_ledger(user_id, created_at DESC);
CREATE INDEX idx_ai_credits_ledger_reason ON public.ai_credits_ledger(reason);

GRANT SELECT ON public.ai_credits_ledger TO authenticated;
GRANT ALL ON public.ai_credits_ledger TO service_role;

ALTER TABLE public.ai_credits_ledger ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own ledger"
ON public.ai_credits_ledger FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Admins view all ledger"
ON public.ai_credits_ledger FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Klienti nikdy nepíšu — len trigger / service_role
CREATE POLICY "No client writes ledger"
ON public.ai_credits_ledger FOR INSERT
TO authenticated
WITH CHECK (false);

-- Trigger funkcia
CREATE OR REPLACE FUNCTION public.log_ai_credits_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_before INTEGER;
  v_after INTEGER;
  v_delta INTEGER;
  v_reason TEXT;
  v_source TEXT;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_before := 0;
    v_after := COALESCE(NEW.credits_remaining, 0);
  ELSE
    v_before := COALESCE(OLD.credits_remaining, 0);
    v_after := COALESCE(NEW.credits_remaining, 0);
  END IF;

  v_delta := v_after - v_before;
  IF v_delta = 0 THEN
    RETURN NEW;
  END IF;

  -- Reason / source nastavený volajúcim cez SET LOCAL app.credit_reason = '...'
  BEGIN v_reason := current_setting('app.credit_reason', true); EXCEPTION WHEN OTHERS THEN v_reason := NULL; END;
  BEGIN v_source := current_setting('app.credit_source', true); EXCEPTION WHEN OTHERS THEN v_source := NULL; END;

  INSERT INTO public.ai_credits_ledger(user_id, delta, balance_before, balance_after, reason, source, actor)
  VALUES (
    NEW.user_id,
    v_delta,
    v_before,
    v_after,
    COALESCE(NULLIF(v_reason, ''), CASE WHEN TG_OP = 'INSERT' THEN 'initial_insert' ELSE 'unknown_update' END),
    NULLIF(v_source, ''),
    auth.uid()
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ai_credits_ledger ON public.ai_credits;
CREATE TRIGGER trg_ai_credits_ledger
AFTER INSERT OR UPDATE OF credits_remaining ON public.ai_credits
FOR EACH ROW
EXECUTE FUNCTION public.log_ai_credits_change();