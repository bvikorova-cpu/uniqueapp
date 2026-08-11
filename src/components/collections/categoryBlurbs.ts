/**
 * English display copy for every collectible-card collection.
 * `title` overrides the DB name in the UI, `tagline` is a short hook and
 * `inside` explains what the 150 cards of that collection actually contain.
 */
export interface CategoryBlurb {
  title: string;
  tagline: string;
  inside: string;
}

export const CATEGORY_BLURBS: Record<string, CategoryBlurb> = {
  "mythic-beasts": {
    title: "Mythic Beasts",
    tagline: "Dragons, phoenixes and creatures of old myth",
    inside: "150 legendary monsters from world mythology, each with its own lore card and rarity.",
  },
  "celestial-spirits": {
    title: "Celestial Spirits",
    tagline: "Constellations and cosmic entities given form",
    inside: "150 star-born spirits: constellations, planets, moons and cosmic guardians.",
  },
  "ancient-legends": {
    title: "Ancient Legends",
    tagline: "Heroes and oracles of forgotten civilisations",
    inside: "150 warriors, seers and rulers drawn from ancient history and legend.",
  },
  "cyber-guardians": {
    title: "Cyber Guardians",
    tagline: "Neon protectors of the machine cities",
    inside: "150 futuristic androids, netrunners and AI sentinels in neon-lit artwork.",
  },
  "ocean-depths": {
    title: "Ocean Depths",
    tagline: "Bioluminescent guardians of the abyss",
    inside: "150 deep-sea creatures and abyssal spirits, from glowing jellies to leviathans.",
  },
  "wild-kingdom": {
    title: "Wild Kingdom",
    tagline: "Majestic animals of every wilderness",
    inside: "150 real animals from every continent, painted as heroic portrait cards.",
  },
  "elemental-titans": {
    title: "Elemental Titans",
    tagline: "Colossal beings of fire, ice, stone and storm",
    inside: "150 titans split across the four elements, each with escalating power tiers.",
  },
  "shadow-order": {
    title: "Shadow Order",
    tagline: "Silent assassins and keepers of hidden knowledge",
    inside: "150 rogues, spies and secret-keepers wrapped in shadow-styled artwork.",
  },
  "cosmic-explorers": {
    title: "Cosmic Explorers",
    tagline: "Pioneers charting impossible worlds",
    inside: "150 explorers, ships and alien landscapes from the far edges of space.",
  },
  "enchanted-forest": {
    title: "Enchanted Forest",
    tagline: "Fae, sprites and mushroom-lit woodland folk",
    inside: "150 forest spirits and fae creatures in soft, glowing storybook art.",
  },
  "duel-stats": {
    title: "Duel Stats",
    tagline: "Top-Trumps style battle cards",
    inside: "150 battle cards with Strength, Speed and Magic ratings you can compare head-to-head.",
  },
  "personality-types": {
    title: "Personality Archetypes",
    tagline: "Playful archetypes to pin on your profile",
    inside: "150 personality archetype cards — from The Dreamer to The Strategist — with traits and strengths.",
  },
  "meme-culture": {
    title: "Meme & Internet Culture",
    tagline: "Cards inspired by internet trends",
    inside: "150 humorous cards about online culture, refreshed as new trends blow up.",
  },
  "daily-quests": {
    title: "Daily Quests",
    tagline: "Tiny missions that nudge you to do one good thing",
    inside: "150 bite-sized daily challenges for kindness, focus, movement and creativity.",
  },
  lifehacks: {
    title: "Lifehacks & Tips",
    tagline: "Short practical tips you can use today",
    inside: "150 quick tips across productivity, cooking, money, health and AI tools.",
  },
  "world-facts": {
    title: "Curious Facts & Words",
    tagline: "Surprising facts and beautiful foreign words",
    inside: "150 cards mixing astonishing world facts with untranslatable foreign words and their meaning.",
  },
  "seasonal-vault": {
    title: "Seasonal Vault",
    tagline: "Limited-time series available only for a while",
    inside: "150 seasonal cards — Halloween, Christmas, Summer Camp and more — rotating in and out of the vault.",
  },
  "legendary-racehorses": {
    title: "Legendary Racehorses",
    tagline: "Champion thoroughbreds with speed, stamina and heart",
    inside: "150 racehorse battle cards rated for Speed, Stamina, Strength, Defense and Luck — compare them head-to-head.",
  },
  "football-legends": {
    title: "Football Legends",
    tagline: "Original football stars for the floodlights",
    inside: "150 invented football players — strikers, playmakers, keepers — rated for pace, shooting, passing, defending and stamina.",
  },
  "basketball-legends": {
    title: "Basketball Legends",
    tagline: "Hardwood icons built for the highlight reel",
    inside: "150 invented basketball players rated for scoring, speed, handles, defense and vertical leap.",
  },
  "hockey-legends": {
    title: "Ice Hockey Legends",
    tagline: "Rink warriors carved out of ice",
    inside: "150 invented hockey players rated for skating, shooting, checking, goaltending and grit.",
  },
  "tennis-legends": {
    title: "Tennis Legends",
    tagline: "Court masters with nerves of steel",
    inside: "150 invented tennis players rated for serve, forehand, backhand, movement and mental strength.",
  },
  "american-football-legends": {
    title: "American Football Legends",
    tagline: "Gridiron giants under night lights",
    inside: "150 invented gridiron players rated for power, speed, throwing, tackling and awareness.",
  },
  "baseball-legends": {
    title: "Baseball Legends",
    tagline: "Diamond heroes from sandlot to ninth inning",
    inside: "150 invented baseball players rated for batting, pitching, fielding, speed and power.",
  },
  "golf-legends": {
    title: "Golf Legends",
    tagline: "Fairway artists in the morning dew",
    inside: "150 invented golfers rated for driving, accuracy, short game, putting and composure.",
  },
  "beauty-icons": {
    title: "Beauty Icons",
    tagline: "Glamour muses of hair, makeup and jewellery artistry",
    inside: "150 invented beauty icons in editorial artwork — every card its own look, palette and styling.",
  },
  "fashion-couture": {
    title: "Fashion Couture",
    tagline: "Runway visionaries in impossible silhouettes",
    inside: "150 original couture characters: designers, models and stylists in one-of-a-kind outfits.",
  },
  "royal-princesses": {
    title: "Royal Princesses",
    tagline: "Princesses of imaginary kingdoms",
    inside: "150 invented princesses and royal-court figures, each with her own gown, crown and palace.",
  },
  "storybook-folk": {
    title: "Storybook Folk",
    tagline: "Sprites, cobblers, witches and talking beasts",
    inside: "150 original fairytale characters painted in warm storybook illustration style.",
  },

  // ── Kids Collectibles (ages 3–10, cartoon style) ──────────────────────
  "kids-dino-pals": {
    title: "Dino Pals",
    tagline: "Friendly baby dinosaurs with tiny roars",
    inside: "150 cheerful cartoon dinosaurs drawn in a soft, kid-friendly style.",
  },
  "kids-rescue-heroes": {
    title: "Rescue Heroes",
    tagline: "Fire trucks, diggers and rescue helpers",
    inside: "150 smiling cartoon vehicles — trucks, diggers, boats, trains and helicopters.",
  },
  "kids-pony-sparkles": {
    title: "Pony Sparkles",
    tagline: "Rainbow ponies and glitter unicorns",
    inside: "150 pastel ponies and unicorns with sparkly manes and kind hearts.",
  },
  "kids-jungle-babies": {
    title: "Jungle Babies",
    tagline: "Baby elephants, lion cubs and monkeys",
    inside: "150 cuddly baby jungle animals on gentle, sunny adventures.",
  },
  "kids-space-kiddos": {
    title: "Space Kiddos",
    tagline: "Little astronauts, rockets and friendly aliens",
    inside: "150 space friends: astronaut kids, rockets, planets and squishy aliens.",
  },
  "kids-sweet-treats": {
    title: "Sweet Treats",
    tagline: "Smiling cupcakes, cookies and ice creams",
    inside: "150 happy cartoon sweets with faces, drawn in pastel candy colours.",
  },
  "kids-sea-buddies": {
    title: "Sea Buddies",
    tagline: "Bubbly fish, turtles and octopus pals",
    inside: "150 underwater friends splashing through a bright cartoon ocean.",
  },
  "kids-super-kiddos": {
    title: "Super Kiddos",
    tagline: "Tiny caped heroes who help their friends",
    inside: "150 little superhero kids with chunky capes, masks and kind superpowers.",
  },
  "kids-farm-friends": {
    title: "Farm Friends",
    tagline: "Cows, ducklings and piglets on a sunny farm",
    inside: "150 happy farm animals in a cheerful meadow storybook style.",
  },
  "kids-garden-bugs": {
    title: "Garden Bugs",
    tagline: "Ladybirds, bees and snails in the flowers",
    inside: "150 friendly little bugs exploring a bright, flowery garden.",
  },
};


export const getCategoryBlurb = (slug?: string | null): CategoryBlurb | undefined =>
  slug ? CATEGORY_BLURBS[slug] : undefined;
