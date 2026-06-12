# Missing Edge Functions Audit

Generated: 2026-06-12

**Existing locally:** 344 | **Called from frontend:** 573 | **Missing:** 271

## Priority recommendation

Fix in this order based on user impact:

1. **Stripe Payments** (blocks all paid features)
2. **Virtual Pet, Nutrition, Beauty, Antique, Horse, Plant, Photo, Home** (Entertainment & Lifestyle hubs)
3. **Live Concerts, Megatalent, Creator Subscriptions** (revenue features)
4. **Kids/Teen Hub, Games** (target audience)
5. **Social Feed, Messaging, Community, Dating** (engagement)
6. **AI Generic, Admin, Other** (utility)


## AI Generic (29)

- `ai-auto-recharge` — components/ai-credits/AutoRechargeCard.tsx
- `ai-stock-content-generator` — components/stock-content/views/AIContentGeneratorView.tsx
- `analyze-crystal-energy` — components/crystal/CrystalEnergyUpload.tsx
- `analyze-emotion` — components/emotion-economy/EmotionFeed.tsx
- `analyze-message` — hooks/useLieDetectorCredits.ts
- `analyze-profile` — hooks/useLieDetectorCredits.ts
- `analyze-restaurant-menu-ai` — components/cooking/RestaurantAnalyzer.tsx
- `analyze-resume-ai` — components/jobs/AIJobOptimizer.tsx
- `analyze-thread` — hooks/useLieDetectorCredits.ts
- `generate-ai-room-design` — components/home-decor/AIRoomDesigner.tsx
- `generate-castle-panorama` — components/fairy-castles/CastlePanoramaGenerator.tsx
- `generate-certificate` — hooks/useLearningContent.ts
- `generate-collectible` — hooks/useCollectibles.ts
- `generate-course-content` — utils/generateAllCourses.ts
- `generate-escape-room-panorama` — components/escape-room/PanoramaEscapeRoom.tsx, components/escape-room/puzzleRooms.ts
- `generate-fashion-design` — components/fashion/FashionGenerator.tsx
- `generate-lottery-numbers` — pages/LotteryAI.tsx
- `generate-paint-by-numbers` — hooks/useGeneratePaintTemplate.ts
- `generate-paint-image` — hooks/useGeneratePaintImage.ts
- `generate-phobia-cure` — components/phobia/PhobiaCureDashboard.tsx
- `generate-recipe-from-ingredients` — components/cooking/RecipeGenerator.tsx
- `generate-sports-prediction` — pages/SportsPredictor.tsx
- `generate-story-video` — pages/StoryVideoDemo.tsx
- `generate-teacher-coloring` — components/teacher/AddColoringPageDialog.tsx
- `generate-video-thumbnail` — components/fit-slim/VideoThumbnailGenerator.tsx
- `generate-weekly-meal-plan` — components/cooking/MealPlannerGenerator.tsx
- `identify-antique` — hooks/useAntiqueCredits.ts
- `identify-plant` — components/plant-care/PlantIdentifier.tsx
- `scan-food-ai` — components/cooking/FoodScanner.tsx

## Antiques Hub (9)

- `antique-ar-room` — components/antiques/AntiqueARTryInRoom.tsx
- `antique-batch-appraisal` — components/antiques/AntiqueBatchAppraisal.tsx
- `antique-certificate` — components/antiques/AntiqueCertificate.tsx
- `antique-expert-consult` — components/antiques/AntiqueExpertMarketplace.tsx
- `antique-forgery-detection` — components/antiques/ForgeryDetection.tsx
- `antique-market-trends` — components/antiques/MarketValueTrends.tsx
- `antique-museum-display` — components/antiques/ARMuseumDisplay.tsx
- `antique-price-alert` — components/antiques/AntiquePriceAlert.tsx
- `antique-provenance` — components/antiques/ProvenanceTracker.tsx

## Beauty Hub (6)

