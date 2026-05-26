DO $$
DECLARE v_path uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.quest_paths (id, name, season_number, starts_at, ends_at, is_active)
  VALUES (v_path, 'Hero''s Journey', 1, now(), now() + interval '60 days', true);

  INSERT INTO public.quest_nodes (path_id, node_index, title, description, icon, required_xp, reward_type, reward_value, reward_label, is_boss) VALUES
  (v_path, 1, 'The Awakening', 'Earn your first 50 XP', '🌱', 50, 'xp', 25, '+25 XP', false),
  (v_path, 2, 'First Steps', 'Reach 150 XP total', '👣', 150, 'xp', 50, '+50 XP', false),
  (v_path, 3, 'Rising Star', 'Reach 300 XP', '⭐', 300, 'xp', 75, '+75 XP', false),
  (v_path, 4, 'Sharpened Skills', 'Reach 500 XP', '⚔️', 500, 'credit', 2, '+2 Credits', false),
  (v_path, 5, 'Halfway Hero', 'Reach 800 XP', '🛡️', 800, 'xp', 150, '+150 XP', false),
  (v_path, 6, 'Trial of Fire', 'Reach 1200 XP', '🔥', 1200, 'credit', 3, '+3 Credits', false),
  (v_path, 7, 'Mountain Pass', 'Reach 1700 XP', '⛰️', 1700, 'xp', 250, '+250 XP', false),
  (v_path, 8, 'Champion''s Gate', 'Reach 2300 XP', '🏰', 2300, 'credit', 5, '+5 Credits', false),
  (v_path, 9, 'Final Ascent', 'Reach 3000 XP', '🗡️', 3000, 'xp', 500, '+500 XP', false),
  (v_path, 10, 'BOSS: Legendary Hero', 'Reach 4000 XP and claim the legend', '👑', 4000, 'credit', 15, '+15 Credits + Badge', true);
END $$;