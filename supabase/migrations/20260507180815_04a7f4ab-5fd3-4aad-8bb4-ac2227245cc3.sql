
ALTER TABLE public.stock_content_items
  ADD COLUMN IF NOT EXISTS license_pricing JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS is_editorial BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE public.stock_content_sales
  ADD COLUMN IF NOT EXISTS license_type TEXT NOT NULL DEFAULT 'standard';

UPDATE public.stock_content_items
SET license_pricing = jsonb_build_object(
  'standard', ROUND(price_eur::numeric, 2),
  'extended', ROUND((price_eur * 5)::numeric, 2),
  'editorial', ROUND((price_eur * 0.5)::numeric, 2)
)
WHERE license_pricing = '{}'::jsonb OR license_pricing IS NULL;
