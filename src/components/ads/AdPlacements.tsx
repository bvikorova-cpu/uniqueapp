/**
 * Ad placement identifiers — used as section keys for Monetag rewarded ads
 * and analytics. AdSense was fully removed; these strings are now just
 * section labels, not real ad-unit slot IDs.
 */
export const AD_PLACEMENTS = {
  FOOTER_BANNER: "footer_banner",
  ESCAPE_ROOM: {
    BETWEEN_ROOMS: "escape_room_between",
    END_GAME: "escape_room_end",
  },
  COFFEE_BUDDY: {
    LIST_NATIVE: "coffee_buddy_list",
    DETAIL_SIDEBAR: "coffee_buddy_detail",
  },
  ASTROLOGY: {
    FORECAST_NATIVE: "astrology_forecast",
  },
  CHARACTER_ARENA: {
    BATTLE_END: "character_arena_end",
    LEADERBOARD_SIDEBAR: "character_arena_leaderboard",
  },
  NUTRITION: {
    RECIPE_LIST: "nutrition_recipe_list",
    RECIPE_DETAIL: "nutrition_recipe_detail",
  },
  MUSIC_PRODUCER: {
    AFTER_GENERATION: "music_producer_after",
  },
  COLLECTIBLES: {
    MARKETPLACE_NATIVE: "collectibles_marketplace",
  },
  KIDS_QUIZ: {
    BETWEEN_QUIZZES: "kids_quiz_between",
  },
  MINIBIZ: {
    BUSINESS_LIST: "minibiz_list",
  },
};
