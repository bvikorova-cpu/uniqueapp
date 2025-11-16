-- Add missing columns to properties table
ALTER TABLE public.properties 
  ADD COLUMN IF NOT EXISTS listing_type TEXT NOT NULL DEFAULT 'sale',
  ADD COLUMN IF NOT EXISTS floor INTEGER,
  ADD COLUMN IF NOT EXISTS total_floors INTEGER,
  ADD COLUMN IF NOT EXISTS year_built INTEGER,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
  ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
  ADD COLUMN IF NOT EXISTS features TEXT[],
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS views_count INTEGER DEFAULT 0;

-- Update existing rows to have default city value if NULL
UPDATE public.properties SET city = location WHERE city IS NULL;
UPDATE public.properties SET address = location WHERE address IS NULL;

-- Now make city and address NOT NULL
ALTER TABLE public.properties 
  ALTER COLUMN city SET NOT NULL,
  ALTER COLUMN address SET NOT NULL;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);