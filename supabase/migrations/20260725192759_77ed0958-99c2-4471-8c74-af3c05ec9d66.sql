
INSERT INTO public.mystery_box_items (box_id, item_name, item_type, item_data, rarity, drop_chance, duration_days)
SELECT b.id, x.item_name, x.item_type, x.item_data, x.rarity::item_rarity, x.drop_chance, 30
FROM public.mystery_boxes b
JOIN (VALUES
  ('Sparkle Effect','effect','{"effect":"sparkle"}'::jsonb,'common',40.0),
  ('Vintage Filter','filter','{"effect":"vintage"}'::jsonb,'common',30.0),
  ('Cool Avatar Frame','avatar','{"frame":"cool"}'::jsonb,'rare',20.0),
  ('Neon Glow','filter','{"effect":"neon"}'::jsonb,'rare',7.0),
  ('Mystery Badge','badge','{"badge":"mystery"}'::jsonb,'epic',3.0)
) AS x(item_name,item_type,item_data,rarity,drop_chance) ON true
WHERE NOT EXISTS (SELECT 1 FROM public.mystery_box_items i WHERE i.box_id=b.id);
