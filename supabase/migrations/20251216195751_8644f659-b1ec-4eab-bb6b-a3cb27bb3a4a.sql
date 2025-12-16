-- Update cat and dog prices to 20 credits
UPDATE pet_types SET price = 20 WHERE species IN ('cat', 'dog');