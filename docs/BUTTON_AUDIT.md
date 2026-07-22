# Button audit

Scanned **3224** files, flagged **131** potentially inert `<Button>` usages.

Heuristic: a Button is flagged when its opening tag has no `onClick`, `asChild`, `type="submit"`, `form=`, spread props, or a shadcn trigger parent. False positives are expected — please review each entry.

## src/components/ads/RewardedAdCard.tsx

- L213: `<Button disabled size="sm" variant="secondary">`

## src/components/anonymous-date/VoiceRecorderButton.tsx

- L25: `<Button size="icon" disabled variant="ghost" className="rounded-full">`

## src/components/antiques/ARMuseumDisplay.tsx

- L70: `<Button variant="outline" asChild>`

## src/components/antiques/AntiqueAnalyze.tsx

- L118: `<Button variant="outline" asChild>`

## src/components/antiques/AntiqueBatchAppraisal.tsx

- L111: `<Button variant="outline" asChild>`

## src/components/antiques/AntiqueCertificate.tsx

- L74: `<Button variant="outline" asChild>`

## src/components/antiques/AntiqueExpertMarketplace.tsx

- L73: `<Button variant="outline" asChild>`

## src/components/antiques/AntiquePriceAlert.tsx

- L73: `<Button variant="outline" asChild>`

## src/components/antiques/ForgeryDetection.tsx

- L70: `<Button variant="outline" asChild>`

## src/components/antiques/MarketValueTrends.tsx

- L70: `<Button variant="outline" asChild>`

## src/components/antiques/ProvenanceTracker.tsx

- L70: `<Button variant="outline" asChild>`

## src/components/assistant/UniAssistant.tsx

- L412: `<Button disabled size="lg" className="rounded-full h-14 w-14 p-0">`

## src/components/brain-duel/GameModeSelector.tsx

- L147: `<Button className="w-full" disabled={isSearching || !canAfford} variant={selectedMode === mode.id ? "default" : "outline`

## src/components/brain-duel/WeeklyTournaments.tsx

- L133: `<Button size="sm" variant={event.status === "active" ? "default" : "outline"} disabled={event.status !== "active"} >`

## src/components/brand-battle/BrandComments.tsx

- L115: `<Button disabled={!newComment.trim() || newComment.length < 10} className="gap-1.5 shadow-lg shadow-primary/10">`

## src/components/collectibles/CollectibleTradingHub.tsx

- L73: `<Button className="w-full" disabled>`

## src/components/common/HowItWorksButton.tsx

