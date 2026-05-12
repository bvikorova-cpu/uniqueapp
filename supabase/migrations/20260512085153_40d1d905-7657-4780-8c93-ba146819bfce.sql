insert into public.achievements (code, name, description, icon, points)
values ('pet_lover', 'Pet Lover', 'Active in both Virtual Pet and AI Pet Translator', '🐾', 50)
on conflict (code) do nothing;