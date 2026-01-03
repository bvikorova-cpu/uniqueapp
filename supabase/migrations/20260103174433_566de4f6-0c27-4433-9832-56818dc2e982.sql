-- Add purchase/subscription achievements for all platform sections
INSERT INTO achievements (code, name, description, icon, points) VALUES
-- AI Studio purchases
('ai_studio_first_purchase', 'AI Pioneer', 'Made your first AI Studio purchase', '🤖', 50),
('ai_studio_subscriber', 'AI Enthusiast', 'Subscribed to AI Studio premium', '✨', 100),
('ai_studio_power_user', 'AI Master', 'Made 10+ AI Studio purchases', '🧠', 200),

-- Coloring Pages purchases
('coloring_first_purchase', 'Color Starter', 'Made your first coloring page purchase', '🎨', 30),
('coloring_subscriber', 'Color Artist', 'Subscribed to coloring pages premium', '🖌️', 75),
('coloring_bulk_buyer', 'Color Collector', 'Purchased 20+ coloring credits', '🌈', 150),

-- Comedy/Entertainment purchases
('comedy_first_tip', 'Comedy Supporter', 'Sent your first tip to a comedian', '😂', 25),
('comedy_coins_buyer', 'Comedy Investor', 'Purchased comedy coins', '🪙', 50),
('comedy_super_fan', 'Comedy Super Fan', 'Spent 1000+ coins on comedy content', '🎭', 200),

-- Dating App purchases
('dating_first_purchase', 'Love Seeker', 'Made your first dating app purchase', '💕', 40),
('dating_subscriber', 'Romance Premium', 'Subscribed to dating premium', '💎', 100),
('dating_power_dater', 'Dating Pro', 'Made 5+ dating purchases', '💝', 150),

-- Astrology purchases
('astro_first_reading', 'Stargazer', 'Purchased your first astrology reading', '⭐', 35),
('astro_subscriber', 'Cosmic Soul', 'Subscribed to astrology premium', '🔮', 90),
('astro_devoted', 'Astrology Devotee', 'Made 10+ astrology purchases', '🌙', 175),

-- Fitness/Workout purchases
('fitness_first_plan', 'Fitness Starter', 'Purchased your first fitness plan', '💪', 45),
('fitness_subscriber', 'Fitness Warrior', 'Subscribed to fitness premium', '🏋️', 110),
('fitness_dedicated', 'Fitness Champion', 'Made 10+ fitness purchases', '🏆', 220),

-- Cooking/Recipe purchases
('cooking_first_recipe', 'Home Chef', 'Purchased your first recipe pack', '🍳', 30),
('cooking_subscriber', 'Master Chef', 'Subscribed to cooking premium', '👨‍🍳', 85),
('cooking_gourmet', 'Gourmet Expert', 'Made 15+ cooking purchases', '🍽️', 170),

-- Tattoo Design purchases
('tattoo_first_design', 'Ink Curious', 'Created your first tattoo design', '🖋️', 35),
('tattoo_subscriber', 'Ink Artist', 'Subscribed to tattoo design premium', '💉', 95),
('tattoo_enthusiast', 'Tattoo Master', 'Created 20+ tattoo designs', '🎨', 190),

-- Future Face/Age Progression purchases
('future_face_first', 'Time Traveler', 'Created your first age progression', '⏳', 40),
('future_face_subscriber', 'Future Seer', 'Subscribed to Future Face premium', '🔮', 100),
('future_face_explorer', 'Time Master', 'Created 10+ age progressions', '⌛', 180),

-- Antique Appraisal purchases
('antique_first_appraisal', 'Treasure Hunter', 'Got your first antique appraisal', '🏺', 45),
('antique_subscriber', 'Antique Expert', 'Subscribed to antique appraisal premium', '📜', 105),
('antique_collector', 'Master Appraiser', 'Got 15+ antique appraisals', '👑', 200),

-- Vision Analyzer purchases
('analyzer_first_scan', 'Vision Scout', 'Used Vision Analyzer for the first time', '👁️', 35),
('analyzer_subscriber', 'Vision Pro', 'Subscribed to Vision Analyzer premium', '🔍', 90),
('analyzer_expert', 'Vision Master', 'Made 20+ vision analyses', '🎯', 175),

-- AI Companions purchases
('companions_first_chat', 'Companion Seeker', 'Started your first AI companion chat', '🤗', 30),
('companions_subscriber', 'Companion Friend', 'Subscribed to AI Companions premium', '💬', 85),
('companions_devoted', 'Companion Master', 'Had 100+ companion conversations', '❤️', 200),

-- Bazaar/Marketplace purchases
('bazaar_first_purchase', 'Shopper', 'Made your first Bazaar purchase', '🛒', 25),
('bazaar_big_spender', 'Big Spender', 'Spent 500+ on Bazaar items', '💰', 150),
('bazaar_first_sale', 'Merchant', 'Made your first Bazaar sale', '🏪', 75),
('bazaar_top_seller', 'Top Seller', 'Made 20+ Bazaar sales', '🌟', 250),

-- Auction purchases
('auction_first_bid', 'First Bidder', 'Placed your first auction bid', '🔨', 30),
('auction_winner', 'Auction Winner', 'Won your first auction', '🏅', 100),
('auction_collector', 'Auction Collector', 'Won 10+ auctions', '🎖️', 250),

-- Home Decor purchases
('decor_first_design', 'Decor Starter', 'Created your first room design', '🏠', 35),
('decor_subscriber', 'Interior Designer', 'Subscribed to home decor premium', '🛋️', 95),
('decor_expert', 'Design Master', 'Created 15+ room designs', '🏡', 180),

-- Music/Song Generation purchases
('music_first_song', 'Music Maker', 'Generated your first AI song', '🎵', 40),
('music_subscriber', 'Music Producer', 'Subscribed to music generation premium', '🎧', 100),
('music_artist', 'Hit Maker', 'Generated 25+ songs', '🎤', 220),

-- Video Generation purchases
('video_first_creation', 'Video Creator', 'Created your first AI video', '🎬', 45),
('video_subscriber', 'Video Pro', 'Subscribed to video generation premium', '📽️', 110),
('video_director', 'Video Director', 'Created 20+ videos', '🎥', 230),

-- Fundraising purchases
('fundraising_first_donation', 'Generous Heart', 'Made your first donation', '💝', 50),
('fundraising_supporter', 'Regular Supporter', 'Made 5+ donations', '🙏', 120),
('fundraising_philanthropist', 'Philanthropist', 'Donated to 10+ campaigns', '🌍', 250),

-- Course/Education purchases
('course_first_purchase', 'Student', 'Enrolled in your first course', '📚', 40),
('course_learner', 'Active Learner', 'Completed 3+ courses', '🎓', 120),
('course_scholar', 'Scholar', 'Completed 10+ courses', '🏅', 250),

-- General Platform purchases
('first_platform_purchase', 'Platform Supporter', 'Made your first platform purchase', '⚡', 25),
('loyal_customer', 'Loyal Customer', 'Made purchases in 5+ different sections', '🌟', 200),
('platform_vip', 'Platform VIP', 'Made purchases in 10+ different sections', '👑', 500)
ON CONFLICT (code) DO NOTHING;