- `beauty-celebrity-match` — components/beauty/CelebrityLookMatch.tsx
- `beauty-nail-art` — components/beauty/NailArtDesigner.tsx
- `beauty-recommendations` — components/beauty/ProductRecommender.tsx
- `beauty-skin-analysis` — components/beauty/SkinAnalysis.tsx
- `beauty-transformation` — components/beauty/HairStyleGenerator.tsx, components/beauty/VirtualMakeup.tsx
- `beauty-tutorial` — components/beauty/MakeupTutorials.tsx

## Brand Arena (1)

- `brand-campaign-checkout` — components/brand/BrandApplicationsManager.tsx

## Home Hub (3)

- `home-color-palette` — components/home-decor/ColorPaletteGenerator.tsx
- `home-furniture-recommender` — components/home-decor/FurnitureRecommender.tsx
- `home-virtual-staging` — components/home-decor/VirtualRoomStaging.tsx

## Horse Hub (6)

- `horse-championship-enroll` — components/horse-racing/SeasonalChampionships.tsx
- `horse-claim-quest-reward` — components/horse-racing/DailyTrainingQuests.tsx
- `horse-create` — hooks/useHorseRacing.ts
- `horse-join-race` — hooks/useHorseRacing.ts
- `horse-purchase-equipment` — components/horse-racing/HorseEquipmentSystem.tsx
- `horse-train` — hooks/useHorseRacing.ts

## Kids Hub (4)

- `kids-customer-portal` — components/kids/KidsSubscriptionPlans.tsx
- `kids-drawing-customer-portal` — hooks/useKidsDrawingSubscription.ts
- `kids-science-lab` — pages/KidsScienceLab.tsx
- `kids-story-customer-portal` — hooks/useKidsStoryCreator.ts

## Megatalent (2)

- `megatalent-customer-portal` — pages/Megatalent.tsx
- `vote-fashion-challenge` — components/fashion/FashionChallenges.tsx

## Nutrition Hub (9)

- `nutrition-allergy-scanner` — components/nutrition/AIAllergyScanner.tsx
- `nutrition-barcode-scanner` — components/nutrition/AIBarcodeScanner.tsx
- `nutrition-body-predictor` — components/nutrition/AIBodyCompositionPredictor.tsx
- `nutrition-coach-chat` — components/nutrition/AINutritionCoachChat.tsx
- `nutrition-grocery-optimizer` — components/nutrition/AIGroceryBudgetOptimizer.tsx
- `nutrition-hydration-coach` — components/nutrition/AIHydrationCoach.tsx
- `nutrition-meal-challenge` — components/nutrition/SocialMealChallenges.tsx
- `nutrition-supplement-advisor` — components/nutrition/AISupplementAdvisor.tsx
- `nutrition-weekly-progress` — components/nutrition/WeeklyProgressDashboard.tsx

## Other / Uncategorized (62)

