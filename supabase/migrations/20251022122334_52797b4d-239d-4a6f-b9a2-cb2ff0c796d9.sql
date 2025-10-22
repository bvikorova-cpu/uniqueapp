-- Remove specific shows from kids_shows table
DELETE FROM public.kids_shows 
WHERE title IN ('Monsters University', 'Inside Out 2', 'Finding Dory');