-- Remove conflicting policies on sports_predictions
DROP POLICY IF EXISTS "Anyone can view predictions" ON public.sports_predictions;
DROP POLICY IF EXISTS "Free predictions viewable by everyone" ON public.sports_predictions;

-- Create single clear SELECT policy that allows viewing all predictions (premium detail visibility is handled in UI)
CREATE POLICY "Predictions are viewable by everyone" 
ON public.sports_predictions 
FOR SELECT 
USING (true);

-- Ensure sports_tipsters is viewable
DROP POLICY IF EXISTS "Tipsters are viewable by everyone" ON public.sports_tipsters;
CREATE POLICY "Tipsters are viewable by everyone" 
ON public.sports_tipsters 
FOR SELECT 
USING (true);