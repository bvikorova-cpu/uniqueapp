-- Add user_id column to recipes table
ALTER TABLE public.recipes
ADD COLUMN user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update RLS policies for user-created recipes
DROP POLICY IF EXISTS "Authenticated users can update recipes" ON public.recipes;
DROP POLICY IF EXISTS "Authenticated users can create recipes" ON public.recipes;

CREATE POLICY "Authenticated users can create their own recipes"
ON public.recipes
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recipes"
ON public.recipes
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own recipes"
ON public.recipes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);