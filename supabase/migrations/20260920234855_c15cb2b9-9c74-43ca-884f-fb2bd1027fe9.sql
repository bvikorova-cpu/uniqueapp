DROP TRIGGER IF EXISTS on_auth_user_created_welcome_credits ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user_welcome_credits();