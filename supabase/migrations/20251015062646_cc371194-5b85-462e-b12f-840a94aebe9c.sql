-- Fix security warnings by setting search_path on functions using CASCADE

DROP FUNCTION IF EXISTS update_learning_progress_timestamp() CASCADE;
CREATE OR REPLACE FUNCTION update_learning_progress_timestamp()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_learning_progress_updated_at
  BEFORE UPDATE ON public.learning_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_learning_progress_timestamp();

DROP FUNCTION IF EXISTS generate_certificate_number() CASCADE;
CREATE OR REPLACE FUNCTION generate_certificate_number()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  cert_number TEXT;
BEGIN
  cert_number := 'CERT-' || TO_CHAR(NOW(), 'YYYY') || '-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
  RETURN cert_number;
END;
$$;