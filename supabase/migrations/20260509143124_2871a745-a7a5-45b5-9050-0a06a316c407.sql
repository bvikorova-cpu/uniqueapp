ALTER TABLE public.bazaar_items
  ADD COLUMN IF NOT EXISTS brand text,
  ADD COLUMN IF NOT EXISTS size text,
  ADD COLUMN IF NOT EXISTS shipping_method text DEFAULT 'personal',
  ADD COLUMN IF NOT EXISTS shipping_price numeric DEFAULT 0,
  ADD COLUMN IF NOT EXISTS shipping_options jsonb DEFAULT '[]'::jsonb;

CREATE INDEX IF NOT EXISTS idx_bazaar_items_brand ON public.bazaar_items(brand) WHERE brand IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_bazaar_items_size ON public.bazaar_items(size) WHERE size IS NOT NULL;