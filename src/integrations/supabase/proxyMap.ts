// Auto-generated proxy map. Routes legacy edge function names to universal routers.
// Used by the patched supabase.functions.invoke() in client.ts.
// DO NOT EDIT BY HAND - regenerate by running the proxy consolidation script.

export const AI_PROXY_MAP: Record<string, string> = {
  "activate-job-listing": "activate_job_listing",
  "add-teen-career-generation": "add_teen_career_generation",
  "ai-mentor-chat": "ai_mentor_chat",
  "ai-stock-content-generator": "ai_stock_content_generator",
  "analyze-crystal-energy": "analyze_crystal_energy",
  "analyze-emotion": "analyze_emotion",
  "analyze-message": "analyze_message",
  "analyze-profile": "analyze_profile",
  "analyze-restaurant-menu-ai": "analyze_restaurant_menu_ai",
  "analyze-resume-ai": "analyze_resume_ai",
  "analyze-thread": "analyze_thread",
  "antique-ar-room": "antique_ar_room",
  "antique-batch-appraisal": "antique_batch_appraisal",
  "antique-certificate": "antique_certificate",
  "antique-expert-consult": "antique_expert_consult",
  "antique-forgery-detection": "antique_forgery_detection",
  "antique-market-trends": "antique_market_trends",
  "antique-museum-display": "antique_museum_display",
  "antique-price-alert": "antique_price_alert",
  "antique-provenance": "antique_provenance",
  // "battle-characters": real edge function, not proxied
  "battle-pets": "battle_pets",
  "beauty-celebrity-match": "beauty_celebrity_match",
  "beauty-nail-art": "beauty_nail_art",
  "beauty-recommendations": "beauty_recommendations",
  "beauty-skin-analysis": "beauty_skin_analysis",
  "beauty-transformation": "beauty_transformation",
  "beauty-tutorial": "beauty_tutorial",
  "brain-duel-friend-match": "brain_duel_friend_match",
  "bulk-generate-panoramas": "bulk_generate_panoramas",
  "calculate-karmic-debt": "calculate_karmic_debt",
  "capsule-wardrobe": "capsule_wardrobe",
  "chat-with-chef": "chat_with_chef",
  "chat-with-offspring": "chat_with_offspring",
  "coupon-marketplace-access": "coupon_marketplace_access",
  "detect-phobia": "detect_phobia",
  "diagnose-plant": "diagnose_plant",
  "enhance-shadow-story": "enhance_shadow_story",
  "enroll-premium-course": "enroll_premium_course",
  "find-genetic-matches": "find_genetic_matches",
  "find-soul-matches": "find_soul_matches",
  "generate-age-progression": "generate_age_progression",
  "generate-ai-room-design": "generate_ai_room_design",
  "generate-castle-panorama": "generate_castle_panorama",
  "generate-certificate": "generate_certificate",
  "generate-collectible": "generate_collectible",
  "generate-course-content": "generate_course_content",
  "generate-escape-room-panorama": "generate_escape_room_panorama",
  "generate-fashion-design": "generate_fashion_design",
  "generate-music": "generate_music",
  "generate-paint-by-numbers": "generate_paint_by_numbers",
  "generate-paint-image": "generate_paint_image",
  "generate-phobia-cure": "generate_phobia_cure",
  "generate-recipe-from-ingredients": "generate_recipe_from_ingredients",
  "generate-sports-prediction": "generate_sports_prediction",
  "generate-story-video": "generate_story_video",
  "generate-tattoo": "generate_tattoo",
  "generate-teacher-coloring": "generate_teacher_coloring",
  "generate-video-ad": "generate_video_ad",
  "generate-video-thumbnail": "generate_video_thumbnail",
  "generate-virtual-tour": "generate_virtual_tour",
  "generate-weekly-meal-plan": "generate_weekly_meal_plan",
  "get-my-stock-purchases": "get_my_stock_purchases",
  "get-user-phobias": "get_user_phobias",
  "get-user-universes": "get_user_universes",
  "home-color-palette": "home_color_palette",
  "home-furniture-recommender": "home_furniture_recommender",
  "home-virtual-staging": "home_virtual_staging",
  "identify-antique": "identify_antique",
  "identify-plant": "identify_plant",
  "join-shadow-battle": "join_shadow_battle",
  // "kids-drawing-tutorial": real edge function, not proxied
  "kids-homework-helper": "kids_homework_helper",
  "kids-reading-companion": "kids_reading_companion",
  "kids-science-lab": "kids_science_lab",
  // "kids-story-creator": removed — frontend now calls kids-story-generate directly
  "legal-ai": "legal_ai",
  "mystery-box-ai": "mystery_box_ai",
  "notify-admin-auction-withdrawal": "notify_admin_auction_withdrawal",
  "open-mystery-box": "open_mystery_box",
  "outfit-recommender": "outfit_recommender",
  "pet-battle-strategy": "pet_battle_strategy",
  "pet-compatibility-checker": "pet_compatibility_checker",
  "pet-health-predictor": "pet_health_predictor",
  "pet-mood-analyzer": "pet_mood_analyzer",
  "pet-name-generator": "pet_name_generator",
  "pet-personality-coach": "pet_personality_coach",
  "pet-story-generator": "pet_story_generator",
  "pet-training-planner": "pet_training_planner",
  "photo-ai-upscaling": "photo_ai_upscaling",
  "photo-background-removal": "photo_background_removal",
  "photo-colorization-pro": "photo_colorization_pro",
  "photo-damage-detection": "photo_damage_detection",
  "photo-face-enhancement": "photo_face_enhancement",
  "process-auction-withdrawal": "process_auction_withdrawal",
  "process-sale-transaction": "process_sale_transaction",
  "process-withdrawal-request": "process_withdrawal_request",
  "request-instructor-withdrawal": "request_instructor_withdrawal",
  "restore-old-photo": "restore_old_photo",
  "scan-food-ai": "scan_food_ai",
  "send-dating-gift": "send_dating_gift",
  "start-stream": "start_stream",
  "stop-stream": "stop_stream",
  "submit-fashion-challenge": "submit_fashion_challenge",
  "teen-career-counselor": "teen_career_counselor",
  "trade-phobia": "trade_phobia",
  "translate-and-generate-audio": "translate_and_generate_audio",
  "virtual-tryon": "virtual_tryon",
  "vote-fashion-challenge": "vote_fashion_challenge",
};