- `brain-duel-friend-match` — components/brain-duel/FriendChallenges.tsx
- `bulk-generate-panoramas` — pages/FairyAdmin.tsx
- `capsule-wardrobe` — components/fashion/CapsuleWardrobe.tsx
- `chat-with-chef` — components/cooking/ChefChat.tsx
- `check-anonymous-date-access` — pages/AnonymousDate.tsx
- `check-connect-status` — components/earnings/PayoutSchedulePicker.tsx, components/fundraising/CampaignPayoutPanel.tsx, components/instructor/EarningsDashboard.tsx
- `check-dunning` — components/billing/DunningBanner.tsx
- `check-expired-listings` — hooks/usePropertyExpiration.ts
- `check-holographic-access` — hooks/useHolographicAccess.ts
- `check-megatalent-vip` — hooks/useMegatalentVip.ts
- `check-sca` — components/billing/SCABanner.tsx
- `check-time-capsule-access` — hooks/useTimeCapsuleAccess.ts
- `coupon-marketplace-access` — pages/CouponMarketplace.tsx
- `coupon-receipt-cashback` — hooks/useCouponCashback.ts
- `coupon-stacking-calc` — hooks/useCouponStacking.ts
- `create-auction-buyout` — pages/Auction.tsx
- `create-brand-sponsorship` — pages/SponsorRegistration.tsx
- `create-campaign-donation` — pages/fundraising/CrisisDetail.tsx, pages/fundraising/DreamDetail.tsx, pages/fundraising/HeroDetail.tsx
- `create-character` — components/character/CharacterCreator.tsx
- `create-crystal-purchase` — pages/CrystalMarketplace.tsx
- `create-kitchen-battle` — pages/KitchenStarsBattles.tsx
- `create-megatalent-boost` — components/megatalent/MegatalentBoostButton.tsx
- `create-megatalent-tip` — components/megatalent/MegatalentTipJar.tsx
- `create-profile-tip` — components/profile/TipJar.tsx
- `create-universe` — components/multiverse/UniverseCreator.tsx
- `detect-phobia` — components/phobia/PhobiaDetector.tsx
- `diagnose-plant` — components/plant-care/PlantDiagnosis.tsx
- `enhance-shadow-story` — pages/ShadowArenaSubmitStory.tsx
- `enroll-premium-course` — pages/PremiumCourses.tsx
- `get-my-stock-purchases` — components/stock-library/MyPurchases.tsx
- `get-user-phobias` — components/phobia/MyPhobias.tsx, components/phobia/PhobiaCureDashboard.tsx
- `join-shadow-battle` — pages/ShadowArenaBattleDetail.tsx
- `legal-ai` — components/legal/LegalAssistant.tsx
- `mt-claim-streak` — components/megatalent/MegatalentVotingStreak.tsx
- `mt-release-funds` — components/megatalent/MegatalentMentorshipBooking.tsx, components/megatalent/MegatalentTalentMarketplace.tsx
- `mystery-box-ai` — components/mystery-box/AIRarityPredictor.tsx
- `notify-admin-auction-withdrawal` — components/auction/AuctionWithdrawalRequest.tsx
- `open-mystery-box` — hooks/useCollectibles.ts
- `outfit-recommender` — components/fashion/OutfitRecommender.tsx
- `process-auction-withdrawal` — components/auction/AdminAuctionWithdrawals.tsx
- `process-sale-transaction` — utils/createSaleTransaction.ts
- `process-withdrawal-request` — components/fundraising/CampaignWithdrawalManagement.tsx
- `purchase-best-friend-messages` — hooks/useBestFriendSubscription.ts
- `purchase-content-pack` — components/creator/CreatorContentPacks.tsx
- `purchase-premium-course` — pages/PremiumCourses.tsx
- `purchase-psychology-messages` — hooks/usePsychologySubscription.ts
- `purchase-shadow-gift` — pages/ShadowArenaBattleDetail.tsx
- `purchase-stock-content` — components/stock-content/views/BrowseLibraryView.tsx, components/stock-library/ContentGrid.tsx
- `purchase-tip` — components/sports/ExpertTips.tsx
- `request-instructor-withdrawal` — components/tutorial-platform/MyInstructorEarnings.tsx
- `restore-old-photo` — hooks/usePhotoCredits.ts
- `send-dating-gift` — pages/Dating.tsx
- `start-stream` — components/shadow-arena/LiveStream.tsx
- `stop-stream` — components/shadow-arena/LiveStream.tsx
- `submit-fashion-challenge` — components/fashion/FashionChallenges.tsx
- `trade-phobia` — components/phobia/MyPhobias.tsx, components/phobia/PhobiaMarketplace.tsx
- `translate-and-generate-audio` — components/fairy-castles/CastleVoiceNarration.tsx, components/fairy-castles/FairyPanoramaViewer.tsx
- `video-ad-scenes` — components/video-ads/views/AvatarTalkingHeadView.tsx, components/video-ads/views/TextToVideoScenesView.tsx, components/video-ads/views/UrlToVideoView.tsx
- `video-ad-sfx` — components/video-ads/views/FinalVideoComposerView.tsx, components/video-ads/views/SoundEffectsView.tsx
- `video-ad-tts` — components/video-ads/views/AvatarTalkingHeadView.tsx, components/video-ads/views/FinalVideoComposerView.tsx, components/video-ads/views/TtsVoiceoverView.tsx
- `video-ad-voice-clone` — components/video-ads/views/VoiceCloneView.tsx
- `virtual-tryon` — components/fashion/VirtualTryOn.tsx

