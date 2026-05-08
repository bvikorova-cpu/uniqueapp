CREATE POLICY "Anyone can view puzzles for published rooms"
ON public.escape_room_puzzles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.escape_rooms
    WHERE escape_rooms.id = escape_room_puzzles.room_id
      AND escape_rooms.is_published = true
  )
);