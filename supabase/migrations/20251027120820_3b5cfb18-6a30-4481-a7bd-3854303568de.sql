-- Fix RLS policy for coloring_pages table to allow edge function to insert records
-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own coloring pages" ON coloring_pages;
DROP POLICY IF EXISTS "Users can view their own coloring pages" ON coloring_pages;
DROP POLICY IF EXISTS "Users can delete their own coloring pages" ON coloring_pages;

-- Create INSERT policy that allows service role (edge functions) and users to insert
CREATE POLICY "Users and service can insert coloring pages"
ON coloring_pages
FOR INSERT
WITH CHECK (
  auth.uid() = user_id OR
  auth.jwt()->>'role' = 'service_role'
);

-- Create SELECT policy for users to view their own pages
CREATE POLICY "Users can view their own coloring pages"
ON coloring_pages
FOR SELECT
USING (auth.uid() = user_id);

-- Create DELETE policy for users to delete their own pages
CREATE POLICY "Users can delete their own coloring pages"
ON coloring_pages
FOR DELETE
USING (auth.uid() = user_id);