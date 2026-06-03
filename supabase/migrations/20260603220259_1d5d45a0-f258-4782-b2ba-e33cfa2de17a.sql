
CREATE OR REPLACE FUNCTION public.is_verified_founder(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'founder'::app_role
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_verified_founder(uuid) TO anon, authenticated;

INSERT INTO public.challenges (slug, title, description, icon, challenge_type, action_type, target_count, xp_reward, active)
VALUES ('daily_storyteller', 'Daily Storyteller', 'Share 1 story today', '📸', 'daily', 'story', 1, 15, true)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.user_roles (user_id, role)
SELECT id, 'founder'::app_role FROM auth.users
WHERE lower(email) = 'b.vikorova@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;
