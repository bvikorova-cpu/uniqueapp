-- Temporarily allow NULL for creator_id to insert sample data
ALTER TABLE escape_rooms ALTER COLUMN creator_id DROP NOT NULL;

-- Insert sample escape rooms
INSERT INTO escape_rooms (creator_id, title, description, difficulty, theme, price, duration_minutes, max_players, room_type, is_published) VALUES
('00000000-0000-0000-0000-000000000000', 'The Haunted Manor', 'Escape from a cursed Victorian mansion filled with supernatural puzzles and ghostly secrets.', 'medium', 'horror', 0, 60, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Mars Colony Mystery', 'Solve the disappearance of the Mars Colony crew in this sci-fi thriller.', 'hard', 'sci-fi', 10, 75, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Detective''s Office', 'Help solve a murder case by finding clues in a 1920s detective office.', 'easy', 'mystery', 0, 45, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Dragon''s Lair', 'Retrieve the magical artifact from the dragon''s treasure room before time runs out.', 'expert', 'fantasy', 15, 90, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Jungle Expedition', 'Navigate through an ancient temple filled with traps and puzzles.', 'medium', 'adventure', 5, 60, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Math Challenge', 'Solve mathematical puzzles and logic problems in this educational escape room.', 'easy', 'educational', 0, 30, 4, 'educational', true),
('00000000-0000-0000-0000-000000000000', 'Corporate Team Builder', 'Custom escape room designed for team building exercises.', 'medium', 'corporate', 50, 60, 10, 'corporate', true);

-- Fix function search_path security warnings
ALTER FUNCTION update_room_plays() SET search_path = public;
ALTER FUNCTION update_updated_at_column() SET search_path = public;
ALTER FUNCTION add_leaderboard_entry() SET search_path = public;