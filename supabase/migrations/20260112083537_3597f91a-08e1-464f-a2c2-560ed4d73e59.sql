-- Update the official founder post to English
UPDATE posts 
SET content = 'Welcome to Unique – a place where we celebrate the individuality of each and every one of us. Our goal is to connect the worlds of education, business, and entertainment into one meaningful ecosystem. I am proud to present a platform that rewards your activity and professional contribution. Let''s create the future together!

I would love to hear your first feedback via a voice comment below!'
WHERE user_id = (SELECT id FROM profiles WHERE full_name = 'Mgr. Beáta Vikorová, MBA, LL.M., MSc.' LIMIT 1)
AND content LIKE '%Vítajte v Unique%';