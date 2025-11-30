-- Insert 7 new mystery boxes with prices from 700 to 7500 credits
INSERT INTO mystery_boxes (name, description, icon, price, min_rarity_level, max_rarity_level, is_active) VALUES
('Elite Mystery Box', 'An elite box with excellent rarity odds. Contains rare to legendary items with improved drop rates.', '🏆', 700, 3, 5, true),
('Diamond Mystery Box', 'A sparkling diamond box with premium collectibles. High chance for epic and legendary items.', '💎', 1000, 3, 5, true),
('Royal Mystery Box', 'A royal collection of exclusive items. Guaranteed rare or better with boosted epic rates.', '👑', 1500, 3, 5, true),
('Celestial Mystery Box', 'Contains otherworldly collectibles from the cosmos. Very high legendary drop rate.', '🌟', 2500, 4, 5, true),
('Mythic Mystery Box', 'A mythical box with incredible treasures. Exceptional odds for legendary items.', '🔮', 4000, 4, 5, true),
('Supreme Mystery Box', 'The supreme collection of the rarest items. Near-guaranteed epic with high legendary chance.', '⚡', 5500, 4, 5, true),
('Ultimate Mystery Box', 'The ultimate mystery box experience. Maximum legendary drop rates and exclusive content.', '🌈', 7500, 5, 5, true);