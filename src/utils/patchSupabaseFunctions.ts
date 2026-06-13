/**
 * Global monkey-patch for supabase.functions.invoke
 *
 * Two responsibilities:
 * 1. ALIAS MAP — transparently re-routes legacy/missing function names to
 *    consolidated universal routers (so frontend components don't need to be
 *    modified after backend consolidation).
 * 2. ERROR HANDLING — translates "non-2xx" errors into user-friendly messages.
 *
 * Backed by 5 universal routers:
 *   - check-subscription          (all check-*-subscription)
 *   - check-connect-status        (all customer portals + connect-login)
 *   - create-checkout             (all create-*-checkout / *-payment)
 *   - universal-vision-analyzer   (all analyze-* / identify-* / *-ai)
 *   - generate-gift-message       (all generate-* / *-coach / *-creator text)
 *
 * Import this ONCE at app startup (main.tsx) before any component renders.
 */
import { supabase } from "@/integrations/supabase/client";

type AliasEntry =
  | { target: string; action?: string; bodyExtras?: Record<string, unknown> };

/**
 * Maps legacy function name → routing instructions.
 * When a component invokes a legacy name we transparently rewrite the call.
 */
const FUNCTION_ALIASES: Record<string, AliasEntry> = {
  // ─────────────────────────────────────────────────────────────────────
  // STRIPE CONNECT & CUSTOMER PORTALS → check-connect-status
  // ─────────────────────────────────────────────────────────────────────
  "create-connect-login-link":          { target: "check-connect-status", action: "connect_login" },
  "best-friend-customer-portal":        { target: "check-connect-status", action: "customer_portal" },
  "companions-customer-portal":         { target: "check-connect-status", action: "customer_portal" },
  "employer-customer-portal":           { target: "check-connect-status", action: "customer_portal" },
  "f1-customer-portal":                 { target: "check-connect-status", action: "customer_portal" },
  "healthcare-customer-portal":         { target: "check-connect-status", action: "customer_portal" },
  "kids-customer-portal":               { target: "check-connect-status", action: "customer_portal" },
  "kids-story-customer-portal":         { target: "check-connect-status", action: "customer_portal" },
  "psychology-customer-portal":         { target: "check-connect-status", action: "customer_portal" },
  "customer-portal-creator":            { target: "check-connect-status", action: "customer_portal" },

  // ─────────────────────────────────────────────────────────────────────
  // SUBSCRIPTION CHECKS → check-subscription (with tier param)
  // ─────────────────────────────────────────────────────────────────────
  "check-best-friend-subscription":     { target: "check-subscription", bodyExtras: { tier: "best_friend" } },
  "check-companions-subscription":      { target: "check-subscription", bodyExtras: { tier: "companions" } },
  "check-creator-subscription":         { target: "check-subscription", bodyExtras: { tier: "creator" } },
  "check-f1-subscription":              { target: "check-subscription", bodyExtras: { tier: "f1" } },
  "check-future-face-subscription":     { target: "check-subscription", bodyExtras: { tier: "future_face" } },
  "check-healthcare-subscription":      { target: "check-subscription", bodyExtras: { tier: "healthcare" } },
  "check-holographic-access":           { target: "check-subscription", bodyExtras: { tier: "holographic" } },
  "check-kids-reading-subscription":    { target: "check-subscription", bodyExtras: { tier: "kids_reading" } },
  "check-kids-story-subscription":      { target: "check-subscription", bodyExtras: { tier: "kids_story" } },
  "check-kids-subscription":            { target: "check-subscription", bodyExtras: { tier: "kids" } },
  "check-pet-subscription":             { target: "check-subscription", bodyExtras: { tier: "pet" } },
  "check-psychology-subscription":      { target: "check-subscription", bodyExtras: { tier: "psychology" } },
  "check-science-subscription":         { target: "check-subscription", bodyExtras: { tier: "science" } },
  "check-shadow-subscription":          { target: "check-subscription", bodyExtras: { tier: "shadow" } },
  "check-skill-swap-subscription":      { target: "check-subscription", bodyExtras: { tier: "skill_swap" } },
  "check-sports-subscription":          { target: "check-subscription", bodyExtras: { tier: "sports" } },
  "check-vip-subscription":             { target: "check-subscription", bodyExtras: { tier: "vip" } },
  "check-wellness-subscription":        { target: "check-subscription", bodyExtras: { tier: "wellness" } },
  "check-time-capsule-access":          { target: "check-subscription", bodyExtras: { tier: "time_capsule" } },
  "check-teen-career-usage":            { target: "check-subscription", bodyExtras: { tier: "teen_career" } },
  "check-employer-subscription":        { target: "check-subscription", bodyExtras: { tier: "employer" } },

  // ─────────────────────────────────────────────────────────────────────
  // CHECKOUT / PAYMENT → create-checkout (with product param)
  // ─────────────────────────────────────────────────────────────────────
  "create-analyzer-credits-payment":         { target: "create-checkout", bodyExtras: { product: "analyzer_credits" } },
  "create-analyzer-subscription":            { target: "create-checkout", bodyExtras: { product: "analyzer_subscription" } },
  "create-ar-preview-checkout":              { target: "create-checkout", bodyExtras: { product: "ar_preview" } },
  "create-astrology-checkout":               { target: "create-checkout", bodyExtras: { product: "astrology" } },
  
  "create-best-friend-checkout":             { target: "create-checkout", bodyExtras: { product: "best_friend" } },
  "create-brain-duel-payment":               { target: "create-checkout", bodyExtras: { product: "brain_duel" } },
  "create-campaign-donation":                { target: "create-checkout", bodyExtras: { product: "campaign_donation" } },
  "create-character-credits-payment":        { target: "create-checkout", bodyExtras: { product: "character_credits" } },
  "create-companions-checkout":              { target: "create-checkout", bodyExtras: { product: "companions" } },
  "create-confession-checkout":              { target: "create-checkout", bodyExtras: { product: "confession" } },
  "create-consultation-checkout":            { target: "create-checkout", bodyExtras: { product: "consultation" } },
  "create-coupon-checkout":                  { target: "create-checkout", bodyExtras: { product: "coupon" } },
  "create-creator-subscription":             { target: "create-checkout", bodyExtras: { product: "creator_subscription" } },
  "create-credits-payment":                  { target: "create-checkout", bodyExtras: { product: "credits" } },
  "create-decor-checkout":                   { target: "create-checkout", bodyExtras: { product: "decor" } },
  "create-dna-memory-checkout":              { target: "create-checkout", bodyExtras: { product: "dna_memory" } },
  "create-emotion-credits-payment":          { target: "create-checkout", bodyExtras: { product: "emotion_credits" } },
  "create-emotion-market-checkout":          { target: "create-checkout", bodyExtras: { product: "emotion_market" } },
  "create-employer-subscription-checkout":   { target: "create-checkout", bodyExtras: { product: "employer_subscription" } },
  "create-escape-room-checkout":             { target: "create-checkout", bodyExtras: { product: "escape_room" } },
  "create-f1-checkout":                      { target: "create-checkout", bodyExtras: { product: "f1" } },
  "create-fashion-marketplace-payment":      { target: "create-checkout", bodyExtras: { product: "fashion_marketplace" } },
  "create-future-face-checkout":             { target: "create-checkout", bodyExtras: { product: "future_face" } },
  "create-healthcare-subscription":          { target: "create-checkout", bodyExtras: { product: "healthcare_subscription" } },
  "create-healthcare-checkout":              { target: "create-checkout", bodyExtras: { product: "healthcare" } },
  "create-nutrition-checkout":               { target: "create-checkout", bodyExtras: { product: "nutrition" } },
  "create-job-listing-payment":              { target: "create-checkout", bodyExtras: { product: "job_listing" } },
  "create-kids-reading-checkout":            { target: "create-checkout", bodyExtras: { product: "kids_reading" } },
  "create-kids-story-subscription-checkout": { target: "create-checkout", bodyExtras: { product: "kids_story_subscription" } },
  "create-kids-subscription-checkout":       { target: "create-checkout", bodyExtras: { product: "kids_subscription" } },
  "create-learning-payment":                 { target: "create-checkout", bodyExtras: { product: "learning" } },
  "create-lie-detector-payment":             { target: "create-checkout", bodyExtras: { product: "lie_detector" } },
  "create-marketplace-item-checkout":        { target: "create-checkout", bodyExtras: { product: "marketplace_item" } },
  "create-multiverse-checkout":              { target: "create-checkout", bodyExtras: { product: "multiverse" } },
  "create-pet-checkout":                     { target: "create-checkout", bodyExtras: { product: "pet" } },
  "create-photo-credits-payment":            { target: "create-checkout", bodyExtras: { product: "photo_credits" } },
  "create-property-listing-checkout":        { target: "create-checkout", bodyExtras: { product: "property_listing" } },
  "create-lead-boost-payment":               { target: "create-checkout", bodyExtras: { product: "lead_boost" } },
  "create-virtual-tour-payment":             { target: "create-checkout", bodyExtras: { product: "virtual_tour" } },
  "create-psychology-checkout":              { target: "create-checkout", bodyExtras: { product: "psychology" } },
  "create-reincarnation-checkout":           { target: "create-checkout", bodyExtras: { product: "reincarnation" } },
  "create-science-checkout":                 { target: "create-checkout", bodyExtras: { product: "science" } },
  "create-shadow-subscription":              { target: "create-checkout", bodyExtras: { product: "shadow_subscription" } },
  "create-skill-swap-checkout":              { target: "create-checkout", bodyExtras: { product: "skill_swap" } },
  "create-sports-checkout":                  { target: "create-checkout", bodyExtras: { product: "sports" } },
  "create-subscription-checkout":            { target: "create-checkout", bodyExtras: { product: "subscription" } },
  "create-teen-career-payment":              { target: "create-checkout", bodyExtras: { product: "teen_career" } },
  "create-video-ad-credits-payment":         { target: "create-checkout", bodyExtras: { product: "video_ad_credits" } },
  "create-vip-checkout":                     { target: "create-checkout", bodyExtras: { product: "vip" } },
  "create-wellness-checkout":                { target: "create-checkout", bodyExtras: { product: "wellness" } },

  // ─────────────────────────────────────────────────────────────────────
  // PAYMENT VERIFICATION → create-checkout (action=verify)
  // ─────────────────────────────────────────────────────────────────────
  "verify-brain-duel-payment":          { target: "create-checkout", action: "verify", bodyExtras: { product: "brain_duel" } },
  "verify-coupon-payment":              { target: "create-checkout", action: "verify", bodyExtras: { product: "coupon" } },
  "verify-donation":                    { target: "create-checkout", action: "verify", bodyExtras: { product: "donation" } },
  "verify-emotion-credits-payment":     { target: "create-checkout", action: "verify", bodyExtras: { product: "emotion_credits" } },
  "verify-gift-payment":                { target: "create-checkout", action: "verify", bodyExtras: { product: "gift" } },
  "verify-lead-boost-payment":          { target: "create-checkout", action: "verify", bodyExtras: { product: "lead_boost" } },
  "verify-learning-payment":            { target: "create-checkout", action: "verify", bodyExtras: { product: "learning" } },
  "verify-multiverse-payment":          { target: "create-checkout", action: "verify", bodyExtras: { product: "multiverse" } },
  "verify-shadow-battle-payment":       { target: "create-checkout", action: "verify", bodyExtras: { product: "shadow_battle" } },
  "verify-tip-purchase":                { target: "create-checkout", action: "verify", bodyExtras: { product: "tip" } },

  // ─────────────────────────────────────────────────────────────────────
  // VISION / IMAGE ANALYSIS → universal-vision-analyzer (with task param)
  // ─────────────────────────────────────────────────────────────────────
  "analyze-crystal-energy":             { target: "universal-vision-analyzer", bodyExtras: { task: "crystal_energy" } },
  "analyze-emotion":                    { target: "universal-vision-analyzer", bodyExtras: { task: "emotion" } },
  "analyze-message":                    { target: "universal-vision-analyzer", bodyExtras: { task: "message" } },
  "analyze-profile":                    { target: "universal-vision-analyzer", bodyExtras: { task: "profile" } },
  "analyze-restaurant-menu-ai":         { target: "universal-vision-analyzer", bodyExtras: { task: "restaurant_menu" } },
  "analyze-resume-ai":                  { target: "universal-vision-analyzer", bodyExtras: { task: "resume" } },
  "analyze-thread":                     { target: "universal-vision-analyzer", bodyExtras: { task: "thread" } },
  "identify-antique":                   { target: "universal-vision-analyzer", bodyExtras: { task: "antique_identify" } },
  "identify-plant":                     { target: "universal-vision-analyzer", bodyExtras: { task: "plant_identify" } },
  "diagnose-plant":                     { target: "universal-vision-analyzer", bodyExtras: { task: "plant_diagnose" } },
  "detect-phobia":                      { target: "universal-vision-analyzer", bodyExtras: { task: "phobia_detect" } },
  "scan-food-ai":                       { target: "universal-vision-analyzer", bodyExtras: { task: "food_scan" } },
  "beauty-skin-analysis":               { target: "universal-vision-analyzer", bodyExtras: { task: "beauty_skin" } },
  "antique-forgery-detection":          { target: "universal-vision-analyzer", bodyExtras: { task: "antique_forgery" } },
  "antique-batch-appraisal":            { target: "universal-vision-analyzer", bodyExtras: { task: "antique_batch" } },
  "antique-provenance":                 { target: "universal-vision-analyzer", bodyExtras: { task: "antique_provenance" } },
  "antique-market-trends":              { target: "universal-vision-analyzer", bodyExtras: { task: "antique_market" } },
  "antique-price-alert":                { target: "universal-vision-analyzer", bodyExtras: { task: "antique_price_alert" } },
  "antique-certificate":                { target: "universal-vision-analyzer", bodyExtras: { task: "antique_certificate" } },
  "antique-museum-display":             { target: "universal-vision-analyzer", bodyExtras: { task: "antique_museum" } },
  "antique-expert-consult":             { target: "universal-vision-analyzer", bodyExtras: { task: "antique_consult" } },
  "antique-ar-room":                    { target: "universal-vision-analyzer", bodyExtras: { task: "antique_ar" } },
  "photo-damage-detection":             { target: "universal-vision-analyzer", bodyExtras: { task: "photo_damage" } },

  // ─────────────────────────────────────────────────────────────────────
  // PHOTO PROCESSING → remove-background (REAL image edit via OpenAI gpt-image-1)
  // Returns actual processed image URLs under all legacy aliases.
  // ─────────────────────────────────────────────────────────────────────
  "photo-ai-upscaling":                 { target: "remove-background", bodyExtras: { operation: "upscale" } },
  "photo-background-removal":           { target: "remove-background", bodyExtras: { operation: "bg-remove" } },
  "photo-colorization-pro":             { target: "remove-background", bodyExtras: { operation: "colorize-pro" } },
  "photo-face-enhancement":             { target: "remove-background", bodyExtras: { operation: "face-enhance" } },
  "restore-old-photo":                  { target: "remove-background", bodyExtras: {} }, // operation taken from body.restorationType
  "virtual-tryon":                      { target: "universal-vision-analyzer", bodyExtras: { task: "virtual_tryon" } },
  "beauty-transformation":              { target: "universal-vision-analyzer", bodyExtras: { task: "beauty_transform" } },
  "beauty-celebrity-match":             { target: "universal-vision-analyzer", bodyExtras: { task: "beauty_celebrity" } },
  "beauty-nail-art":                    { target: "universal-vision-analyzer", bodyExtras: { task: "beauty_nail_art" } },
  "home-virtual-staging":               { target: "universal-vision-analyzer", bodyExtras: { task: "home_staging" } },
  "home-color-palette":                 { target: "universal-vision-analyzer", bodyExtras: { task: "home_palette" } },
  "home-furniture-recommender":         { target: "universal-vision-analyzer", bodyExtras: { task: "home_furniture" } },
  "outfit-recommender":                 { target: "universal-vision-analyzer", bodyExtras: { task: "outfit_recommend" } },
  "capsule-wardrobe":                   { target: "universal-vision-analyzer", bodyExtras: { task: "capsule_wardrobe" } },
  "beauty-recommendations":             { target: "universal-vision-analyzer", bodyExtras: { task: "beauty_recommend" } },
  "beauty-tutorial":                    { target: "universal-vision-analyzer", bodyExtras: { task: "beauty_tutorial" } },

  // ─────────────────────────────────────────────────────────────────────
  // TEXT / AI GENERATION → generate-gift-message (with type param)
  // ─────────────────────────────────────────────────────────────────────
  "ai-mentor-chat":                     { target: "generate-gift-message", bodyExtras: { type: "mentor_chat" } },
  "ai-stock-content-generator":         { target: "generate-gift-message", bodyExtras: { type: "stock_content" } },
  "chat-with-chef":                     { target: "generate-gift-message", bodyExtras: { type: "chef_chat" } },
  // "chat-with-offspring": real edge function (Mystical audit fix)
  "legal-ai":                           { target: "generate-gift-message", bodyExtras: { type: "legal" } },
  "mystery-box-ai":                     { target: "generate-gift-message", bodyExtras: { type: "mystery_box" } },
  "teen-career-counselor":              { target: "generate-gift-message", bodyExtras: { type: "teen_career" } },
  "kids-homework-helper":               { target: "generate-gift-message", bodyExtras: { type: "kids_homework" } },
  "kids-drawing-tutorial":              { target: "generate-gift-message", bodyExtras: { type: "kids_drawing" } },
  "kids-reading-companion":             { target: "generate-gift-message", bodyExtras: { type: "kids_reading" } },
  "kids-science-lab":                   { target: "generate-gift-message", bodyExtras: { type: "kids_science" } },
  "kids-story-creator":                 { target: "generate-gift-message", bodyExtras: { type: "kids_story" } },
  "pet-name-generator":                 { target: "generate-gift-message", bodyExtras: { type: "pet_name" } },
  "pet-personality-coach":              { target: "generate-gift-message", bodyExtras: { type: "pet_personality" } },
  "pet-training-planner":               { target: "generate-gift-message", bodyExtras: { type: "pet_training" } },
  "pet-mood-analyzer":                  { target: "generate-gift-message", bodyExtras: { type: "pet_mood" } },
  "pet-health-predictor":               { target: "generate-gift-message", bodyExtras: { type: "pet_health" } },
  "pet-compatibility-checker":          { target: "generate-gift-message", bodyExtras: { type: "pet_compatibility" } },
  "pet-battle-strategy":                { target: "generate-gift-message", bodyExtras: { type: "pet_battle" } },
  "pet-story-generator":                { target: "generate-gift-message", bodyExtras: { type: "pet_story" } },

  // ─── Image / video / audio generators → generate-gift-message ───
  "generate-age-progression":           { target: "generate-gift-message", bodyExtras: { type: "age_progression" } },
  "generate-ai-room-design":            { target: "generate-gift-message", bodyExtras: { type: "ai_room" } },
  "generate-castle-panorama":           { target: "generate-gift-message", bodyExtras: { type: "castle_panorama" } },
  "generate-certificate":               { target: "generate-gift-message", bodyExtras: { type: "certificate" } },
  "generate-collectible":               { target: "generate-gift-message", bodyExtras: { type: "collectible" } },
  "generate-course-content":            { target: "generate-gift-message", bodyExtras: { type: "course_content" } },
  "generate-escape-room-panorama":      { target: "generate-gift-message", bodyExtras: { type: "escape_panorama" } },
  "generate-fashion-design":            { target: "generate-gift-message", bodyExtras: { type: "fashion_design" } },
  "generate-music":                     { target: "generate-gift-message", bodyExtras: { type: "music" } },
  "generate-paint-by-numbers":          { target: "generate-gift-message", bodyExtras: { type: "paint_by_numbers" } },
  "generate-paint-image":               { target: "generate-gift-message", bodyExtras: { type: "paint_image" } },
  "generate-phobia-cure":               { target: "generate-gift-message", bodyExtras: { type: "phobia_cure" } },
  "generate-recipe-from-ingredients":   { target: "generate-gift-message", bodyExtras: { type: "recipe_from_ingredients" } },
  "generate-sports-prediction":         { target: "generate-gift-message", bodyExtras: { type: "sports_prediction" } },
  "generate-story-video":               { target: "generate-gift-message", bodyExtras: { type: "story_video" } },
  "generate-tattoo":                    { target: "generate-gift-message", bodyExtras: { type: "tattoo" } },
  "generate-teacher-coloring":          { target: "generate-gift-message", bodyExtras: { type: "teacher_coloring" } },
  "generate-video-ad":                  { target: "generate-gift-message", bodyExtras: { type: "video_ad" } },
  "generate-video-thumbnail":           { target: "generate-gift-message", bodyExtras: { type: "video_thumbnail" } },
  "generate-virtual-tour":              { target: "generate-gift-message", bodyExtras: { type: "virtual_tour" } },
  "generate-weekly-meal-plan":          { target: "generate-gift-message", bodyExtras: { type: "weekly_meal_plan" } },
  "translate-and-generate-audio":       { target: "generate-gift-message", bodyExtras: { type: "translate_audio" } },
  "bulk-generate-panoramas":            { target: "generate-gift-message", bodyExtras: { type: "bulk_panoramas" } },
  "enhance-shadow-story":               { target: "generate-gift-message", bodyExtras: { type: "shadow_story" } },

  // ─── Niche AI helpers → generate-gift-message ───
  // "calculate-karmic-debt", "find-genetic-matches", "find-soul-matches": real edge functions (Mystical audit fix)

  "brain-duel-friend-match":            { target: "generate-gift-message", bodyExtras: { type: "brain_duel_match" } },

  // ─────────────────────────────────────────────────────────────────────
  // SHADOW / BATTLE / GAME ACTIONS → create-checkout (game actions)
  // ─────────────────────────────────────────────────────────────────────
  // create-shadow-battle: REAL edge function (inserts shadow_battles row)
  // purchase-shadow-gift: REAL edge function (Stripe checkout + shadow_gifts row)
  // battle-characters / battle-pets: REAL edge functions with credit deduction
  "join-shadow-battle":                 { target: "create-checkout", bodyExtras: { product: "shadow_battle_join" } },
  "purchase-best-friend-messages":      { target: "create-checkout", bodyExtras: { product: "best_friend_messages" } },
  "purchase-psychology-messages":       { target: "create-checkout", bodyExtras: { product: "psychology_messages" } },
  "purchase-content-pack":              { target: "create-checkout", bodyExtras: { product: "content_pack" } },
  "purchase-premium-course":            { target: "create-checkout", bodyExtras: { product: "premium_course" } },
  "purchase-stock-content":             { target: "create-checkout", bodyExtras: { product: "stock_content" } },
  "purchase-tip":                       { target: "create-checkout", bodyExtras: { product: "tip" } },
  "send-dating-gift":                   { target: "create-checkout", bodyExtras: { product: "dating_gift" } },
  "submit-fashion-challenge":           { target: "create-checkout", bodyExtras: { product: "fashion_challenge_submit" } },
  "vote-fashion-challenge":             { target: "create-checkout", bodyExtras: { product: "fashion_challenge_vote" } },
  
  "trade-phobia":                       { target: "create-checkout", bodyExtras: { product: "phobia_trade" } },
  "enroll-premium-course":              { target: "create-checkout", bodyExtras: { product: "course_enroll" } },
  "coupon-marketplace-access":          { target: "create-checkout", bodyExtras: { product: "coupon_marketplace" } },

  // ─────────────────────────────────────────────────────────────────────
  // DATA QUERIES → check-subscription (read-only helpers via tier)
  // ─────────────────────────────────────────────────────────────────────
  "get-my-stock-purchases":             { target: "check-subscription", bodyExtras: { tier: "stock_purchases", action: "list" } },
  "get-user-phobias":                   { target: "check-subscription", bodyExtras: { tier: "phobias", action: "list" } },
  // "get-user-universes": real edge function (Mystical audit fix)
  "check-expired-listings":             { target: "check-subscription", bodyExtras: { tier: "expired_listings", action: "list" } },

  // ─────────────────────────────────────────────────────────────────────
  // CREATION (Universe / Character / Offspring) → create-checkout (free)
  // ─────────────────────────────────────────────────────────────────────
  "create-character":                   { target: "create-checkout", bodyExtras: { product: "character_create", free: true } },
  "create-universe":                    { target: "create-checkout", bodyExtras: { product: "universe_create", free: true } },
  // "create-digital-offspring": real edge function (Mystical audit fix)

  // ─────────────────────────────────────────────────────────────────────
  // STREAMING & WITHDRAWALS → check-connect-status (Stripe Connect ops)
  // ─────────────────────────────────────────────────────────────────────
  "start-stream":                       { target: "check-connect-status", action: "start_stream" },
  "stop-stream":                        { target: "check-connect-status", action: "stop_stream" },
  "process-auction-withdrawal":         { target: "check-connect-status", action: "auction_withdrawal" },
  "process-sale-transaction":           { target: "check-connect-status", action: "sale_transaction" },
  "process-withdrawal-request":         { target: "check-connect-status", action: "withdrawal_request" },
  "request-instructor-withdrawal":      { target: "check-connect-status", action: "instructor_withdrawal" },
  "notify-admin-auction-withdrawal":    { target: "check-connect-status", action: "notify_auction_withdrawal" },
  "activate-job-listing":               { target: "check-connect-status", action: "activate_job" },
  "add-teen-career-generation":         { target: "check-subscription", bodyExtras: { tier: "teen_career", action: "increment" } },

  // ─────────────────────────────────────────────────────────────────────
  // LEGACY NAME REMAPS → existing edge functions (prevents 404/500)
  // ─────────────────────────────────────────────────────────────────────
  // "analyze-past-life": real edge function (Mystical audit fix)
};

