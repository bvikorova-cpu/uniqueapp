import mythicBeasts from "@/assets/cards/mythic-beasts.jpg";
import celestialSpirits from "@/assets/cards/celestial-spirits.jpg";
import ancientLegends from "@/assets/cards/ancient-legends.jpg";
import cyberGuardians from "@/assets/cards/cyber-guardians.jpg";
import oceanDepths from "@/assets/cards/ocean-depths.jpg";
import wildKingdom from "@/assets/cards/wild-kingdom.jpg";
import elementalTitans from "@/assets/cards/elemental-titans.jpg";
import shadowOrder from "@/assets/cards/shadow-order.jpg";
import cosmicExplorers from "@/assets/cards/cosmic-explorers.jpg";
import enchantedForest from "@/assets/cards/enchanted-forest.jpg";
import duelStats from "@/assets/cards/duel-stats.jpg";
import personalityTypes from "@/assets/cards/personality-types.jpg";
import memeCulture from "@/assets/cards/meme-culture.jpg";
import dailyQuests from "@/assets/cards/daily-quests.jpg";
import lifehacks from "@/assets/cards/lifehacks.jpg";
import worldFacts from "@/assets/cards/world-facts.jpg";
import seasonalVault from "@/assets/cards/seasonal-vault.jpg";
import legendaryRacehorses from "@/assets/cards/legendary-racehorses.jpg";
import footballLegends from "@/assets/cards/football-legends.jpg";
import basketballLegends from "@/assets/cards/basketball-legends.jpg";
import hockeyLegends from "@/assets/cards/hockey-legends.jpg";
import tennisLegends from "@/assets/cards/tennis-legends.jpg";
import americanFootballLegends from "@/assets/cards/american-football-legends.jpg";
import baseballLegends from "@/assets/cards/baseball-legends.jpg";
import golfLegends from "@/assets/cards/golf-legends.jpg";
import beautyIcons from "@/assets/cards/beauty-icons.jpg";
import fashionCouture from "@/assets/cards/fashion-couture.jpg";
import royalPrincesses from "@/assets/cards/royal-princesses.jpg";
import storybookFolk from "@/assets/cards/storybook-folk.jpg";
import kidsDinoPals from "@/assets/cards/kids-dino-pals.jpg";
import kidsRescueHeroes from "@/assets/cards/kids-rescue-heroes.jpg";
import kidsPonySparkles from "@/assets/cards/kids-pony-sparkles.jpg";
import kidsJungleBabies from "@/assets/cards/kids-jungle-babies.jpg";
import kidsSpaceKiddos from "@/assets/cards/kids-space-kiddos.jpg";
import kidsSweetTreats from "@/assets/cards/kids-sweet-treats.jpg";
import kidsSeaBuddies from "@/assets/cards/kids-sea-buddies.jpg";
import kidsSuperKiddos from "@/assets/cards/kids-super-kiddos.jpg";
import kidsFarmFriends from "@/assets/cards/kids-farm-friends.jpg";
import kidsGardenBugs from "@/assets/cards/kids-garden-bugs.jpg";


/** Illustrated cover artwork per collectible-card category (replaces emoji icons). */
export const CATEGORY_COVERS: Record<string, string> = {
  "mythic-beasts": mythicBeasts,
  "celestial-spirits": celestialSpirits,
  "ancient-legends": ancientLegends,
  "cyber-guardians": cyberGuardians,
  "ocean-depths": oceanDepths,
  "wild-kingdom": wildKingdom,
  "elemental-titans": elementalTitans,
  "shadow-order": shadowOrder,
  "cosmic-explorers": cosmicExplorers,
  "enchanted-forest": enchantedForest,
  "duel-stats": duelStats,
  "personality-types": personalityTypes,
  "meme-culture": memeCulture,
  "daily-quests": dailyQuests,
  "lifehacks": lifehacks,
  "world-facts": worldFacts,
  "seasonal-vault": seasonalVault,
  "legendary-racehorses": legendaryRacehorses,
  "football-legends": footballLegends,
  "basketball-legends": basketballLegends,
  "hockey-legends": hockeyLegends,
  "tennis-legends": tennisLegends,
  "american-football-legends": americanFootballLegends,
  "baseball-legends": baseballLegends,
  "golf-legends": golfLegends,
  "beauty-icons": beautyIcons,
  "fashion-couture": fashionCouture,
  "royal-princesses": royalPrincesses,
  "storybook-folk": storybookFolk,
  "kids-dino-pals": kidsDinoPals,
  "kids-rescue-heroes": kidsRescueHeroes,
  "kids-pony-sparkles": kidsPonySparkles,
  "kids-jungle-babies": kidsJungleBabies,
  "kids-space-kiddos": kidsSpaceKiddos,
  "kids-sweet-treats": kidsSweetTreats,
  "kids-sea-buddies": kidsSeaBuddies,
  "kids-super-kiddos": kidsSuperKiddos,
  "kids-farm-friends": kidsFarmFriends,
  "kids-garden-bugs": kidsGardenBugs,
  
};

export const getCategoryCover = (slug?: string | null): string | undefined =>
  slug ? CATEGORY_COVERS[slug] : undefined;
