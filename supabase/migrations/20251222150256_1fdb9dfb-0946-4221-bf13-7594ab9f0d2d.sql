-- Escrow tabuľka pre zadržanie platieb
CREATE TABLE public.bazaar_escrow (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.bazaar_orders(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  commission_amount NUMERIC NOT NULL DEFAULT 0,
  seller_payout NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released', 'refunded', 'disputed')),
  held_at TIMESTAMPTZ DEFAULT now(),
  auto_release_at TIMESTAMPTZ NOT NULL,
  released_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  stripe_transfer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Spory tabuľka
CREATE TABLE public.bazaar_disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.bazaar_orders(id) ON DELETE CASCADE,
  escrow_id UUID REFERENCES public.bazaar_escrow(id),
  opened_by UUID NOT NULL,
  reason TEXT NOT NULL,
  description TEXT,
  evidence_urls TEXT[],
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'under_review', 'resolved_buyer', 'resolved_seller', 'cancelled')),
  admin_id UUID,
  admin_notes TEXT,
  resolution_amount NUMERIC,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Pridať escrow stĺpec do orders
ALTER TABLE public.bazaar_orders 
ADD COLUMN IF NOT EXISTS escrow_status TEXT DEFAULT 'none' CHECK (escrow_status IN ('none', 'held', 'released', 'refunded', 'disputed'));

-- Indexy
CREATE INDEX idx_bazaar_escrow_order_id ON public.bazaar_escrow(order_id);
CREATE INDEX idx_bazaar_escrow_status ON public.bazaar_escrow(status);
CREATE INDEX idx_bazaar_escrow_auto_release ON public.bazaar_escrow(auto_release_at) WHERE status = 'held';
CREATE INDEX idx_bazaar_disputes_order_id ON public.bazaar_disputes(order_id);
CREATE INDEX idx_bazaar_disputes_status ON public.bazaar_disputes(status);

-- RLS
ALTER TABLE public.bazaar_escrow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bazaar_disputes ENABLE ROW LEVEL SECURITY;

-- Escrow policies - viditeľné pre kupujúceho a predávajúceho
CREATE POLICY "Users can view their escrow records"
ON public.bazaar_escrow FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bazaar_orders o
    WHERE o.id = order_id
    AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
  )
);

-- Disputes policies
CREATE POLICY "Users can view their disputes"
ON public.bazaar_disputes FOR SELECT
USING (
  opened_by = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.bazaar_orders o
    WHERE o.id = order_id
    AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
  )
);

CREATE POLICY "Users can open disputes on their orders"
ON public.bazaar_disputes FOR INSERT
WITH CHECK (
  opened_by = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.bazaar_orders o
    WHERE o.id = order_id
    AND (o.buyer_id = auth.uid() OR o.seller_id = auth.uid())
  )
);

CREATE POLICY "Users can update their own disputes"
ON public.bazaar_disputes FOR UPDATE
USING (opened_by = auth.uid())
WITH CHECK (opened_by = auth.uid());

-- Trigger pre updated_at
CREATE TRIGGER update_bazaar_escrow_updated_at
BEFORE UPDATE ON public.bazaar_escrow
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bazaar_disputes_updated_at
BEFORE UPDATE ON public.bazaar_disputes
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();