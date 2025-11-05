-- Add property-related columns to existing profiles table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
    ALTER TABLE public.profiles ADD COLUMN phone TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_type') THEN
    ALTER TABLE public.profiles ADD COLUMN user_type TEXT CHECK (user_type IN ('agent', 'private_seller', 'buyer')) DEFAULT 'private_seller';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'company_name') THEN
    ALTER TABLE public.profiles ADD COLUMN company_name TEXT;
  END IF;
END $$;

-- Create properties table
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  price DECIMAL(12,2) NOT NULL,
  location TEXT NOT NULL,
  area_sqm DECIMAL(10,2),
  rooms INTEGER,
  bedrooms INTEGER,
  bathrooms INTEGER,
  property_type TEXT CHECK (property_type IN ('apartment', 'house', 'commercial', 'land')),
  status TEXT CHECK (status IN ('draft', 'pending', 'active', 'sold', 'inactive')) DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property_images table
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property_listings table (active paid listings)
CREATE TABLE IF NOT EXISTS public.property_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  package_type TEXT NOT NULL CHECK (package_type IN ('basic', 'premium', 'featured')),
  price_paid DECIMAL(10,2) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  views_count INTEGER DEFAULT 0,
  inquiries_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property_videos table
CREATE TABLE IF NOT EXISTS public.property_videos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES public.properties(id) ON DELETE CASCADE,
  video_url TEXT NOT NULL,
  video_type TEXT CHECK (video_type IN ('tour', '3d_tour')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create property_transactions table
CREATE TABLE IF NOT EXISTS public.property_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('listing_package', 'additional_service')),
  package_type TEXT,
  service_type TEXT,
  amount DECIMAL(10,2) NOT NULL,
  payment_status TEXT CHECK (payment_status IN ('pending', 'completed', 'failed', 'refunded')) DEFAULT 'pending',
  payment_intent_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all property tables
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_transactions ENABLE ROW LEVEL SECURITY;

-- Properties policies
CREATE POLICY "Anyone can view active properties"
  ON public.properties FOR SELECT
  USING (status = 'active' OR auth.uid() = user_id);

CREATE POLICY "Users can create own properties"
  ON public.properties FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties"
  ON public.properties FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties"
  ON public.properties FOR DELETE
  USING (auth.uid() = user_id);

-- Property images policies
CREATE POLICY "Anyone can view images of active properties"
  ON public.property_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_images.property_id
      AND (properties.status = 'active' OR properties.user_id = auth.uid())
    )
  );

CREATE POLICY "Property owners can insert images"
  ON public.property_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_images.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can delete images"
  ON public.property_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_images.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Property listings policies
CREATE POLICY "Anyone can view active listings"
  ON public.property_listings FOR SELECT
  USING (
    is_active = true OR
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_listings.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can create listings"
  ON public.property_listings FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_listings.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can update listings"
  ON public.property_listings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_listings.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Property videos policies
CREATE POLICY "Anyone can view videos of active properties"
  ON public.property_videos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_videos.property_id
      AND (properties.status = 'active' OR properties.user_id = auth.uid())
    )
  );

CREATE POLICY "Property owners can insert videos"
  ON public.property_videos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_videos.property_id
      AND properties.user_id = auth.uid()
    )
  );

CREATE POLICY "Property owners can delete videos"
  ON public.property_videos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE properties.id = property_videos.property_id
      AND properties.user_id = auth.uid()
    )
  );

-- Property transactions policies
CREATE POLICY "Users can view own transactions"
  ON public.property_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transactions"
  ON public.property_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create storage buckets for property media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('property-videos', 'property-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property images
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-images' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own property images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own property images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Storage policies for property videos
CREATE POLICY "Anyone can view property videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-videos');

CREATE POLICY "Authenticated users can upload property videos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'property-videos' 
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can update own property videos"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'property-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own property videos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'property-videos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Create trigger for properties updated_at if update_updated_at_column function exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
    DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
    CREATE TRIGGER update_properties_updated_at
      BEFORE UPDATE ON public.properties
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;