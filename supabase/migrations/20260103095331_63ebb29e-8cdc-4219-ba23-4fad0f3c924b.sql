-- Add more achievements to the achievements table
INSERT INTO achievements (code, name, description, icon, points) VALUES
('early_bird', 'Early Bird', 'Logged in before 6 AM', '🌅', 5),
('night_owl', 'Night Owl', 'Active after midnight', '🦉', 5),
('first_post', 'First Post', 'Published your first post', '📝', 10),
('trendsetter', 'Trendsetter', 'Your post got trending', '🔥', 15),
('conversation_starter', 'Conversation Starter', 'Started 10 conversations', '💬', 15),
('loyal_user', 'Loyal User', 'Active for 7 consecutive days', '🏆', 20),
('explorer', 'Explorer', 'Visited all app sections', '🧭', 20),
('gift_giver', 'Gift Giver', 'Sent your first gift', '🎁', 20),
('popular', 'Popular', 'Reached 50 followers', '⭐', 25),
('super_liker', 'Super Liker', 'Liked 100 posts', '❤️', 25),
('content_creator', 'Content Creator', 'Created 25 posts', '🎨', 30),
('best_friend', 'Best Friend', 'Added 10 friends', '👥', 30),
('video_star', 'Video Star', 'Watched 30 video ads', '📺', 35),
('feedback_hero', 'Feedback Hero', 'Submitted 5 feedback reports', '🦸', 40),
('challenge_winner', 'Challenge Winner', 'Won your first challenge', '🏅', 45),
('top_contributor', 'Top Contributor', 'In top 10 weekly leaderboard', '🥇', 50),
('collector', 'Collector', 'Earned 10 badges', '🎖️', 60),
('streak_master', 'Streak Master', 'Maintained 30-day streak', '🔥', 75),
('vip_member', 'VIP Member', 'Premium subscriber for 3 months', '💎', 100),
('legend', 'Legend', 'Accumulated 1000 total points', '👑', 150)
ON CONFLICT (code) DO NOTHING;