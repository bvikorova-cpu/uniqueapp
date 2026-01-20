-- Create global_announcements table for site-wide banners
CREATE TABLE IF NOT EXISTS public.global_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_by UUID REFERENCES auth.users(id),
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.global_announcements ENABLE ROW LEVEL SECURITY;

-- Only admins can manage announcements (using has_role function)
CREATE POLICY "Admins can manage announcements"
ON public.global_announcements
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- All authenticated users can view active announcements
CREATE POLICY "Users can view active announcements"
ON public.global_announcements
FOR SELECT
TO authenticated
USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Add is_verified column to profiles if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'profiles' 
                   AND column_name = 'is_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN is_verified BOOLEAN DEFAULT false;
    END IF;
END $$;