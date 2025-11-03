/**
 * 📍 Ad Placement Configuration
 * 
 * This file defines all ad placement IDs for your application.
 * 
 * TO ACTIVATE ADS:
 * 1. Register at ezoic.com
 * 2. Get your Publisher ID and Placement IDs from Ezoic dashboard
 * 3. Replace the placeholder IDs below with real Ezoic placement IDs
 * 4. Add Ezoic script to index.html (instructions in comments there)
 * 5. Set EZOIC_ENABLED to true in AdBanner.tsx
 */

export const AD_PLACEMENTS = {
  // 🏠 Global placements (shown on all pages)
  FOOTER_BANNER: "ezoic-pub-ad-placeholder-101", // Small banner in footer
  
  // 🎯 Section-specific placements
  ESCAPE_ROOM: {
    BETWEEN_ROOMS: "ezoic-pub-ad-placeholder-201", // After completing a room
    END_GAME: "ezoic-pub-ad-placeholder-202", // After finishing all rooms
  },
  
  COFFEE_BUDDY: {
    LIST_NATIVE: "ezoic-pub-ad-placeholder-301", // In cafe list
    DETAIL_SIDEBAR: "ezoic-pub-ad-placeholder-302", // On cafe detail page
  },
  
  ASTROLOGY: {
    FORECAST_NATIVE: "ezoic-pub-ad-placeholder-401", // Between horoscope sections
  },
  
  CHARACTER_ARENA: {
    BATTLE_END: "ezoic-pub-ad-placeholder-501", // After battle ends
    LEADERBOARD_SIDEBAR: "ezoic-pub-ad-placeholder-502", // On leaderboard
  },
  
  NUTRITION: {
    RECIPE_LIST: "ezoic-pub-ad-placeholder-601", // In recipe feed
    RECIPE_DETAIL: "ezoic-pub-ad-placeholder-602", // On recipe page
  },
  
  MUSIC_PRODUCER: {
    AFTER_GENERATION: "ezoic-pub-ad-placeholder-701", // After song is generated
  },
  
  COLLECTIBLES: {
    MARKETPLACE_NATIVE: "ezoic-pub-ad-placeholder-801", // In marketplace
  },
  
  KIDS_QUIZ: {
    BETWEEN_QUIZZES: "ezoic-pub-ad-placeholder-901", // After quiz ends
  },
  
  MINIBIZ: {
    BUSINESS_LIST: "ezoic-pub-ad-placeholder-1001", // In business ideas list
  },
};

/**
 * 💰 Expected Revenue Estimates (after optimization)
 * 
 * Based on 5,000 active users/month:
 * - Footer banner: ~€50/month
 * - Section native ads: ~€30-40 each
 * - Rewarded video (if implemented): ~€100-150/month
 * 
 * Total estimated: €400-600/month with Ezoic + Media.net
 */
