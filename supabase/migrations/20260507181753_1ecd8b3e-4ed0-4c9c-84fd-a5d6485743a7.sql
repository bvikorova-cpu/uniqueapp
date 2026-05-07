ALTER TABLE public.stock_content_items
  ADD COLUMN IF NOT EXISTS resolutions JSONB NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.stock_content_sales
  ADD COLUMN IF NOT EXISTS resolution TEXT NOT NULL DEFAULT 'original';

UPDATE public.stock_content_items
SET resolutions = jsonb_build_object(
  'small',    jsonb_build_object('url', file_url, 'width', 640,  'price_multiplier', 0.4),
  'medium',   jsonb_build_object('url', file_url, 'width', 1280, 'price_multiplier', 0.7),
  'large',    jsonb_build_object('url', file_url, 'width', 1920, 'price_multiplier', 1.0),
  'original', jsonb_build_object('url', file_url, 'width', 0,    'price_multiplier', 1.5)
)
WHERE resolutions = '{}'::jsonb AND file_url IS NOT NULL;