-- Drop SuperHero Universe tables and related objects (with CASCADE)

-- Drop trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created_superhero ON auth.users;

-- Drop functions with CASCADE
DROP FUNCTION IF EXISTS public.initialize_superhero_credits() CASCADE;
DROP FUNCTION IF EXISTS public.update_hero_battle_stats(uuid, boolean, integer) CASCADE;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS public.superhero_tournament_participants CASCADE;
DROP TABLE IF EXISTS public.superhero_battles CASCADE;
DROP TABLE IF EXISTS public.superhero_tournaments CASCADE;
DROP TABLE IF EXISTS public.superhero_heroes CASCADE;
DROP TABLE IF EXISTS public.superhero_age_verification CASCADE;
DROP TABLE IF EXISTS public.superhero_credits CASCADE;