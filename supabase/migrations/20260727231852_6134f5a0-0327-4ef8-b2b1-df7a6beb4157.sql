-- Grants for all coloring_* tables (were completely missing)
DO $$
DECLARE t text;
DECLARE public_read text[] := ARRAY['coloring_community_gallery','coloring_daily_challenges','coloring_artworks','coloring_contests','coloring_likes','coloring_gallery_likes','coloring_follows'];
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'coloring_%' LOOP
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON public.%I TO authenticated', t);
    EXECUTE format('GRANT ALL ON public.%I TO service_role', t);
    IF t = ANY(public_read) THEN
      EXECUTE format('GRANT SELECT ON public.%I TO anon', t);
    END IF;
  END LOOP;
END $$;

-- Seed daily challenges for the next 30 days if missing
INSERT INTO public.coloring_daily_challenges (challenge_date, theme, description, difficulty, prompt, xp_reward)
SELECT
  (CURRENT_DATE + (n || ' days')::interval)::date AS challenge_date,
  theme, description, difficulty, prompt, xp_reward
FROM (
  VALUES
    ('Enchanted Forest','Color a magical woodland scene with hidden creatures.','medium','enchanted forest with fairies, mushrooms and glowing trees',150),
    ('Underwater Kingdom','Bring an ocean palace to life with vibrant coral colors.','medium','underwater kingdom with mermaids, coral reefs and fish',150),
    ('Space Explorer','Paint a bold cosmic adventure through the galaxy.','hard','astronaut exploring alien planets with rockets and stars',200),
    ('Cute Animals','Simple animal friends waiting for their colors.','easy','cute cartoon animals: cat, dog, rabbit and panda',100),
    ('Fairy Tale Castle','A princess castle full of intricate details.','hard','majestic fairy tale castle with towers, flags and dragons',200),
    ('Garden Party','Blooming flowers and cheerful butterflies.','easy','flower garden with butterflies, bees and sunflowers',100),
    ('Mandala Magic','Symmetrical mandala patterns to color mindfully.','medium','intricate mandala with geometric patterns',150),
    ('Dinosaur World','Prehistoric giants roaming a lush landscape.','medium','friendly dinosaurs in a jungle with volcanoes',150),
    ('Winter Wonderland','A snowy scene with cozy details.','easy','snowman, pine trees and snowflakes in a winter village',100),
    ('Superhero Squad','Action-packed superheroes ready to save the day.','hard','superhero team in dynamic action poses in a city',200)
) AS seeds(theme, description, difficulty, prompt, xp_reward)
CROSS JOIN generate_series(0, 29) AS n
WHERE ((n % 10) + 1) = (
  CASE seeds.theme
    WHEN 'Enchanted Forest' THEN 1 WHEN 'Underwater Kingdom' THEN 2
    WHEN 'Space Explorer' THEN 3 WHEN 'Cute Animals' THEN 4
    WHEN 'Fairy Tale Castle' THEN 5 WHEN 'Garden Party' THEN 6
    WHEN 'Mandala Magic' THEN 7 WHEN 'Dinosaur World' THEN 8
    WHEN 'Winter Wonderland' THEN 9 WHEN 'Superhero Squad' THEN 10
  END
)
ON CONFLICT (challenge_date) DO NOTHING;