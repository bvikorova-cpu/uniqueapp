-- Add admin role for the owner
INSERT INTO public.user_roles (user_id, role)
VALUES ('3c23b29d-c9e2-4495-8772-143464d08486', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;