- L53: `<Button type="button" variant="outline" size="sm" className={`gap-1.5 h-8 ${className ?? ""}`} aria-label="How it works"`
- L64: `<Button type="button" variant="ghost" size="icon" className={`h-9 w-9 rounded-full border border-border/50 bg-background`

## src/components/courses/FinalExamDialog.tsx

- L173: `<Button asChild>`
- L178: `<Button variant="outline" asChild>`

## src/components/crystal/CrystalEnergyUpload.tsx

- L113: `<Button disabled={uploading || analyzing} size="icon" variant="outline">`

## src/components/dating/FriendCirclesPanel.tsx

- L75: `<Button size="sm" className="gap-1.5">`

## src/components/dating/MatchPollCard.tsx

- L81: `<Button size="sm" variant="outline" className="h-7 gap-1">`

## src/components/earnings/EarningsPayoutCard.tsx

- L92: `<Button disabled className="w-full bg-muted text-muted-foreground font-bold">`

## src/components/fashion/AIFashionHistoryExplorer.tsx

- L59: `<Button variant="outline" asChild>`

## src/components/fashion/AIVirtualStylistSession.tsx

- L66: `<Button variant="outline" asChild>`

## src/components/fundraising/AIStoryGenerator.tsx

- L94: `<Button variant="outline" className="gap-2 border-amber-400/40 hover:bg-amber-500/10">`

## src/components/fundraising/QuickDonateWidget.tsx

- L74: `<Button className="w-full" size="lg" disabled={!selectedAmount}>`

## src/components/fundraising/talent/PortfolioShowcase.tsx

- L58: `<Button variant="outline" className="w-full" asChild>`

## src/components/future-face/FutureFaceGallery.tsx

- L103: `<Button size="sm" variant="outline" asChild>`

## src/components/games/Tournaments.tsx

- L157: `<Button className="w-full" variant={tournament.status === 'live' ? 'default' : 'outline'} disabled={tournament.participa`

## src/components/gdpr/GDPRPanel.tsx

- L245: `<Button variant="link" className="p-0 h-auto" asChild>`
- L249: `<Button variant="link" className="p-0 h-auto" asChild>`

## src/components/influking/BrandDealFinder.tsx

- L222: `<Button disabled className="w-full gap-2" variant="outline" size="sm">`

## src/components/influking/PPVStudio.tsx

- L168: `<Button size="sm" variant="outline" asChild>`

## src/components/lie-detector/VoiceCloneDetectorCard.tsx

- L73: `<Button size="sm" variant="outline" className="w-full border-cyan-500/30" asChild>`

## src/components/musician/MyConcertsManager.tsx

- L163: `<Button size="sm" variant="outline" asChild>`

## src/components/notifications/PushOptInButton.tsx

- L68: `<Button variant={variant} size={size} className={className} disabled>`

## src/components/pet-translator/PetCrossPromo.tsx

- L36: `<Button size="sm" variant="ghost" className="group-hover:translate-x-1 transition-transform">`

## src/components/pet-translator/PetTrainingCourses.tsx

- L37: `<Button size="sm" className="w-full" variant="outline" disabled>`

## src/components/pet-translator/PetWearableTeaser.tsx

- L29: `<Button className="w-full" disabled>`

## src/components/photo-restoration/AIUpscaling.tsx

- L92: `<Button variant="outline" asChild>`

## src/components/photo-restoration/BackgroundRemoval.tsx

- L72: `<Button variant="outline" asChild>`
- L89: `<Button variant="outline" className="w-full mt-4 gap-2">`

## src/components/photo-restoration/ColorizationPro.tsx

- L93: `<Button variant="outline" asChild>`
- L110: `<Button variant="outline" className="w-full mt-4 gap-2">`

## src/components/photo-restoration/DamageDetection.tsx

- L88: `<Button variant="outline" asChild>`

## src/components/photo-restoration/FaceEnhancement.tsx

- L72: `<Button variant="outline" asChild>`
- L89: `<Button variant="outline" className="w-full mt-4 gap-2">`

## src/components/profile/FollowButton.tsx

- L41: `<Button variant={variant} size={size} disabled>`

## src/components/profile/edit/CoverBannerUpload.tsx

- L30: `<Button variant="secondary" size="sm" disabled={uploading} asChild>`

## src/components/psychologist/CrisisResources.tsx

- L102: `<Button variant="outline" size="icon" asChild>`

## src/components/rewards/RewardsGuilds.tsx

- L139: `<Button size="sm">`

## src/components/stock-content/LicenseSelectorDialog.tsx

- L115: `<Button className="w-full" size="sm">`

## src/components/stock-content/ResolutionSelectorDialog.tsx

- L75: `<Button className="w-full" size="sm">`

## src/components/tutorial-platform/views/LiveSessionsView.tsx

- L94: `<Button size="sm" className="bg-red-500 hover:bg-red-600 shadow-lg" asChild>`

## src/components/video-ads/views/StockFootageView.tsx

- L71: `<Button size="sm" variant="outline">`

## src/components/wall/CloseFriendsDialog.tsx

- L39: `<Button variant="ghost" size="sm">`

## src/components/wall/CrossPostMenu.tsx

- L36: `<Button variant="ghost" size="sm">`

## src/components/wall/FollowedTopicsDialog.tsx

- L25: `<Button variant="ghost" size="sm">`

## src/components/wall/MusicShareCard.tsx

- L104: `<Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1 px-2" asChild>`

## src/components/wall/MuteUserMenu.tsx

- L26: `<Button variant="ghost" size="sm">`

## src/components/wall/MutedKeywordsDialog.tsx

- L68: `<Button variant="ghost" size="sm">`

## src/components/wall/MutedUsersDialog.tsx

- L18: `<Button variant="ghost" size="sm">`

## src/components/wall/ReportDialog.tsx

- L42: `<Button variant={variant} size="sm">`

## src/components/wall/SavedSearchesDialog.tsx

- L30: `<Button variant="ghost" size="sm">`

## src/components/wall/SharePostToDM.tsx

- L60: `<Button variant="ghost" size="sm">`

## src/components/wellness/EmergencyResources.tsx

- L110: `<Button size="sm" variant="outline" asChild>`
- L118: `<Button size="sm" variant="outline" asChild>`

## src/pages/Auction.tsx

- L276: `<Button variant="outline" size="sm" asChild>`

## src/pages/BazaarSavedSearches.tsx

- L100: `<Button variant="ghost" size="icon" asChild>`

## src/pages/ConcertWatch.tsx

- L204: `<Button asChild>`

## src/pages/Cooking.tsx

- L1468: `<Button size="sm" variant="premium" className="pointer-events-none">`

## src/pages/CouponBrandPage.tsx

- L129: `<Button asChild>`

## src/pages/CouponMarketplace.tsx

- L630: `<Button className="gap-2">`

## src/pages/CouponSeasonalHub.tsx

- L40: `<Button asChild>`

## src/pages/CouponsMy.tsx

- L58: `<Button asChild>`
- L65: `<Button asChild>`

## src/pages/CreatorPayouts.tsx

- L118: `<Button variant="outline" size="sm" asChild>`

## src/pages/CreatorProfile.tsx

- L447: `<Button variant="outline" size="sm" asChild>`
- L455: `<Button variant="outline" size="sm" asChild>`

## src/pages/Dating.tsx

- L1358: `<Button variant="outline" className="gap-2 text-destructive hover:text-destructive">`
- L1363: `<Button variant="ghost" className="w-full text-muted-foreground text-sm" disabled={cancelingSubscription}>`

## src/pages/EcoChallenge.tsx

- L458: `<Button>`

## src/pages/GamesHub.tsx

- L51: `<Button variant="outline" size="sm" disabled={page >`

## src/pages/GiftHistory.tsx

- L88: `<Button variant="ghost" size="sm" asChild>`
- L151: `<Button variant="outline" size="sm" asChild>`
- L158: `<Button size="sm" asChild>`

## src/pages/HealthyChallenge.tsx

- L451: `<Button>`

## src/pages/HolographicHistory.tsx

- L204: `<Button className="mt-3">`

## src/pages/MasterChefCompetitions.tsx

- L167: `<Button variant={competition.status === "active" ? "default" : "outline"} disabled={competition.status !== "active"} >`

## src/pages/MyAuctions.tsx

- L178: `<Button size="sm" variant="outline" asChild>`
- L205: `<Button variant="ghost" size="icon" asChild>`

## src/pages/MyPromotions.tsx

- L68: `<Button asChild>`

## src/pages/NotFound.tsx

- L114: `<Button asChild>`

## src/pages/PetsAchievements.tsx

- L120: `<Button size="sm">`
- L143: `<Button size="sm" variant="secondary">`

## src/pages/PetsHub.tsx

- L42: `<Button className="w-full">`
- L52: `<Button variant="secondary" className="w-full">`

## src/pages/PhotoRestoration.tsx

- L170: `<Button variant="outline" asChild>`
- L188: `<Button variant="outline" className="w-full mt-4">`

## src/pages/Profile.tsx

- L683: `<Button disabled className="bg-gradient-to-r from-violet-600/60 to-purple-600/60 text-white border-0">`

## src/pages/PromotionsSuccess.tsx

- L58: `<Button asChild>`

## src/pages/SkillOfferingDetail.tsx

- L165: `<Button asChild>`

## src/pages/SkillsMarketplaceEdit.tsx

- L88: `<Button asChild>`

## src/pages/SkillsMarketplaceOrderDetail.tsx

- L87: `<Button asChild>`

## src/pages/SkillsMarketplaceOrderSuccess.tsx

- L58: `<Button asChild>`
- L68: `<Button asChild>`
- L76: `<Button asChild>`

## src/pages/Subscriptions.tsx

- L162: `<Button size="sm" variant="outline" asChild>`
- L170: `<Button size="sm" asChild>`
- L203: `<Button size="sm" variant="outline" asChild>`
- L213: `<Button size="sm" asChild>`

## src/pages/Vacationer.tsx

- L171: `<Button>`
- L237: `<Button variant="ghost" size="sm" className="text-destructive">`

## src/pages/YearWrappedPublic.tsx

- L46: `<Button variant="outline">`
- L81: `<Button>`

## src/pages/admin/AdminDunning.tsx

- L145: `<Button size="sm" variant="ghost" asChild>`

## src/pages/admin/AdminFundraisingModeration.tsx

- L171: `<Button variant="outline" size="sm" asChild>`

## src/pages/admin/AdminRewardsAudit.tsx

- L108: `<Button variant="ghost" size="sm" asChild>`
- L112: `<Button variant="outline" size="sm" asChild>`

## src/pages/doctors/DoctorDashboard.tsx

- L86: `<Button asChild>`

## src/pages/education/StudyGroups.tsx

- L89: `<Button variant="outline" size="sm">`
- L97: `<Button size="sm">`

## src/pages/fundraising/EmbedBuilder.tsx

- L151: `<Button variant="outline" asChild>`

## src/pages/fundraising/FundraisingHub.tsx

- L77: `<Button size="lg" className="bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 hover:from-amber-600 hover:via-r`

## src/pages/fundraising/TalentDetail.tsx

- L243: `<Button variant="link" className="p-0 h-auto" asChild>`

## src/pages/jobs/EmployerATS.tsx

- L173: `<Button variant="outline" asChild>`

## src/pages/jobs/Referrals.tsx

- L68: `<Button>`

## src/pages/mentor/MentorHub.tsx

- L59: `<Button asChild>`

## src/pages/services/ServicesList.tsx

- L153: `<Button asChild>`
