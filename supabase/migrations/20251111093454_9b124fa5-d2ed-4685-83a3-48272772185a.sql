-- Enable realtime for brand_votes table
ALTER TABLE public.brand_votes REPLICA IDENTITY FULL;

-- The table is already added to the supabase_realtime publication by default
-- But we'll explicitly ensure it's there
ALTER PUBLICATION supabase_realtime ADD TABLE public.brand_votes;