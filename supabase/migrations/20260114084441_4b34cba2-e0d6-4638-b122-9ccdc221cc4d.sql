-- Remove duplicate gifts and make all unique
-- Delete duplicates
DELETE FROM platform_gifts WHERE id = 'd0b16458-5e04-4c96-91ab-2e6014b1442f'; -- duplicate Heart €2
DELETE FROM platform_gifts WHERE id = '00000000-0000-0000-0000-000000000003'; -- duplicate Diamond €5
DELETE FROM platform_gifts WHERE id = '00000000-0000-0000-0000-000000000004'; -- duplicate Crown €10

-- Update remaining gifts to have nice price progression
UPDATE platform_gifts SET price = 0.50, category = 'appreciation' WHERE id = '00000000-0000-0000-0000-000000000001'; -- Rose
UPDATE platform_gifts SET price = 1.00, category = 'romantic' WHERE id = '00000000-0000-0000-0000-000000000002'; -- Heart
UPDATE platform_gifts SET price = 2.00, category = 'romantic' WHERE id = '9a1517e6-a71c-4958-860e-b9a316a16341'; -- Bouquet
UPDATE platform_gifts SET price = 3.00, category = 'appreciation' WHERE id = 'e1136d1b-3a10-4899-8876-b92a577c64ae'; -- Star
UPDATE platform_gifts SET price = 5.00, category = 'celebration' WHERE id = 'e1904c40-c257-47c8-aec8-0999baa608e7'; -- Cake
UPDATE platform_gifts SET price = 8.00, category = 'celebration' WHERE id = 'ef1e0b07-cef0-4544-bbf4-1d47ec1d403f'; -- Champagne
UPDATE platform_gifts SET price = 10.00, category = 'achievement' WHERE id = 'e077182d-da5d-4718-9276-45d9bb8f717d'; -- Trophy
UPDATE platform_gifts SET price = 15.00, category = 'luxury' WHERE id = 'be8afb30-9bd4-440b-9512-281c0f2cab73'; -- Diamond
UPDATE platform_gifts SET price = 25.00, category = 'luxury' WHERE id = 'e8c66264-3020-4abf-b1d4-acf47982548d'; -- Crown