## Photo Hub (5)

- `photo-ai-upscaling` — components/photo-restoration/AIUpscaling.tsx
- `photo-background-removal` — components/photo-restoration/BackgroundRemoval.tsx
- `photo-colorization-pro` — components/photo-restoration/ColorizationPro.tsx
- `photo-damage-detection` — components/photo-restoration/DamageDetection.tsx
- `photo-face-enhancement` — components/photo-restoration/FaceEnhancement.tsx

## Shadow Arena (9)

- `shadow-ai-narrator` — hooks/useShadowArenaAI.ts
- `shadow-ai-story-generator` — hooks/useShadowArenaAI.ts
- `shadow-arena-credits-init` — hooks/useShadowArenaAI.ts
- `shadow-battle-predictor` — hooks/useShadowArenaAI.ts
- `shadow-curse-wheel-spin` — hooks/useShadowArenaFeatures.ts
- `shadow-horror-reel` — hooks/useShadowArenaFeatures.ts
- `shadow-nightmare-avatar` — hooks/useShadowArenaAI.ts
- `shadow-patron-checkout` — hooks/useShadowArenaFeatures.ts
- `shadow-voice-clone` — hooks/useShadowArenaFeatures.ts

## Stripe Payments (118)

- `check-best-friend-subscription` — hooks/useBestFriendSubscription.ts
- `check-companions-subscription` — hooks/useCompanionsSubscription.ts
- `check-decor-subscription` — hooks/useDecorSubscription.ts
- `check-employer-subscription` — hooks/useEmployerPaymentStatus.ts
- `check-f1-subscription` — pages/F1Racing.tsx, pages/F1Subscription.tsx
- `check-future-face-subscription` — hooks/useFutureFaceSubscription.ts
- `check-healthcare-subscription` — hooks/useHealthcareSubscription.ts
- `check-kids-drawing-subscription` — hooks/useKidsDrawingSubscription.ts
- `check-kids-reading-subscription` — hooks/useKidsReadingSubscription.ts
- `check-kids-story-subscription` — hooks/useKidsStoryCreator.ts
- `check-kids-subscription` — components/kids/KidsSubscriptionPlans.tsx
- `check-lottery-subscription` — pages/LotteryAI.tsx
- `check-masterchef-subscription` — hooks/useMasterChefSubscription.ts
- `check-phobia-subscription` — hooks/usePhobiaCredits.ts
- `check-psychology-subscription` — hooks/usePsychologySubscription.ts
- `check-shadow-subscription` — hooks/useShadowSubscription.tsx
- `check-skill-swap-subscription` — hooks/useSkillSwap.ts
- `check-sports-subscription` — hooks/useSportsSubscription.ts
- `check-time-reversal-subscription` — hooks/useTimeReversalSubscription.ts
- `check-tipster-subscription` — components/sports/TipsterRegistrationDialog.tsx
- `check-vip-subscription` — hooks/useVipSubscription.ts
- `check-wellness-subscription` — pages/Wellness.tsx
- `companions-customer-portal` — hooks/useCompanionsSubscription.ts
- `create-analyzer-credits-payment` — hooks/useAnalyzerCredits.ts, pages/AnalyzerPricing.tsx
- `create-analyzer-subscription` — pages/AnalyzerPricing.tsx
- `create-anonymous-date-payment` — hooks/useAnonymousDate.ts
- `create-ar-preview-checkout` — components/home-decor/AIRoomDesigner.tsx
- `create-ar-preview-payment` — hooks/useDecorSubscription.ts
- `create-bazaar-order-checkout` — components/bazaar/BazaarPurchaseDialog.tsx
- `create-best-friend-checkout` — hooks/useBestFriendSubscription.ts
- `create-brain-duel-payment` — components/brain-duel/BuyCreditsDialog.tsx
- `create-brand-votes-payment` — components/brand-battle/BuyVotesDialog.tsx
- `create-campaign-payment-checkout` — components/brand/BrandCampaignPayments.tsx
- `create-comedy-payment` — components/comedy/ComedyCurrencyDisplay.tsx
- `create-companions-checkout` — hooks/useCompanionsSubscription.ts
- `create-concert-payment` — components/concerts/CollectibleTickets.tsx, components/concerts/SongRequests.tsx
- `create-concert-ticket-checkout` — components/concerts/BrowseConcerts.tsx
- `create-confession-checkout` — pages/BlockchainConfessions.tsx
- `create-consultation-checkout` — components/home-decor/DesignConsultations.tsx
- `create-cooking-credits-payment` — pages/PaymentDocumentation.tsx
- `create-coupon-checkout` — pages/CouponMarketplace.tsx
- `create-creative-forge-payment` — hooks/useCreativeForgeCredits.ts
- `create-creator-subscription` — components/creator/SubscriptionTiers.tsx
- `create-credits-payment` — components/collectibles/BuyCreditsDialog.tsx, hooks/useAICredits.ts
- `create-decor-checkout` — pages/HomeDecorSubscription.tsx
- `create-decor-subscription` — hooks/useDecorSubscription.ts, pages/HomeDecorMarketplace.tsx
- `create-emotion-credits-payment` — components/emotion-economy/EmotionFeed.tsx, components/emotion-economy/EmotionWallet.tsx
- `create-emotion-insurance-checkout` — components/emotion-economy/EmotionInsurance.tsx
- `create-emotion-market-checkout` — components/emotion-economy/EmotionMarket.tsx
- `create-employer-subscription-checkout` — hooks/useEmployerPaymentStatus.ts
- `create-escape-room-checkout` — components/escape-room/RoomGallery.tsx
- `create-f1-checkout` — pages/F1Subscription.tsx
- `create-f1-currency-checkout` — components/f1-racing/F1CurrencyDisplay.tsx
- `create-fashion-marketplace-payment` — components/fashion/FashionMarketplace.tsx
- `create-fitslim-checkout` — pages/FitSlim.tsx
- `create-future-face-checkout` — hooks/useFutureFaceSubscription.ts
- `create-handwriting-credits-payment` — hooks/useHandwritingCredits.ts
- `create-healthcare-subscription` — components/coloring/HealthcareTab.tsx
- `create-holographic-avatar-checkout` — components/holographic/AvatarBattleArena.tsx, components/holographic/AvatarBreeding.tsx, components/holographic/AvatarCreator.tsx
- `create-horse-currency-checkout` — hooks/useHorseRacing.ts
- `create-iq-payment` — hooks/useIQCredits.ts
- `create-kids-drawing-checkout` — hooks/useKidsDrawingSubscription.ts
- `create-kids-reading-checkout` — hooks/useKidsReadingSubscription.ts
- `create-kids-subscription-checkout` — components/kids/KidsSubscriptionPlans.tsx
- `create-lead-boost-payment` — components/property/LeadBoostDialog.tsx
- `create-learning-payment` — hooks/useLearningContent.ts
- `create-lie-detector-payment` — hooks/useLieDetectorCredits.ts
- `create-lottery-subscription` — pages/LotteryAI.tsx
- `create-marketplace-item-checkout` — pages/HomeDecorMarketplace.tsx, pages/HomeDesigner.tsx
- `create-masterchef-checkout` — pages/MasterChefHub.tsx, pages/MasterChefSubscription.tsx
- `create-megatalent-checkout` — components/megatalent/MegatalentGuard.tsx, components/megatalent/TalentCommentsSheet.tsx
- `create-megatalent-vip-checkout` — hooks/useMegatalentVip.ts
- `create-merch-checkout` — components/creator/CreatorMerchStore.tsx
- `create-messenger-ai-credits-payment` — components/messenger/MessengerAIFeatures.tsx
- `create-multiverse-checkout` — components/multiverse/BestSelfFinder.tsx, components/multiverse/MultiversePricing.tsx, components/multiverse/MyUniverses.tsx
- `create-paid-message-checkout` — components/creator/PaidMessageDialog.tsx
- `create-phobia-subscription` — hooks/usePhobiaCredits.ts
- `create-photo-credits-payment` — hooks/usePhotoCredits.ts
- `create-premium-subscription` — pages/Premium.tsx
- `create-property-listing-checkout` — components/property/PropertySubmissionForm.tsx
- `create-psychology-checkout` — hooks/usePsychologySubscription.ts
- `create-reincarnation-checkout` — pages/ReincarnationSocial.tsx
- `create-rewards-checkout` — components/rewards/RewardsBattlePass.tsx, components/rewards/RewardsStreakFreeze.tsx
- `create-school-subscription` — components/coloring/SchoolsTab.tsx
- `create-secret-santa-payment` — components/secret-santa/SecretSantaCredits.tsx
- `create-service-order-checkout` — components/marketplace/ServiceOrderDialog.tsx
- `create-shadow-subscription` — components/shadow-arena/SubscriptionGate.tsx
- `create-sports-checkout` — hooks/useSportsSubscription.ts
- `create-stream-access-checkout` — components/creator/CreatorLiveStreams.tsx
- `create-subscription-checkout` — pages/Subscription.tsx
- `create-time-capsule-payment` — pages/TimeCapsuleSubscription.tsx
- `create-time-capsule-premium-subscription` — pages/TimeCapsuleSubscription.tsx
- `create-time-reversal-checkout` — components/time-reversal/TimeReversalPlans.tsx, pages/TimeReversalSubscription.tsx
- `create-tipster-checkout` — components/sports/TipsterRegistrationDialog.tsx
- `create-video-ad-credits-payment` — hooks/useVideoAdCredits.ts
- `create-vip-checkout` — hooks/useVipSubscription.ts
- `create-wellness-checkout` — pages/Wellness.tsx
- `customer-portal` — components/quantum-social/QuantumSubscriptions.tsx, hooks/useBestFriendSubscription.ts, pages/Billing.tsx
- `customer-portal-anonymous-date` — pages/AnonymousDate.tsx
- `customer-portal-creator` — components/creator/SubscriptionTiers.tsx
- `decor-customer-portal` — hooks/useDecorSubscription.ts
- `employer-customer-portal` — hooks/useEmployerPaymentStatus.ts
- `f1-customer-portal` — pages/F1Subscription.tsx
- `healthcare-customer-portal` — hooks/useHealthcareSubscription.ts
- `mt-checkout` — components/megatalent/MegatalentMentorshipBooking.tsx, components/megatalent/MegatalentTalentMarketplace.tsx
- `process-scheduled-payouts` — components/instructor/PayoutBatchesView.tsx
- `psychology-customer-portal` — hooks/usePsychologySubscription.ts
- `verify-bazaar-payment` — pages/Bazaar.tsx
- `verify-brain-duel-payment` — pages/BrainDuel.tsx
- `verify-coupon-payment` — pages/CouponMarketplace.tsx
- `verify-donation` — hooks/useDonationReturn.ts, pages/fundraising/MedicalDetail.tsx
- `verify-emotion-credits-payment` — components/emotion-economy/EmotionFeed.tsx
- `verify-gift-payment` — pages/CreatorProfile.tsx
- `verify-lead-boost-payment` — pages/MyProperties.tsx
- `verify-learning-payment` — hooks/useLearningContent.ts
- `verify-multiverse-payment` — pages/MultiverseNetwork.tsx
- `verify-shadow-battle-payment` — pages/ShadowArenaBattleSubmit.tsx
- `verify-tip-purchase` — hooks/usePurchaseVerification.ts

## Virtual Pet (8)

- `pet-battle-strategy` — components/virtual-pet/AIPetBattleStrategy.tsx
- `pet-compatibility-checker` — components/virtual-pet/AIPetCompatibilityChecker.tsx
- `pet-health-predictor` — components/virtual-pet/AIPetHealthPredictor.tsx
- `pet-mood-analyzer` — components/virtual-pet/AIPetMoodAnalyzer.tsx
- `pet-name-generator` — components/virtual-pet/AIPetNameGenerator.tsx
- `pet-personality-coach` — components/virtual-pet/AIPetPersonalityCoach.tsx
- `pet-story-generator` — components/virtual-pet/AIPetStoryGenerator.tsx
- `pet-training-planner` — components/virtual-pet/AIPetTrainingPlanner.tsx