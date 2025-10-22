-- Drop and recreate RLS policies for talent_submissions

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can delete their own submissions" ON public.talent_submissions;
DROP POLICY IF EXISTS "Admins can delete any submission" ON public.talent_submissions;
DROP POLICY IF EXISTS "Anyone can view submissions" ON public.talent_submissions;
DROP POLICY IF EXISTS "Authenticated users can create submissions" ON public.talent_submissions;
DROP POLICY IF EXISTS "Users can update their own submissions" ON public.talent_submissions;

-- Create SELECT policy - anyone can view submissions
CREATE POLICY "Anyone can view submissions"
ON public.talent_submissions
FOR SELECT
USING (true);

-- Create INSERT policy - authenticated users can create their own submissions
CREATE POLICY "Authenticated users can create submissions"
ON public.talent_submissions
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Create UPDATE policy - users can update their own submissions
CREATE POLICY "Users can update their own submissions"
ON public.talent_submissions
FOR UPDATE
USING (auth.uid() = user_id);

-- Create DELETE policy - users can delete their own submissions
CREATE POLICY "Users can delete their own submissions"
ON public.talent_submissions
FOR DELETE
USING (auth.uid() = user_id);

-- Create DELETE policy for admins - admins can delete any submission
CREATE POLICY "Admins can delete any submission"
ON public.talent_submissions
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);