-- Translate remaining Slovak achievements to English

-- Badge Collector series
UPDATE achievements SET name = 'Badge Collector I', description = 'Collect 5 badges' WHERE code = 'badge_collector_1';
UPDATE achievements SET name = 'Badge Collector II', description = 'Collect 25 badges' WHERE code = 'badge_collector_2';
UPDATE achievements SET name = 'Badge Collector III', description = 'Collect 50 badges' WHERE code = 'badge_collector_3';
UPDATE achievements SET name = 'Badge Collector IV', description = 'Collect 100 badges' WHERE code = 'badge_collector_4';
UPDATE achievements SET name = 'Badge Collector V', description = 'Collect 250 badges' WHERE code = 'badge_collector_5';

-- Daily Login series
UPDATE achievements SET name = 'Daily Visitor I', description = 'Log in for 7 days' WHERE code = 'daily_login_1';
UPDATE achievements SET name = 'Daily Visitor II', description = 'Log in for 30 days' WHERE code = 'daily_login_2';
UPDATE achievements SET name = 'Daily Visitor III', description = 'Log in for 100 days' WHERE code = 'daily_login_3';
UPDATE achievements SET name = 'Daily Visitor IV', description = 'Log in for 365 days' WHERE code = 'daily_login_4';

-- Engaging series
UPDATE achievements SET name = 'Engager I', description = 'Get 10 replies' WHERE code = 'engaging_1';
UPDATE achievements SET name = 'Engager II', description = 'Get 50 replies' WHERE code = 'engaging_2';
UPDATE achievements SET name = 'Engager III', description = 'Get 100 replies' WHERE code = 'engaging_3';
UPDATE achievements SET name = 'Engager IV', description = 'Get 500 replies' WHERE code = 'engaging_4';
UPDATE achievements SET name = 'Engager V', description = 'Get 1000 replies' WHERE code = 'engaging_5';

-- Follower series
UPDATE achievements SET name = 'Follower I', description = 'Follow 10 people' WHERE code = 'follower_1';
UPDATE achievements SET name = 'Follower II', description = 'Follow 50 people' WHERE code = 'follower_2';
UPDATE achievements SET name = 'Follower III', description = 'Follow 100 people' WHERE code = 'follower_3';
UPDATE achievements SET name = 'Follower IV', description = 'Follow 500 people' WHERE code = 'follower_4';
UPDATE achievements SET name = 'Follower V', description = 'Follow 1000 people' WHERE code = 'follower_5';

-- Helper
UPDATE achievements SET name = 'Helper', description = 'Help 100 people' WHERE code = 'helper';

-- Milestone series
UPDATE achievements SET name = 'Milestone 100', description = 'Get 100 interactions' WHERE code = 'milestone_100';
UPDATE achievements SET name = 'Milestone 500', description = 'Get 500 interactions' WHERE code = 'milestone_500';
UPDATE achievements SET name = 'Milestone 1000', description = 'Get 1000 interactions' WHERE code = 'milestone_1000';
UPDATE achievements SET name = 'Milestone 5000', description = 'Get 5000 interactions' WHERE code = 'milestone_5000';
UPDATE achievements SET name = 'Milestone 10000', description = 'Get 10000 interactions' WHERE code = 'milestone_10000';

-- Night Poster series
UPDATE achievements SET name = 'Night Creator I', description = '10 posts after 11 PM' WHERE code = 'night_poster_1';
UPDATE achievements SET name = 'Night Creator II', description = '50 posts after 11 PM' WHERE code = 'night_poster_2';
UPDATE achievements SET name = 'Night Creator III', description = '100 posts after 11 PM' WHERE code = 'night_poster_3';

-- Pioneer
UPDATE achievements SET name = 'Pioneer', description = 'One of the first users' WHERE code = 'pioneer';

-- Reactor series
UPDATE achievements SET name = 'Reactor I', description = 'Give 50 reactions' WHERE code = 'reactor_1';
UPDATE achievements SET name = 'Reactor II', description = 'Give 200 reactions' WHERE code = 'reactor_2';
UPDATE achievements SET name = 'Reactor III', description = 'Give 500 reactions' WHERE code = 'reactor_3';
UPDATE achievements SET name = 'Reactor IV', description = 'Give 1000 reactions' WHERE code = 'reactor_4';
UPDATE achievements SET name = 'Reactor V', description = 'Give 5000 reactions' WHERE code = 'reactor_5';

-- Video Watcher series
UPDATE achievements SET name = 'Video Watcher I', description = 'Watch 10 video ads' WHERE code = 'video_watcher_1';
UPDATE achievements SET name = 'Video Watcher II', description = 'Watch 50 video ads' WHERE code = 'video_watcher_2';
UPDATE achievements SET name = 'Video Watcher III', description = 'Watch 100 video ads' WHERE code = 'video_watcher_3';
UPDATE achievements SET name = 'Video Watcher IV', description = 'Watch 500 video ads' WHERE code = 'video_watcher_4';
UPDATE achievements SET name = 'Video Watcher V', description = 'Watch 1000 video ads' WHERE code = 'video_watcher_5';

-- Viral series
UPDATE achievements SET name = 'Viral I', description = 'Post with 50+ likes' WHERE code = 'viral_1';
UPDATE achievements SET name = 'Viral II', description = 'Post with 100+ likes' WHERE code = 'viral_2';
UPDATE achievements SET name = 'Viral III', description = 'Post with 500+ likes' WHERE code = 'viral_3';
UPDATE achievements SET name = 'Viral IV', description = 'Post with 1000+ likes' WHERE code = 'viral_4';
UPDATE achievements SET name = 'Viral V', description = 'Post with 5000+ likes' WHERE code = 'viral_5';

-- Weekend Warrior series
UPDATE achievements SET name = 'Weekend Warrior I', description = '10 posts on weekends' WHERE code = 'weekend_warrior_1';
UPDATE achievements SET name = 'Weekend Warrior II', description = '50 posts on weekends' WHERE code = 'weekend_warrior_2';
UPDATE achievements SET name = 'Weekend Warrior III', description = '100 posts on weekends' WHERE code = 'weekend_warrior_3';