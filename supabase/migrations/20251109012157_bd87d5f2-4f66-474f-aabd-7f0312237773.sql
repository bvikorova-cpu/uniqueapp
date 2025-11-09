-- Create verification status enum
CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'requires_resubmission');

-- Create employer verifications table
CREATE TABLE public.employer_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  company_registration_number TEXT,
  company_address TEXT NOT NULL,
  company_website TEXT,
  company_phone TEXT NOT NULL,
  verification_status verification_status NOT NULL DEFAULT 'pending',
  rejection_reason TEXT,
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(employer_id)
);

-- Create verification documents table
CREATE TABLE public.employer_verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  verification_id UUID NOT NULL REFERENCES public.employer_verifications(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN ('business_license', 'tax_certificate', 'company_registration', 'proof_of_address', 'other')),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.employer_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_verification_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for employer_verifications
CREATE POLICY "Employers can view own verification"
ON public.employer_verifications
FOR SELECT
TO authenticated
USING (auth.uid() = employer_id);

CREATE POLICY "Employers can create own verification"
ON public.employer_verifications
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = employer_id);

CREATE POLICY "Employers can update own pending verification"
ON public.employer_verifications
FOR UPDATE
TO authenticated
USING (
  auth.uid() = employer_id 
  AND verification_status IN ('pending', 'requires_resubmission')
)
WITH CHECK (
  auth.uid() = employer_id
  AND verification_status IN ('pending', 'requires_resubmission')
);

CREATE POLICY "Admins can view all verifications"
ON public.employer_verifications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all verifications"
ON public.employer_verifications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for employer_verification_documents
CREATE POLICY "Employers can view own documents"
ON public.employer_verification_documents
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employer_verifications
    WHERE employer_verifications.id = employer_verification_documents.verification_id
    AND employer_verifications.employer_id = auth.uid()
  )
);

CREATE POLICY "Employers can upload own documents"
ON public.employer_verification_documents
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.employer_verifications
    WHERE employer_verifications.id = employer_verification_documents.verification_id
    AND employer_verifications.employer_id = auth.uid()
    AND employer_verifications.verification_status IN ('pending', 'requires_resubmission')
  )
);

CREATE POLICY "Employers can delete own pending documents"
ON public.employer_verification_documents
FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.employer_verifications
    WHERE employer_verifications.id = employer_verification_documents.verification_id
    AND employer_verifications.employer_id = auth.uid()
    AND employer_verifications.verification_status IN ('pending', 'requires_resubmission')
  )
);

CREATE POLICY "Admins can view all documents"
ON public.employer_verification_documents
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_employer_verification_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_employer_verifications_timestamp
BEFORE UPDATE ON public.employer_verifications
FOR EACH ROW
EXECUTE FUNCTION update_employer_verification_updated_at();

-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('employer-verification-docs', 'employer-verification-docs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Employers can upload verification documents"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'employer-verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Employers can view own verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'employer-verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'employer-verification-docs'
  AND public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Employers can delete own pending documents"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'employer-verification-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);