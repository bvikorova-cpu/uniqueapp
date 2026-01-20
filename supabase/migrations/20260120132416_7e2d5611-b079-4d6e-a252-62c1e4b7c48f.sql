-- Insert test transactions with valid constraint values
INSERT INTO public.transactions (user_id, transaction_type, amount, commission_rate, commission_amount, status, item_type, seller_amount) VALUES
('3c23b29d-c9e2-4495-8772-143464d08486', 'subscription', 29.99, 0.10, 3.00, 'completed', 'subscription', 26.99),
('3c23b29d-c9e2-4495-8772-143464d08486', 'bazaar_sale', 150.00, 0.10, 15.00, 'completed', 'bazaar_sale', 135.00),
('3c23b29d-c9e2-4495-8772-143464d08486', 'auction_sale', 499.99, 0.15, 75.00, 'completed', 'auction_sale', 424.99),
('3c23b29d-c9e2-4495-8772-143464d08486', 'marketplace_sale', 85.00, 0.10, 8.50, 'pending', 'ai_credits', 76.50),
('3c23b29d-c9e2-4495-8772-143464d08486', 'featured_listing', 19.99, 0.00, 0.00, 'completed', 'featured_listing', 19.99);

-- Insert test subscriptions
INSERT INTO public.subscriptions (user_id, tier, price, started_at, expires_at, status) VALUES
('3c23b29d-c9e2-4495-8772-143464d08486', 'premium', 9.99, now() - interval '15 days', now() + interval '15 days', 'active'),
('3c23b29d-c9e2-4495-8772-143464d08486', 'business', 29.99, now() - interval '5 days', now() + interval '25 days', 'active'),
('3c23b29d-c9e2-4495-8772-143464d08486', 'basic', 4.99, now() - interval '45 days', now() - interval '15 days', 'expired');

-- Insert test contact messages
INSERT INTO public.contact_messages (name, email, subject, message, is_read, user_id) VALUES
('John Smith', 'john.smith@example.com', 'Payment Issue', 'I was charged twice for my subscription. Please help me resolve this issue. Transaction ID: TXN-123456', false, '3c23b29d-c9e2-4495-8772-143464d08486'),
('Emma Wilson', 'emma.wilson@example.com', 'Feature Request', 'I would love to see a dark mode option in the mobile app. Great platform otherwise!', false, NULL),
('Michael Brown', 'michael.b@example.com', 'Account Recovery', 'I forgot my password and the reset email is not arriving. My registered email is michael.b@example.com', true, NULL),
('Sarah Johnson', 'sarah.j@example.com', 'Bug Report', 'The upload button on the Antique Appraisal page does not work on Safari browser. iOS 17.2', false, NULL),
('David Lee', 'david.lee@example.com', 'Partnership Inquiry', 'We are an antique auction house and would like to explore partnership opportunities with your platform.', false, NULL);