-- Insert 50 new paid escape rooms with creative themes
INSERT INTO escape_rooms (creator_id, title, description, difficulty, theme, price, duration_minutes, max_players, room_type, is_published) VALUES
-- Sci-fi themed rooms (10)
('00000000-0000-0000-0000-000000000000', 'Alien Mothership Escape', 'Escape from an alien spaceship before experiments begin on the human crew.', 'expert', 'sci-fi', 16, 85, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Android Revolution', 'Prevent rogue AI from taking over the space colony in this futuristic thriller.', 'hard', 'sci-fi', 14, 80, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Quantum Laboratory', 'Fix the quantum computer before it creates a black hole that destroys Earth.', 'expert', 'sci-fi', 18, 95, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Starship Bridge Crisis', 'Take command of a damaged starship and navigate through an asteroid field.', 'medium', 'sci-fi', 11, 70, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Cryogenic Awakening', 'Wake from cryo-sleep on a damaged colony ship drifting through space.', 'hard', 'sci-fi', 13, 75, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Neural Network Hack', 'Infiltrate a mega-corp neural network to expose their dark secrets.', 'expert', 'sci-fi', 17, 90, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Terraforming Station', 'Survive a catastrophic failure on Mars terraforming station.', 'medium', 'sci-fi', 12, 65, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Deep Space Mining', 'Escape from a collapsing asteroid mining facility.', 'hard', 'sci-fi', 15, 80, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Virtual Reality Prison', 'Break out of a digital prison in cyberspace before deletion.', 'expert', 'sci-fi', 19, 100, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Robot Factory Lockdown', 'Escape a factory where robots have gained sentience and locked down all exits.', 'medium', 'sci-fi', 10, 60, 6, 'multiplayer', true),

-- Horror themed rooms (10)
('00000000-0000-0000-0000-000000000000', 'Cursed Carnival', 'Navigate through a haunted carnival where the attractions come alive at night.', 'hard', 'horror', 13, 75, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Abandoned Laboratory', 'Uncover the truth behind illegal human experiments in a secret facility.', 'expert', 'horror', 16, 85, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Witch Hunt 1692', 'Survive the Salem witch trials and prove your innocence before burning.', 'medium', 'horror', 11, 70, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Demonic Possession', 'Perform an exorcism in a haunted church before midnight.', 'expert', 'horror', 17, 90, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Serial Killer Basement', 'Escape from a serial killer''s lair before becoming the next victim.', 'hard', 'horror', 14, 80, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Ghost Ship', 'Investigate a derelict ship where the crew mysteriously disappeared.', 'medium', 'horror', 12, 65, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Plague Doctor Nightmare', 'Survive a medieval plague hospital filled with dark rituals.', 'hard', 'horror', 15, 85, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Doll Factory', 'Escape from a toy factory where possessed dolls hunt intruders.', 'medium', 'horror', 10, 60, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Underground Catacombs', 'Navigate ancient catacombs filled with vengeful spirits and traps.', 'expert', 'horror', 18, 95, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Slaughterhouse Secrets', 'Uncover dark secrets in an abandoned slaughterhouse at midnight.', 'hard', 'horror', 14, 80, 5, 'multiplayer', true),

-- Mystery themed rooms (10)
('00000000-0000-0000-0000-000000000000', 'Art Gallery Heist', 'Solve the mystery of stolen masterpieces in a high-security museum.', 'medium', 'mystery', 11, 70, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Cold Case Files', 'Reopen a 20-year-old unsolved murder case with new evidence.', 'hard', 'mystery', 13, 80, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Spy Academy Final Exam', 'Pass the ultimate spy test to join the secret intelligence agency.', 'expert', 'mystery', 17, 90, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Luxury Train Mystery', 'Solve a murder on the Orient Express before reaching the final station.', 'medium', 'mystery', 12, 75, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Secret Society Initiation', 'Infiltrate a secret society and uncover their hidden agenda.', 'hard', 'mystery', 15, 85, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Jewel Thief Challenge', 'Plan and execute the perfect diamond heist in Monaco.', 'expert', 'mystery', 19, 100, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'FBI Evidence Room', 'Find crucial evidence before it disappears forever.', 'medium', 'mystery', 10, 65, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Political Scandal', 'Expose corruption at the highest levels of government.', 'hard', 'mystery', 14, 80, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Casino Card Counting', 'Beat the casino using mathematics and observation skills.', 'medium', 'mystery', 11, 70, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Insurance Fraud Investigation', 'Uncover an elaborate insurance scam network.', 'hard', 'mystery', 13, 75, 5, 'multiplayer', true),

-- Fantasy themed rooms (10)
('00000000-0000-0000-0000-000000000000', 'Unicorn Sanctuary', 'Save the last unicorns from poachers in an enchanted forest.', 'easy', 'fantasy', 8, 55, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Dark Sorcerer Tower', 'Defeat a dark sorcerer and break his curse on the kingdom.', 'expert', 'fantasy', 18, 95, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Fairy Tale Castle', 'Break an ancient curse that traps fairy tale characters.', 'medium', 'fantasy', 11, 70, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Atlantis Rising', 'Discover the lost city of Atlantis and restore its power.', 'hard', 'fantasy', 15, 85, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Phoenix Rebirth', 'Help a dying phoenix gather elements for rebirth.', 'medium', 'fantasy', 12, 65, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Goblin Market', 'Navigate a dangerous goblin marketplace to retrieve a stolen artifact.', 'hard', 'fantasy', 14, 80, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Mermaid Kingdom', 'Solve underwater puzzles to save the mermaid kingdom.', 'easy', 'fantasy', 7, 50, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Centaur Prophecy', 'Fulfill an ancient centaur prophecy to prevent war.', 'hard', 'fantasy', 13, 75, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Crystal Caverns', 'Mine rare magical crystals while avoiding cave guardians.', 'medium', 'fantasy', 10, 60, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Vampire Council', 'Negotiate peace between vampire clans before sunrise.', 'expert', 'fantasy', 17, 90, 4, 'multiplayer', true),

-- Adventure themed rooms (10)
('00000000-0000-0000-0000-000000000000', 'Amazon Jungle Expedition', 'Discover a lost tribe and their ancient secrets deep in the Amazon.', 'medium', 'adventure', 11, 70, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Sahara Desert Survival', 'Find an oasis and ancient treasure before the sandstorm hits.', 'hard', 'adventure', 14, 80, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Mount Everest Climb', 'Reach the summit and rescue stranded climbers.', 'expert', 'adventure', 18, 95, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Great Barrier Reef', 'Dive deep to discover sunken treasure and marine mysteries.', 'easy', 'adventure', 8, 55, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Wild West Shootout', 'Survive a showdown in a lawless frontier town.', 'medium', 'adventure', 12, 65, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Volcano Island', 'Escape from an active volcano island before eruption.', 'hard', 'adventure', 15, 85, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Polar Ice Expedition', 'Survive in Antarctic research station during white-out.', 'hard', 'adventure', 13, 75, 5, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'African Safari', 'Track poachers and save endangered species.', 'medium', 'adventure', 10, 60, 6, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Himalayan Temple', 'Find the secret Himalayan temple of enlightenment.', 'expert', 'adventure', 16, 90, 4, 'multiplayer', true),
('00000000-0000-0000-0000-000000000000', 'Rainforest Canopy', 'Navigate the treetops to find rare medicinal plants.', 'easy', 'adventure', 9, 55, 6, 'multiplayer', true);