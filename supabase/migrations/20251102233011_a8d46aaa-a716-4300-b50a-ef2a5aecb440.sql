-- Create table for individual rooms within escape rooms
CREATE TABLE IF NOT EXISTS public.escape_room_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  escape_room_id UUID NOT NULL REFERENCES public.escape_rooms(id) ON DELETE CASCADE,
  room_number INTEGER NOT NULL CHECK (room_number >= 1 AND room_number <= 5),
  room_name TEXT NOT NULL,
  description TEXT,
  theme_variation TEXT NOT NULL DEFAULT 'standard',
  puzzle_type TEXT NOT NULL DEFAULT 'keys',
  keys_required INTEGER NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(escape_room_id, room_number)
);

-- Enable RLS
ALTER TABLE public.escape_room_rooms ENABLE ROW LEVEL SECURITY;

-- Policy: Everyone can view rooms
CREATE POLICY "Anyone can view escape room rooms"
ON public.escape_room_rooms
FOR SELECT
USING (true);

-- Policy: Only creators can insert rooms
CREATE POLICY "Creators can insert their escape room rooms"
ON public.escape_room_rooms
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.escape_rooms
    WHERE id = escape_room_id
    AND creator_id = auth.uid()
  )
);

-- Policy: Only creators can update rooms
CREATE POLICY "Creators can update their escape room rooms"
ON public.escape_room_rooms
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.escape_rooms
    WHERE id = escape_room_id
    AND creator_id = auth.uid()
  )
);

-- Policy: Only creators can delete rooms
CREATE POLICY "Creators can delete their escape room rooms"
ON public.escape_room_rooms
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.escape_rooms
    WHERE id = escape_room_id
    AND creator_id = auth.uid()
  )
);

-- Add trigger for updated_at
CREATE TRIGGER update_escape_room_rooms_updated_at
BEFORE UPDATE ON public.escape_room_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert 5 rooms for each existing escape room
INSERT INTO public.escape_room_rooms (escape_room_id, room_number, room_name, description, theme_variation, puzzle_type, keys_required)
SELECT 
  er.id,
  room_num,
  CASE room_num
    WHEN 1 THEN 'The Entrance Hall'
    WHEN 2 THEN 'The Main Chamber'
    WHEN 3 THEN 'The Secret Passage'
    WHEN 4 THEN 'The Puzzle Room'
    WHEN 5 THEN 'The Final Exit'
  END,
  CASE room_num
    WHEN 1 THEN 'Your journey begins here. Find the keys to unlock the next room.'
    WHEN 2 THEN 'The main area with more complex puzzles awaits.'
    WHEN 3 THEN 'A hidden passage with mysterious challenges.'
    WHEN 4 THEN 'The most challenging room with intricate puzzles.'
    WHEN 5 THEN 'The final obstacle before freedom. Solve this to escape!'
  END,
  CASE room_num
    WHEN 1 THEN 'entrance'
    WHEN 2 THEN 'main'
    WHEN 3 THEN 'secret'
    WHEN 4 THEN 'puzzle'
    WHEN 5 THEN 'exit'
  END,
  'keys',
  3
FROM public.escape_rooms er
CROSS JOIN generate_series(1, 5) AS room_num
ON CONFLICT (escape_room_id, room_number) DO NOTHING;

-- Add index for better query performance
CREATE INDEX idx_escape_room_rooms_escape_room_id ON public.escape_room_rooms(escape_room_id);
CREATE INDEX idx_escape_room_rooms_room_number ON public.escape_room_rooms(escape_room_id, room_number);