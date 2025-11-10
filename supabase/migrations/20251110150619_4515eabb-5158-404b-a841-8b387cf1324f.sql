-- Add admin policies for corporate_inquiries table

-- Admins can view all inquiries
CREATE POLICY "Admins can view all inquiries"
ON public.corporate_inquiries
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can update all inquiries
CREATE POLICY "Admins can update all inquiries"
ON public.corporate_inquiries
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete inquiries
CREATE POLICY "Admins can delete inquiries"
ON public.corporate_inquiries
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));