-- Create remaining tables
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.property_listing_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  package_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  duration_days INTEGER NOT NULL,
  starts_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  stripe_session_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.property_additional_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  service_type TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stripe_session_id TEXT,
  payment_status TEXT DEFAULT 'pending',
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.property_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  user_id UUID,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listing_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_additional_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_property_images_property_id ON public.property_images(property_id);
CREATE INDEX IF NOT EXISTS idx_property_listing_packages_property_id ON public.property_listing_packages(property_id);
CREATE INDEX IF NOT EXISTS idx_property_inquiries_property_id ON public.property_inquiries(property_id);

-- RLS Policies for property_images
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view property images" ON public.property_images;
  DROP POLICY IF EXISTS "Users can insert images for their properties" ON public.property_images;
  DROP POLICY IF EXISTS "Users can update images for their properties" ON public.property_images;
  DROP POLICY IF EXISTS "Users can delete images for their properties" ON public.property_images;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Anyone can view property images"
  ON public.property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_images.property_id
      AND (status = 'active' OR user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert images for their properties"
  ON public.property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_images.property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update images for their properties"
  ON public.property_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_images.property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete images for their properties"
  ON public.property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_images.property_id AND user_id = auth.uid()
    )
  );

-- RLS Policies for property_listing_packages
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own listing packages" ON public.property_listing_packages;
  DROP POLICY IF EXISTS "Users can insert their own listing packages" ON public.property_listing_packages;
  DROP POLICY IF EXISTS "Users can update their own listing packages" ON public.property_listing_packages;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Users can view their own listing packages"
  ON public.property_listing_packages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own listing packages"
  ON public.property_listing_packages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own listing packages"
  ON public.property_listing_packages FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for property_additional_services
DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view their own additional services" ON public.property_additional_services;
  DROP POLICY IF EXISTS "Users can insert their own additional services" ON public.property_additional_services;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Users can view their own additional services"
  ON public.property_additional_services FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own additional services"
  ON public.property_additional_services FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for property_inquiries
DO $$ BEGIN
  DROP POLICY IF EXISTS "Property owners can view inquiries for their properties" ON public.property_inquiries;
  DROP POLICY IF EXISTS "Anyone can insert inquiries" ON public.property_inquiries;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE POLICY "Property owners can view inquiries for their properties"
  ON public.property_inquiries FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_inquiries.property_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can insert inquiries"
  ON public.property_inquiries FOR INSERT
  WITH CHECK (true);

-- Create function to activate listing after payment
CREATE OR REPLACE FUNCTION activate_property_listing()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    NEW.starts_at = NOW();
    NEW.expires_at = NOW() + (NEW.duration_days || ' days')::INTERVAL;
    NEW.is_active = TRUE;
    
    UPDATE public.properties
    SET 
      status = 'active',
      is_featured = (NEW.package_type = 'featured'),
      updated_at = NOW()
    WHERE id = NEW.property_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS activate_listing_on_payment ON public.property_listing_packages;
CREATE TRIGGER activate_listing_on_payment
  BEFORE UPDATE ON public.property_listing_packages
  FOR EACH ROW
  EXECUTE FUNCTION activate_property_listing();