export const CHECKOUT_PROXY_MAP: Record<string, { product: string; module: string }> = {
  "create-analyzer-credits-payment": { product: "analyzer_credits", module: "analyzer_credits" },
  "create-analyzer-subscription": { product: "analyzer_subscription", module: "analyzer_subscription" },
  "create-ar-preview-checkout": { product: "ar_preview", module: "ar_preview" },
  "create-astrology-checkout": { product: "astrology", module: "astrology" },
  // "create-bazaar-order-checkout": REAL edge function — do not proxy
  "create-best-friend-checkout": { product: "best_friend", module: "best_friend" },
  "create-brain-duel-payment": { product: "brain_duel", module: "brain_duel" },
  "create-campaign-donation": { product: "campaign_donation", module: "campaign_donation" },
  "create-character": { product: "character", module: "character" },
  "create-character-credits-payment": { product: "character_credits", module: "character_credits" },
  "create-companions-checkout": { product: "companions", module: "companions" },
  "create-confession-checkout": { product: "confession", module: "confession" },
  // "create-connect-login-link": handled directly by check-connect-status (action: "connect_login")
  "create-consultation-checkout": { product: "consultation", module: "consultation" },
  "create-coupon-checkout": { product: "coupon", module: "coupon" },
  "create-creator-subscription": { product: "creator", module: "creator" },
  "create-credits-payment": { product: "credits", module: "credits" },
  "create-decor-checkout": { product: "decor", module: "decor" },
  "create-digital-offspring": { product: "digital_offspring", module: "digital_offspring" },
  "create-dna-memory-checkout": { product: "dna_memory", module: "dna_memory" },
  "create-emotion-credits-payment": { product: "emotion_credits", module: "emotion_credits" },
  "create-emotion-market-checkout": { product: "emotion_market", module: "emotion_market" },
  "create-employer-subscription-checkout": { product: "employer_subscription", module: "employer_subscription" },
  "create-escape-room-checkout": { product: "escape_room", module: "escape_room" },
  "create-f1-checkout": { product: "f1", module: "f1" },
  "create-fashion-marketplace-payment": { product: "fashion_marketplace", module: "fashion_marketplace" },
  "create-future-face-checkout": { product: "future_face", module: "future_face" },
  "create-healthcare-subscription": { product: "healthcare", module: "healthcare" },
  "create-job-listing-payment": { product: "job_listing", module: "job_listing" },
  "create-kids-reading-checkout": { product: "kids_reading", module: "kids_reading" },
  "create-kids-story-subscription-checkout": { product: "kids_story_subscription", module: "kids_story_subscription" },
  "create-kids-subscription-checkout": { product: "kids_subscription", module: "kids_subscription" },
  "create-learning-payment": { product: "learning", module: "learning" },
  "create-lie-detector-payment": { product: "lie_detector", module: "lie_detector" },
  "create-marketplace-item-checkout": { product: "marketplace_item", module: "marketplace_item" },
  "create-multiverse-checkout": { product: "multiverse", module: "multiverse" },
  "create-pet-checkout": { product: "pet", module: "pet" },
  "create-photo-credits-payment": { product: "photo_credits", module: "photo_credits" },
  "create-property-listing-checkout": { product: "property_listing", module: "property_listing" },
  "create-psychology-checkout": { product: "psychology", module: "psychology" },
  "create-reincarnation-checkout": { product: "reincarnation", module: "reincarnation" },
  "create-science-checkout": { product: "science", module: "science" },
  // "create-shadow-battle": REAL edge function — do not proxy
  "create-shadow-subscription": { product: "shadow_subscription", module: "shadow_subscription" },
  "create-skill-swap-checkout": { product: "skill_swap", module: "skill_swap" },
  "create-sports-checkout": { product: "sports", module: "sports" },
  "create-subscription-checkout": { product: "subscription", module: "subscription" },
  "create-teen-career-payment": { product: "teen_career", module: "teen_career" },
  "create-universe": { product: "universe", module: "universe" },
  "create-video-ad-credits-payment": { product: "video_ad_credits", module: "video_ad_credits" },
  "create-vip-checkout": { product: "vip", module: "vip" },
  "create-wellness-checkout": { product: "wellness", module: "wellness" },
  "purchase-best-friend-messages": { product: "best_friend_messages", module: "best_friend_messages" },
  "purchase-content-pack": { product: "content_pack", module: "content_pack" },
  "purchase-premium-course": { product: "premium_course", module: "premium_course" },
  "purchase-psychology-messages": { product: "psychology_messages", module: "psychology_messages" },
  // "purchase-shadow-gift": REAL edge function — do not proxy
  "purchase-stock-content": { product: "stock_content", module: "stock_content" },
  "purchase-tip": { product: "tip", module: "tip" },
};

