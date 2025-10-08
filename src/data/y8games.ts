export interface Y8Game {
  id: string;
  title: string;
  slug: string;
  category: string;
  description: string;
  rating?: number;
}

export const gameCategories = {
  girls: "Pre dievčatá",
  action: "Akčné",
  puzzle: "Logické",
  sports: "Športové",
  adventure: "Dobrodružné",
  racing: "Závodné",
} as const;

export type GameCategory = keyof typeof gameCategories;

export const y8Games: Y8Game[] = [
  // Pre dievčatá
  { id: "barbee_summer_nails", title: "Barbee Summer Nails", slug: "barbee_summer_nails", category: "girls", description: "Letný dizajn nechtov", rating: 8.6 },
  { id: "3d_acrylic_nail", title: "3D Acrylic Nail", slug: "3d_acrylic_nail", category: "girls", description: "3D akrylové nechty", rating: 8.5 },
  { id: "fashion_nail_salon", title: "Fashion Nail Salon", slug: "fashion_nail_salon", category: "girls", description: "Módny nechtový salón", rating: 8.4 },
  { id: "barbie_dreamhouse_designer", title: "Barbie Dreamhouse Designer", slug: "barbie_dreamhouse_designer", category: "girls", description: "Dizajn Barbinho domu", rating: 8.7 },
  { id: "princess_makeover_salon", title: "Princess Makeover Salon", slug: "princess_makeover_salon", category: "girls", description: "Princezná v salóne", rating: 8.3 },
  { id: "fashion_designer_new_york", title: "Fashion Designer New York", slug: "fashion_designer_new_york", category: "girls", description: "Módny dizajnér v NY", rating: 8.5 },
  { id: "cute_cat_hospital", title: "Cute Cat Hospital", slug: "cute_cat_hospital", category: "girls", description: "Mačacia nemocnica", rating: 8.6 },
  { id: "wedding_dress_up", title: "Wedding Dress Up", slug: "wedding_dress_up", category: "girls", description: "Svadobné šaty", rating: 8.4 },
  { id: "hair_salon", title: "Hair Salon", slug: "hair_salon", category: "girls", description: "Kaderníctvo", rating: 8.3 },
  { id: "makeup_studio", title: "Makeup Studio", slug: "makeup_studio", category: "girls", description: "Makeup štúdio", rating: 8.5 },
  { id: "doll_house_decoration", title: "Doll House Decoration", slug: "doll_house_decoration", category: "girls", description: "Dekorácia domčeka", rating: 8.2 },
  { id: "baby_hazel_newborn", title: "Baby Hazel Newborn", slug: "baby_hazel_newborn", category: "girls", description: "Starostlivosť o bábätko", rating: 8.4 },
  { id: "ice_cream_maker", title: "Ice Cream Maker", slug: "ice_cream_maker", category: "girls", description: "Výroba zmrzliny", rating: 8.3 },
  { id: "cake_master", title: "Cake Master", slug: "cake_master", category: "girls", description: "Majster cukrár", rating: 8.5 },
  { id: "pet_spa", title: "Pet Spa", slug: "pet_spa", category: "girls", description: "Kúpele pre domáce zvieratá", rating: 8.4 },
  { id: "dress_designer", title: "Dress Designer", slug: "dress_designer", category: "girls", description: "Dizajnér šiat", rating: 8.6 },
  { id: "school_girls_battle", title: "School Girls Battle", slug: "school_girls_battle", category: "girls", description: "Školská móda", rating: 8.2 },
  { id: "unicorn_dress_up", title: "Unicorn Dress Up", slug: "unicorn_dress_up", category: "girls", description: "Obliekanie jednorožca", rating: 8.7 },
  { id: "mermaid_princess", title: "Mermaid Princess", slug: "mermaid_princess", category: "girls", description: "Morská panna princezná", rating: 8.5 },
  { id: "shopping_mall_girl", title: "Shopping Mall Girl", slug: "shopping_mall_girl", category: "girls", description: "Nákupy v obchodnom centre", rating: 8.3 },

  // Akčné
  { id: "gunblood", title: "Gunblood", slug: "gunblood", category: "action", description: "Western duel so zbraňami", rating: 8.1 },
  { id: "stick_war", title: "Stick War", slug: "stick_war", category: "action", description: "Strategická akčná hra", rating: 8.8 },
  { id: "superfighters", title: "SuperFighters", slug: "superfighters", category: "action", description: "Retro bojová hra", rating: 8.7 },
  { id: "earn_to_die", title: "Earn to Die", slug: "earn_to_die", category: "action", description: "Zombie survival racing", rating: 8.6 },
  { id: "territory_war", title: "Territory War", slug: "territory_war", category: "action", description: "Tactical turn-based battle", rating: 8.5 },
  { id: "decision", title: "Decision", slug: "decision", category: "action", description: "Zombie survival action", rating: 8.4 },
  { id: "intrusion_2", title: "Intrusion 2", slug: "intrusion_2", category: "action", description: "Platform action shooter", rating: 8.7 },
  { id: "tactical_assassin", title: "Tactical Assassin", slug: "tactical_assassin", category: "action", description: "Sniper missions", rating: 8.3 },
  { id: "bomb_it", title: "Bomb It", slug: "bomb_it", category: "action", description: "Bomberman style game", rating: 8.5 },
  { id: "stickman_hook", title: "Stickman Hook", slug: "stickman_hook", category: "action", description: "Swing through levels", rating: 8.4 },
  { id: "red_ball_4", title: "Red Ball 4", slug: "red_ball_4", category: "action", description: "Platform adventure", rating: 8.6 },
  { id: "bullet_force", title: "Bullet Force", slug: "bullet_force", category: "action", description: "Multiplayer FPS", rating: 8.7 },
  { id: "zombs_royale", title: "Zombs Royale", slug: "zombs_royale", category: "action", description: "Battle royale io game", rating: 8.5 },
  { id: "boxing_physics_2", title: "Boxing Physics 2", slug: "boxing_physics_2", category: "action", description: "Funny boxing game", rating: 8.2 },
  { id: "zombie_derby", title: "Zombie Derby", slug: "zombie_derby", category: "action", description: "Drive through zombies", rating: 8.4 },
  { id: "warfare_1917", title: "Warfare 1917", slug: "warfare_1917", category: "action", description: "WW1 strategy game", rating: 8.6 },
  { id: "madness_combat", title: "Madness Combat", slug: "madness_combat", category: "action", description: "Action fighting game", rating: 8.3 },
  { id: "shadow_fighter", title: "Shadow Fighter", slug: "shadow_fighter", category: "action", description: "Ninja fighting game", rating: 8.5 },
  { id: "stick_squad", title: "Stick Squad", slug: "stick_squad", category: "action", description: "Stickman shooter", rating: 8.4 },
  { id: "shellshock_live", title: "ShellShock Live", slug: "shellshock_live", category: "action", description: "Tank battle game", rating: 8.7 },

  // Logické
  { id: "cut_the_rope", title: "Cut the Rope", slug: "cut_the_rope", category: "puzzle", description: "Feed Om Nom candy", rating: 8.8 },
  { id: "fireboy_watergirl", title: "Fireboy and Watergirl", slug: "fireboy_watergirl", category: "puzzle", description: "Co-op puzzle platformer", rating: 9.0 },
  { id: "snail_bob", title: "Snail Bob", slug: "snail_bob", category: "puzzle", description: "Help snail reach home", rating: 8.6 },
  { id: "bloxorz", title: "Bloxorz", slug: "bloxorz", category: "puzzle", description: "Roll block into hole", rating: 8.7 },
  { id: "find_the_candy", title: "Find the Candy", slug: "find_the_candy", category: "puzzle", description: "Hidden object puzzle", rating: 8.4 },
  { id: "draw_climber", title: "Draw Climber", slug: "draw_climber", category: "puzzle", description: "Draw legs to climb", rating: 8.3 },
  { id: "parking_fury", title: "Parking Fury", slug: "parking_fury", category: "puzzle", description: "Park cars perfectly", rating: 8.5 },
  { id: "factory_balls", title: "Factory Balls", slug: "factory_balls", category: "puzzle", description: "Paint balls puzzle", rating: 8.6 },
  { id: "iq_ball", title: "IQ Ball", slug: "iq_ball", category: "puzzle", description: "Physics puzzle game", rating: 8.4 },
  { id: "civiballs", title: "Civiballs", slug: "civiballs", category: "puzzle", description: "Cut chains puzzle", rating: 8.5 },
  { id: "sugar_sugar", title: "Sugar Sugar", slug: "sugar_sugar", category: "puzzle", description: "Draw lines for sugar", rating: 8.7 },
  { id: "wheely", title: "Wheely", slug: "wheely", category: "puzzle", description: "Car puzzle adventure", rating: 8.6 },
  { id: "brain_test", title: "Brain Test", slug: "brain_test", category: "puzzle", description: "Tricky puzzles", rating: 8.8 },
  { id: "water_sort_puzzle", title: "Water Sort Puzzle", slug: "water_sort_puzzle", category: "puzzle", description: "Sort colored water", rating: 8.5 },
  { id: "escape_room", title: "Escape Room", slug: "escape_room", category: "puzzle", description: "Escape the room", rating: 8.4 },
  { id: "rotate_puzzle", title: "Rotate Puzzle", slug: "rotate_puzzle", category: "puzzle", description: "Rotate to solve", rating: 8.3 },
  { id: "jigsaw_deluxe", title: "Jigsaw Deluxe", slug: "jigsaw_deluxe", category: "puzzle", description: "Classic jigsaw", rating: 8.6 },
  { id: "maze_path", title: "Maze Path", slug: "maze_path", category: "puzzle", description: "Find the path", rating: 8.4 },
  { id: "link_line_puzzle", title: "Link Line Puzzle", slug: "link_line_puzzle", category: "puzzle", description: "Connect dots", rating: 8.5 },
  { id: "block_blast", title: "Block Blast", slug: "block_blast", category: "puzzle", description: "Tetris-style blocks", rating: 8.7 },

  // Športové
  { id: "basketball_legends", title: "Basketball Legends", slug: "basketball_legends", category: "sports", description: "1v1 basketball", rating: 8.9 },
  { id: "8_ball_pool", title: "8 Ball Pool", slug: "8_ball_pool", category: "sports", description: "Billiard game", rating: 8.7 },
  { id: "soccer_physics", title: "Soccer Physics", slug: "soccer_physics", category: "sports", description: "Funny soccer game", rating: 8.5 },
  { id: "penalty_shooters", title: "Penalty Shooters", slug: "penalty_shooters", category: "sports", description: "Football penalties", rating: 8.6 },
  { id: "sports_heads", title: "Sports Heads", slug: "sports_heads", category: "sports", description: "Big head soccer", rating: 8.4 },
  { id: "tennis_masters", title: "Tennis Masters", slug: "tennis_masters", category: "sports", description: "Tennis tournament", rating: 8.3 },
  { id: "bowling_king", title: "Bowling King", slug: "bowling_king", category: "sports", description: "Online bowling", rating: 8.5 },
  { id: "mini_golf", title: "Mini Golf", slug: "mini_golf", category: "sports", description: "Mini golf courses", rating: 8.4 },
  { id: "basketball_stars", title: "Basketball Stars", slug: "basketball_stars", category: "sports", description: "2 player basketball", rating: 8.8 },
  { id: "football_masters", title: "Football Masters", slug: "football_masters", category: "sports", description: "Euro football", rating: 8.6 },
  { id: "table_tennis", title: "Table Tennis", slug: "table_tennis", category: "sports", description: "Ping pong game", rating: 8.3 },
  { id: "skateboard_city", title: "Skateboard City", slug: "skateboard_city", category: "sports", description: "Skateboard tricks", rating: 8.5 },
  { id: "surfing_challenge", title: "Surfing Challenge", slug: "surfing_challenge", category: "sports", description: "Surf the waves", rating: 8.4 },
  { id: "volleyball_battle", title: "Volleyball Battle", slug: "volleyball_battle", category: "sports", description: "Beach volleyball", rating: 8.3 },
  { id: "golf_battle", title: "Golf Battle", slug: "golf_battle", category: "sports", description: "Multiplayer golf", rating: 8.6 },
  { id: "cricket_world_cup", title: "Cricket World Cup", slug: "cricket_world_cup", category: "sports", description: "Cricket tournament", rating: 8.4 },
  { id: "hockey_legends", title: "Hockey Legends", slug: "hockey_legends", category: "sports", description: "Ice hockey game", rating: 8.5 },
  { id: "boxing_fighter", title: "Boxing Fighter", slug: "boxing_fighter", category: "sports", description: "Boxing championship", rating: 8.3 },
  { id: "baseball_pro", title: "Baseball Pro", slug: "baseball_pro", category: "sports", description: "Home run derby", rating: 8.4 },
  { id: "ski_rush", title: "Ski Rush", slug: "ski_rush", category: "sports", description: "Downhill skiing", rating: 8.6 },

  // Dobrodružné
  { id: "fireboy_watergirl_forest", title: "Fireboy & Watergirl Forest", slug: "fireboy_watergirl_forest", category: "adventure", description: "Temple adventure", rating: 9.0 },
  { id: "adam_and_eve", title: "Adam and Eve", slug: "adam_and_eve", category: "adventure", description: "Point and click adventure", rating: 8.6 },
  { id: "vex_5", title: "Vex 5", slug: "vex_5", category: "adventure", description: "Platform adventure", rating: 8.7 },
  { id: "bad_ice_cream", title: "Bad Ice Cream", slug: "bad_ice_cream", category: "adventure", description: "Maze adventure", rating: 8.5 },
  { id: "money_movers", title: "Money Movers", slug: "money_movers", category: "adventure", description: "Prison escape", rating: 8.4 },
  { id: "bob_the_robber", title: "Bob the Robber", slug: "bob_the_robber", category: "adventure", description: "Stealth adventure", rating: 8.6 },
  { id: "riddle_school", title: "Riddle School", slug: "riddle_school", category: "adventure", description: "Point and click escape", rating: 8.3 },
  { id: "fancy_pants", title: "Fancy Pants", slug: "fancy_pants", category: "adventure", description: "Stickman adventure", rating: 8.7 },
  { id: "electric_man", title: "Electric Man", slug: "electric_man", category: "adventure", description: "Fighting adventure", rating: 8.5 },
  { id: "run_3", title: "Run 3", slug: "run_3", category: "adventure", description: "Space running", rating: 8.8 },
  { id: "raft_wars", title: "Raft Wars", slug: "raft_wars", category: "adventure", description: "Treasure defense", rating: 8.6 },
  { id: "duck_life", title: "Duck Life", slug: "duck_life", category: "adventure", description: "Train your duck", rating: 8.4 },
  { id: "jacksmith", title: "Jacksmith", slug: "jacksmith", category: "adventure", description: "Crafting adventure", rating: 8.7 },
  { id: "swords_souls", title: "Swords and Souls", slug: "swords_souls", category: "adventure", description: "RPG adventure", rating: 8.8 },
  { id: "learn_to_fly", title: "Learn to Fly", slug: "learn_to_fly", category: "adventure", description: "Penguin flying", rating: 8.5 },
  { id: "grow_rpg", title: "Grow RPG", slug: "grow_rpg", category: "adventure", description: "Growth RPG", rating: 8.6 },
  { id: "epic_battle_fantasy", title: "Epic Battle Fantasy", slug: "epic_battle_fantasy", category: "adventure", description: "RPG battles", rating: 8.7 },
  { id: "super_smash_flash", title: "Super Smash Flash", slug: "super_smash_flash", category: "adventure", description: "Fighting platform", rating: 8.9 },
  { id: "cactus_mccoy", title: "Cactus McCoy", slug: "cactus_mccoy", category: "adventure", description: "Western adventure", rating: 8.6 },
  { id: "age_of_war", title: "Age of War", slug: "age_of_war", category: "adventure", description: "Evolution strategy", rating: 8.5 },

  // Závodné
  { id: "moto_x3m", title: "Moto X3M", slug: "moto_x3m", category: "racing", description: "Bike racing stunts", rating: 8.8 },
  { id: "hill_climb_racing", title: "Hill Climb Racing", slug: "hill_climb_racing", category: "racing", description: "Uphill racing", rating: 8.7 },
  { id: "drift_boss", title: "Drift Boss", slug: "drift_boss", category: "racing", description: "Drifting challenge", rating: 8.5 },
  { id: "traffic_rider", title: "Traffic Rider", slug: "traffic_rider", category: "racing", description: "Motorcycle racing", rating: 8.6 },
  { id: "drag_racing", title: "Drag Racing", slug: "drag_racing", category: "racing", description: "Drag race cars", rating: 8.4 },
  { id: "rally_point", title: "Rally Point", slug: "rally_point", category: "racing", description: "Rally racing", rating: 8.5 },
  { id: "bus_simulator", title: "Bus Simulator", slug: "bus_simulator", category: "racing", description: "Drive buses", rating: 8.3 },
  { id: "offroad_monster", title: "Offroad Monster", slug: "offroad_monster", category: "racing", description: "Monster truck", rating: 8.6 },
  { id: "f1_racing", title: "F1 Racing", slug: "f1_racing", category: "racing", description: "Formula 1 racing", rating: 8.7 },
  { id: "bike_blast", title: "Bike Blast", slug: "bike_blast", category: "racing", description: "Bike racing", rating: 8.4 },
  { id: "car_rush", title: "Car Rush", slug: "car_rush", category: "racing", description: "Traffic racing", rating: 8.5 },
  { id: "kart_racing_pro", title: "Kart Racing Pro", slug: "kart_racing_pro", category: "racing", description: "Go-kart racing", rating: 8.6 },
  { id: "monster_truck_fury", title: "Monster Truck Fury", slug: "monster_truck_fury", category: "racing", description: "Monster truck racing", rating: 8.5 },
  { id: "bmx_master", title: "BMX Master", slug: "bmx_master", category: "racing", description: "BMX tricks", rating: 8.4 },
  { id: "city_car_driving", title: "City Car Driving", slug: "city_car_driving", category: "racing", description: "City racing", rating: 8.3 },
  { id: "turbo_drift", title: "Turbo Drift", slug: "turbo_drift", category: "racing", description: "Drift racing", rating: 8.7 },
  { id: "speed_highway", title: "Speed Highway", slug: "speed_highway", category: "racing", description: "Highway racing", rating: 8.5 },
  { id: "desert_race", title: "Desert Race", slug: "desert_race", category: "racing", description: "Desert racing", rating: 8.4 },
  { id: "snow_rally", title: "Snow Rally", slug: "snow_rally", category: "racing", description: "Snow racing", rating: 8.6 },
  { id: "street_racer", title: "Street Racer", slug: "street_racer", category: "racing", description: "Street racing", rating: 8.5 },
];

export function getGamesByCategory(category: GameCategory): Y8Game[] {
  return y8Games.filter(game => game.category === category);
}

export function getGameBySlug(slug: string): Y8Game | undefined {
  return y8Games.find(game => game.slug === slug);
}