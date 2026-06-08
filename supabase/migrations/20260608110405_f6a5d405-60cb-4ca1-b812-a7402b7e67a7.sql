
-- Priority Support SLA tracking
ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS sla_response_due_at timestamptz,
  ADD COLUMN IF NOT EXISTS first_response_at timestamptz,
  ADD COLUMN IF NOT EXISTS sla_breached_at timestamptz,
  ADD COLUMN IF NOT EXISTS is_priority_support boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_support_tickets_sla_due
  ON public.support_tickets (sla_response_due_at)
  WHERE is_priority_support = true AND first_response_at IS NULL AND sla_breached_at IS NULL;

-- Trigger: when a sponsor (or any user with is_priority_support flag in category) opens a ticket → set SLA
CREATE OR REPLACE FUNCTION public.set_priority_support_sla()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.category = 'priority_support' OR NEW.priority = 'urgent' THEN
    NEW.is_priority_support := true;
    NEW.sla_response_due_at := COALESCE(NEW.created_at, now()) + interval '4 hours';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_priority_support_sla ON public.support_tickets;
CREATE TRIGGER trg_set_priority_support_sla
  BEFORE INSERT ON public.support_tickets
  FOR EACH ROW EXECUTE FUNCTION public.set_priority_support_sla();

-- Trigger on messages: first admin/support reply marks first_response_at
CREATE OR REPLACE FUNCTION public.mark_ticket_first_response()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.sender_role IN ('admin','support','moderator') THEN
    UPDATE public.support_tickets
       SET first_response_at = COALESCE(first_response_at, now()),
           updated_at = now()
     WHERE id = NEW.ticket_id AND first_response_at IS NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_mark_ticket_first_response ON public.support_ticket_messages;
CREATE TRIGGER trg_mark_ticket_first_response
  AFTER INSERT ON public.support_ticket_messages
  FOR EACH ROW EXECUTE FUNCTION public.mark_ticket_first_response();

-- Drop legacy account manager table (no longer used; replaced by Priority Support)
DROP TABLE IF EXISTS public.brand_sponsor_account_managers CASCADE;