export const VERIFY_PROXY_MAP: Record<string, string> = {
  // "verify-bazaar-order-payment": REAL edge function — do not proxy
  "verify-brain-duel-payment": "brain-duel",
  "verify-coupon-payment": "coupon",
  "verify-donation": "donation",
  "verify-emotion-credits-payment": "emotion-credits",
  "verify-lead-boost-payment": "lead-boost",
  "verify-learning-payment": "learning",
  "verify-multiverse-payment": "multiverse",
  "verify-shadow-battle-payment": "shadow-battle",
  "verify-tip-purchase": "tip",
};

// Nutrition router consolidation: 9 nutrition-* functions merged into nutrition-router.
export const NUTRITION_ROUTER_MAP: Record<string, string> = {
  "nutrition-coach-chat": "coach_chat",
  "nutrition-allergy-scanner": "allergy_scanner",
  "nutrition-barcode-scanner": "barcode_scanner",
  "nutrition-body-predictor": "body_predictor",
  "nutrition-grocery-optimizer": "grocery_optimizer",
  "nutrition-hydration-coach": "hydration_coach",
  "nutrition-meal-challenge": "meal_challenge",
  "nutrition-supplement-advisor": "supplement_advisor",
  "nutrition-weekly-progress": "weekly_progress",
};

// Horse router consolidation: 6 horse-* functions merged into horse-router.
export const HORSE_ROUTER_MAP: Record<string, string> = {
  "horse-create": "create",
  "horse-train": "train",
  "horse-join-race": "join_race",
  "horse-purchase-equipment": "purchase_equipment",
  "horse-championship-enroll": "championship_enroll",
  "horse-claim-quest-reward": "claim_quest_reward",
};

// Video-ad router consolidation: 4 video-ad-* media functions merged into video-ad-tools.
export const VIDEO_AD_ROUTER_MAP: Record<string, string> = {
  "video-ad-scenes": "scenes",
  "video-ad-sfx": "sfx",
  "video-ad-tts": "tts",
  "video-ad-voice-clone": "voice_clone",
};

