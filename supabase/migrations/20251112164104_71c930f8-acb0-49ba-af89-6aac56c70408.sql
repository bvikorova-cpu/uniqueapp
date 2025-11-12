-- Enable realtime for friend achievements
ALTER TABLE brain_duel_friend_achievements REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE brain_duel_friend_achievements;

-- Enable realtime for friend challenges
ALTER TABLE brain_duel_friend_challenges REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE brain_duel_friend_challenges;