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
};

export const getCategoryBlurb = (slug?: string | null): CategoryBlurb | undefined =>
  slug ? CATEGORY_BLURBS[slug] : undefined;