/**
 * Resolve a function name to a universal router + augmented body.
 * Returns null when the function name is not a proxy (call as-is).
 */
export function resolveProxy(
  functionName: string,
  body: Record<string, unknown> | undefined
): { target: string; body: Record<string, unknown> } | null {
  const b = body && typeof body === "object" ? { ...body } : {};

  // Battle aliases — route to the real `battle-characters` edge function so
  // legacy callers (`football-simulate-match`, `character-battle`) get the
  // same payout/RLS behavior without separate functions existing.
  if (functionName === "character-battle" || functionName === "football-simulate-match") {
    return {
      target: "battle-characters",
      body: { ...b, source: (b as any).source ?? functionName },
    };
  }

  if (functionName === "contact-live-chat") {
    return { target: "contact-ai-triage", body: { ...b, action: "live_chat" } };
  }

  if (functionName === "ai-auto-recharge") {
    return { target: "create-checkout", body: { ...b, product: "ai_auto_recharge" } };
  }

  // Kids subscription helpers — keep immediate (avoid timing race with
  // patchSupabaseFunctions, which loads after React render).
  if (functionName === "check-kids-subscription") {
    return { target: "check-subscription", body: { ...b, tier: "kids" } };
  }
  if (functionName === "kids-customer-portal") {
    return { target: "check-connect-status", body: { ...b, action: "customer_portal" } };
  }

  // Batch 9 consolidation — additional check-*-subscription tiers routed to
  // universal check-subscription. Frontend callers only read
  // { subscribed, product_id, subscription_end, tier } plus optional fields
  // that fall back to defaults, so the universal shape is compatible.
  if (functionName === "check-decor-subscription") {
    return { target: "check-subscription", body: { ...b, tier: "decor" } };
  }
  if (functionName === "check-masterchef-subscription") {
    return { target: "check-subscription", body: { ...b, tier: "masterchef" } };
  }
  if (functionName === "check-time-reversal-subscription") {
    return { target: "check-subscription", body: { ...b, tier: "time_reversal" } };
  }

  // Batch 9–10 — module-specific Stripe Billing Portal routed to universal
  // check-connect-status (action=customer_portal). Same session, default
  // return_url=/account; module aliases inject return_url to preserve the
  // original landing page (e.g. /megatalent).
  if (functionName === "decor-customer-portal") {
    return { target: "check-connect-status", body: { ...b, action: "customer_portal" } };
  }
  if (functionName === "customer-portal") {
    return { target: "check-connect-status", body: { ...b, action: "customer_portal" } };
  }
  if (functionName === "megatalent-customer-portal") {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
      target: "check-connect-status",
      body: {
        ...b,
        action: "customer_portal",
        return_url: (b as any).return_url ?? `${origin}/megatalent`,
      },
    };
  }
  if (functionName === "customer-portal-anonymous-date") {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return {
      target: "check-connect-status",
      body: {
        ...b,
        action: "customer_portal",
        return_url: (b as any).return_url ?? `${origin}/anonymous-date`,
      },
    };
  }

  // Nutrition router consolidation (9 functions -> 1).
  const nutrition = NUTRITION_ROUTER_MAP[functionName];
  if (nutrition) {
    return { target: "nutrition-router", body: { ...b, action: nutrition } };
  }

  // Horse router consolidation (6 functions -> 1).
  const horse = HORSE_ROUTER_MAP[functionName];
  if (horse) {
    return { target: "horse-router", body: { ...b, action: horse } };
  }

  // Video-ad router consolidation (4 media functions merged into video-ad-tools).
  const videoAd = VIDEO_AD_ROUTER_MAP[functionName];
  if (videoAd) {
    return { target: "video-ad-tools", body: { ...b, action: videoAd } };
  }

  const aiType = AI_PROXY_MAP[functionName];
  if (aiType) {
    return { target: "generate-gift-message", body: { ...b, type: (b as any).type ?? aiType } };
  }

  const chk = CHECKOUT_PROXY_MAP[functionName];
  if (chk) {
    return {
      target: "create-checkout",
      body: {
        ...b,
        product: (b as any).product ?? (b as any).module ?? chk.product,
        module: (b as any).module ?? chk.module,
      },
    };
  }

  const vrf = VERIFY_PROXY_MAP[functionName];
  if (vrf) {
    return { target: "verify-payment", body: { ...b, product_type: (b as any).product_type ?? vrf } };
  }

  return null;
}
