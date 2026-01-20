-- Delete test data that was inserted
DELETE FROM public.transactions WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486';
DELETE FROM public.subscriptions WHERE user_id = '3c23b29d-c9e2-4495-8772-143464d08486';
DELETE FROM public.contact_messages WHERE email IN ('john.smith@example.com', 'emma.wilson@example.com', 'michael.b@example.com', 'sarah.j@example.com', 'david.lee@example.com');