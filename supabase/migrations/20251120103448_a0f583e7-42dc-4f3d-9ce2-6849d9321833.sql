-- Make cat and dog free (0 credits)
UPDATE pet_types SET price = 0, is_premium = false WHERE species IN ('cat', 'dog');

-- Update other currently free pets to have credit costs
UPDATE pet_types SET price = 50, is_premium = false WHERE species = 'rabbit';
UPDATE pet_types SET price = 100, is_premium = false WHERE species IN ('butterfly', 'ladybug');
UPDATE pet_types SET price = 150, is_premium = false WHERE species IN ('gecko', 'quokka');
UPDATE pet_types SET price = 200, is_premium = false WHERE species IN ('sugar_glider', 'owl', 'penguin');
UPDATE pet_types SET price = 250, is_premium = false WHERE species IN ('sea_turtle', 'seahorse');