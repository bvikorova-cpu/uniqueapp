
-- Clean all Brand Battle Arena test/mock data
-- Delete votes first (child records)
DELETE FROM brand_votes;

-- Delete daily vote tracking
DELETE FROM user_daily_votes;

-- Delete voting streaks
DELETE FROM voting_streaks;

-- Delete brand battle credits
DELETE FROM brand_battle_credits;

-- Delete all brand sponsors (parent records)
DELETE FROM brand_sponsors;
