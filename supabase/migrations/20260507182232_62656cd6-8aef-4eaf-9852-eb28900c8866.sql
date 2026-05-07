-- Releases table
CREATE TABLE IF NOT EXISTS public.stock_content_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_item_id UUID NOT NULL REFERENCES public.stock_content_items(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL,
  release_type TEXT NOT NULL CHECK (release_type IN ('model','property')),
  signer_name TEXT NOT NULL,
  signer_email TEXT,
  signed_date DATE,
  document_url TEXT,
  notes TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stock_releases_item ON public.stock_content_releases(content_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_releases_creator ON public.stock_content_releases(creator_id);

ALTER TABLE public.stock_content_releases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Creators manage their releases"
ON public.stock_content_releases
FOR ALL
TO authenticated
USING (auth.uid() = creator_id)
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Admins view all releases"
ON public.stock_content_releases
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_stock_releases_updated_at
BEFORE UPDATE ON public.stock_content_releases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Item-level release flags (visible to buyers)
ALTER TABLE public.stock_content_items
  ADD COLUMN IF NOT EXISTS requires_release BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS releases_verified BOOLEAN NOT NULL DEFAULT false;

-- Private storage bucket for release docs
INSERT INTO storage.buckets (id, name, public)
VALUES ('stock-releases', 'stock-releases', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Creators upload their release docs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'stock-releases' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators read their release docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'stock-releases' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Creators delete their release docs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'stock-releases' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Admins read all release docs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'stock-releases' AND public.has_role(auth.uid(), 'admin'));