const originalInvoke = supabase.functions.invoke.bind(supabase.functions);

supabase.functions.invoke = async function patchedInvoke(
  functionName: string,
  options?: any
): Promise<any> {
  // ─── Apply alias rewrite if mapped ───
  let targetFunction = functionName;
  let mergedOptions = options;

  const alias = FUNCTION_ALIASES[functionName];
  if (alias) {
    targetFunction = alias.target;
    const baseBody = (options?.body && typeof options.body === "object") ? options.body : {};
    mergedOptions = {
      ...(options || {}),
      body: {
        ...(alias.action ? { action: alias.action } : {}),
        ...(alias.bodyExtras || {}),
        ...baseBody,
        // Always preserve original function name so router can disambiguate
        _aliasFrom: functionName,
      },
    };
    console.info(`[EdgeFn:alias] ${functionName} → ${alias.target}${alias.action ? ` (action=${alias.action})` : ""}`);
  }

  try {
    const result = await originalInvoke(targetFunction, mergedOptions);

    if (result.error) {
      let message = "Service temporarily unavailable. Please try again.";

      try {
        const err = result.error;

        // FunctionsHttpError – extract real message from response context
        if (err && typeof err === "object" && "context" in err) {
          const ctx = (err as any).context;
          if (ctx && typeof ctx.json === "function") {
            const body = await ctx.json();
            if (body?.error) message = body.error;
            else if (body?.message) message = body.message;
          }
        } else if (err instanceof Error) {
          if (
            !err.message.includes("non-2xx") &&
            !err.message.includes("FunctionsHttpError") &&
            !err.message.includes("FunctionsRelayError")
          ) {
            message = err.message;
          }
        }
      } catch {
        // Context stream already consumed or unavailable – keep default
      }

      console.warn(`[EdgeFn:${targetFunction}]`, message);

      return {
        data: null,
        error: Object.assign(new Error(message), {
          name: "EdgeFunctionError",
        }),
      };
    }

    return result;
  } catch (networkErr: any) {
    const raw = networkErr?.message || "Network error";
    let friendly: string;

    if (raw.includes("Failed to fetch") || raw.includes("NetworkError")) {
      friendly = "Network error. Please check your connection and try again.";
    } else if (raw.includes("AbortError") || raw.includes("timeout")) {
      friendly = "Request timed out. Please try again.";
    } else if (raw.includes("CORS")) {
      friendly = "Connection blocked. Please try again later.";
    } else {
      friendly = "Service temporarily unavailable. Please try again.";
    }

    console.warn(`[EdgeFn:${targetFunction}] network:`, raw);

    return {
      data: null,
      error: Object.assign(new Error(friendly), {
        name: "EdgeFunctionNetworkError",
      }),
    };
  }
} as typeof supabase.functions.invoke;

console.info(`[EdgeFn] Global error handler + alias map active (${Object.keys(FUNCTION_ALIASES).length} aliases)`);
