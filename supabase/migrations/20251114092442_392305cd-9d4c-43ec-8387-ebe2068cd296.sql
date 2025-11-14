-- Add recording URL to live lessons
ALTER TABLE live_lessons ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Create certificates storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificates', 'certificates', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for certificates - anyone can view
CREATE POLICY "Certificates are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'certificates');

-- Create storage policy for certificates - authenticated users can upload
CREATE POLICY "Authenticated users can upload certificates"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'certificates');

-- Update course_certificates table structure if needed
ALTER TABLE course_certificates 
  ADD COLUMN IF NOT EXISTS certificate_url TEXT,
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ DEFAULT now();

-- Add index for faster certificate lookups
CREATE INDEX IF NOT EXISTS idx_course_certificates_user_course 
ON course_certificates(user_id, course_id);