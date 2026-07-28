INSERT INTO public.brain_duel_seasonal_themes (name, theme_key, description, gradient_from, gradient_to, emoji, is_active)
VALUES ('Autumn Mind Harvest','autumn','Cozy autumn trivia challenge','#f59e0b','#b45309','🍂',false),
       ('Winter Wisdom Frost','winter','Frosty winter knowledge battles','#38bdf8','#6366f1','❄️',false)
ON CONFLICT (theme_key) DO NOTHING;

UPDATE public.brain_duel_seasonal_themes SET is_active = (theme_key = 'summer');