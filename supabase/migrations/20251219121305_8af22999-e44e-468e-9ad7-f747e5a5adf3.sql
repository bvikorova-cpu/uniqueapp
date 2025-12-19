-- Fix broken image URLs
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1476124369491-b79d94986f24?w=800&auto=format&fit=crop' WHERE title = 'Mushroom Risotto';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1573140401552-3fab0b24306a?w=800&auto=format&fit=crop' WHERE title = 'Garlic Bread';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop' WHERE title = 'Beef Sirloin in Cream Sauce';
UPDATE recipes SET image_url = 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&auto=format&fit=crop' WHERE title = 'Guacamole';