-- Add listing_expires_at column if not exists
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS listing_expires_at TIMESTAMP WITH TIME ZONE;

-- Create function to activate listing after payment
CREATE OR REPLACE FUNCTION public.activate_property_listing()
RETURNS TRIGGER AS $$
BEGIN
  -- When payment status changes to completed, activate the property
  IF NEW.payment_status = 'completed' AND OLD.payment_status != 'completed' THEN
    UPDATE public.properties
    SET 
      status = 'active',
      is_featured = CASE 
        WHEN NEW.package_type = 'featured' THEN true
        ELSE false
      END,
      listing_expires_at = NOW() + (NEW.duration_days || ' days')::INTERVAL
    WHERE id = NEW.property_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for activating listings
DROP TRIGGER IF EXISTS activate_listing_on_payment ON public.property_listing_packages;
CREATE TRIGGER activate_listing_on_payment
  AFTER UPDATE ON public.property_listing_packages
  FOR EACH ROW
  EXECUTE FUNCTION public.activate_property_listing();

-- Create function to deactivate expired listings
CREATE OR REPLACE FUNCTION public.deactivate_expired_listings()
RETURNS void AS $$
BEGIN
  UPDATE public.properties
  SET status = 'expired'
  WHERE status = 'active'
    AND listing_expires_at IS NOT NULL
    AND listing_expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add index for better performance on expiration checks
CREATE INDEX IF NOT EXISTS idx_properties_listing_expires_at 
ON public.properties(listing_expires_at) 
WHERE status = 'active';