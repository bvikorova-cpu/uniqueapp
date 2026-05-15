
INSERT INTO public.quest_paths (id, name, season_number, starts_at, ends_at, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111','RLS Test Active',9991, now() - interval '1 day', now() + interval '30 days', true),
  ('22222222-2222-2222-2222-222222222222','RLS Test Inactive',9992, now() - interval '60 days', now() - interval '10 days', false),
  ('33333333-3333-3333-3333-333333333333','RLS Test Future',9993, now() + interval '10 days', now() + interval '40 days', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quest_nodes (id, path_id, node_index, title, reward_type, reward_value, is_boss) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111',0,'Active Node','xp',100,false),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb','22222222-2222-2222-2222-222222222222',0,'Inactive Node','xp',100,false),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc','33333333-3333-3333-3333-333333333333',0,'Future Node','xp',100,false)
ON CONFLICT (id) DO NOTHING;
