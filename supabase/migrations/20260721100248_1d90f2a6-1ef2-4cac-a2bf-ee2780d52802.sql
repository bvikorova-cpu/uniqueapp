
-- PPV posts (pay-per-view)
CREATE TABLE public.influking_ppv_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  preview_url TEXT,
  content_url TEXT NOT NULL,
  content_type TEXT NOT NULL DEFAULT 'image' CHECK (content_type IN ('image','video','audio','text','bundle')),
  price_cents INTEGER NOT NULL CHECK (price_cents >= 100),
  currency TEXT NOT NULL DEFAULT 'eur',
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_unlocks INTEGER NOT NULL DEFAULT 0,
  total_revenue_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.influking_ppv_posts TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.influking_ppv_posts TO authenticated;
GRANT ALL ON public.influking_ppv_posts TO service_role;

ALTER TABLE public.influking_ppv_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active PPV posts"
ON public.influking_ppv_posts FOR SELECT
USING (is_active = true OR creator_id = auth.uid());

CREATE POLICY "Creators manage own PPV posts"
ON public.influking_ppv_posts FOR ALL
USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);

CREATE INDEX idx_ppv_creator ON public.influking_ppv_posts(creator_id, created_at DESC);

-- Unlocks (ownership records)
CREATE TABLE public.influking_ppv_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.influking_ppv_posts(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  creator_earnings_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'eur',
  stripe_session_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','completed','refunded','failed')),
  unlocked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (post_id, buyer_id, status)
);

GRANT SELECT, INSERT, UPDATE ON public.influking_ppv_unlocks TO authenticated;
GRANT ALL ON public.influking_ppv_unlocks TO service_role;

ALTER TABLE public.influking_ppv_unlocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own unlocks"
ON public.influking_ppv_unlocks FOR SELECT
USING (auth.uid() = buyer_id OR auth.uid() = creator_id);

CREATE POLICY "Buyer creates own unlock"
ON public.influking_ppv_unlocks FOR INSERT
WITH CHECK (auth.uid() = buyer_id);

CREATE INDEX idx_ppv_unlocks_buyer ON public.influking_ppv_unlocks(buyer_id, status);
CREATE INDEX idx_ppv_unlocks_post ON public.influking_ppv_unlocks(post_id, status);

-- updated_at triggers
CREATE TRIGGER ppv_posts_updated_at BEFORE UPDATE ON public.influking_ppv_posts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER ppv_unlocks_updated_at BEFORE UPDATE ON public.influking_ppv_unlocks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Check unlock helper (bypasses RLS for content gating)
CREATE OR REPLACE FUNCTION public.has_ppv_unlock(_post_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.influking_ppv_unlocks
    WHERE post_id = _post_id AND buyer_id = _user_id AND status = 'completed'
  );
$$;

-- Increment counters on completion
CREATE OR REPLACE FUNCTION public.ppv_apply_unlock_counters()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS DISTINCT FROM 'completed') THEN
    UPDATE public.influking_ppv_posts
    SET total_unlocks = total_unlocks + 1,
        total_revenue_cents = total_revenue_cents + NEW.amount_cents
    WHERE id = NEW.post_id;
    IF NEW.unlocked_at IS NULL THEN
      NEW.unlocked_at = now();
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER ppv_unlock_counters
BEFORE UPDATE ON public.influking_ppv_unlocks
FOR EACH ROW EXECUTE FUNCTION public.ppv_apply_unlock_counters();
