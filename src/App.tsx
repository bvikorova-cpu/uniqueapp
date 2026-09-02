import { Suspense, type ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { lazyWithRetry as lazy } from "@/utils/lazyWithRetry";
import RouteSEO from "@/components/RouteSEO";
import ScrollToTop from "@/components/ScrollToTop";
const CouponSeasonalHub = lazy(() => import("@/pages/CouponSeasonalHub"));
// LiveChatWidget removed from dock — Uni voice+text assistant replaces it
const UniAssistant = lazy(() => import("@/components/assistant/UniAssistant"));
const GoogleTranslateWidget = lazy(() => import("@/components/GoogleTranslateWidget"));
const BazaarCreate = lazy(() => import("@/pages/BazaarCreate"));
const BazaarSavedSearches = lazy(() => import("@/pages/BazaarSavedSearches"));
const BazaarMy = lazy(() => import("@/pages/BazaarMy"));
const AuctionCreate = lazy(() => import("@/pages/AuctionCreate"));
const AuctionMy = lazy(() => import("@/pages/AuctionMy"));
const AuctionMessages = lazy(() => import("@/pages/AuctionMessages"));
const CouponMy = lazy(() => import("@/pages/CouponMy"));
const BazaarMessages = lazy(() => import("@/pages/BazaarMessages"));
const InvestmentPortfolio = lazy(() => import("@/pages/InvestmentPortfolio"));
const SkillsMarketplace = lazy(() => import("@/pages/SkillsMarketplace"));
const SkillsMarketplaceCreate = lazy(() => import("@/pages/SkillsMarketplaceCreate"));
const SkillOfferingDetail = lazy(() => import("@/pages/SkillOfferingDetail"));
const SkillsMarketplaceOrders = lazy(() => import("@/pages/SkillsMarketplaceOrders"));
const SkillsMarketplaceOrderSuccess = lazy(() => import("@/pages/SkillsMarketplaceOrderSuccess"));
const SkillsMarketplaceMine = lazy(() => import("@/pages/SkillsMarketplaceMine"));
const SkillsMarketplaceEdit = lazy(() => import("@/pages/SkillsMarketplaceEdit"));
const SkillsMarketplaceProvider = lazy(() => import("@/pages/SkillsMarketplaceProvider"));
const SkillsMarketplaceOrderDetail = lazy(() => import("@/pages/SkillsMarketplaceOrderDetail"));
const AdminSkillsReviewModeration = lazy(() => import("@/pages/AdminSkillsReviewModeration"));
const PromotionsBoard = lazy(() => import("@/pages/PromotionsBoard"));
const PromotionsCreate = lazy(() => import("@/pages/PromotionsCreate"));
const PromotionsSuccess = lazy(() => import("@/pages/PromotionsSuccess"));
const MyPromotions = lazy(() => import("@/pages/MyPromotions"));
const PPVPost = lazy(() => import("@/pages/PPVPost"));
const PaidMessageSuccess = lazy(() => import("@/pages/PaidMessageSuccess"));
const GiftSuccess = lazy(() => import("@/pages/GiftSuccess"));
const GiftHistory = lazy(() => import("@/pages/GiftHistory"));
const GiftsInbox = lazy(() => import("@/pages/GiftsInbox"));

const Club = lazy(() => import("@/pages/Club"));
const ClubCheckout = lazy(() => import("@/pages/ClubCheckout"));
const ClubCard = lazy(() => import("@/pages/ClubCard"));
const Subscriptions = lazy(() => import("@/pages/Subscriptions"));

// Redirect /kitchenstars/<sub-path> -> /masterchef/<sub-path> for brand aliases
const KitchenStarsRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const target = pathname.replace(/^\/kitchenstars/, "/masterchef") + search + hash;
  return <Navigate to={target} replace />;
};

// Redirect /proclass(es)/<sub-path> -> /masterclass(es)/<sub-path> for brand aliases
const ProClassRedirect = () => {
  const { pathname, search, hash } = useLocation();
  const target = pathname
    .replace(/^\/proclasses/, "/masterclasses")
    .replace(/^\/proclass/, "/masterclass") + search + hash;
  return <Navigate to={target} replace />;
};

import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import FanClubAutoResyncMount from "@/components/fanclub/FanClubAutoResyncMount";

import { RealTimeNotificationsMount } from "@/components/notifications/RealTimeNotificationsMount";
import PushNotificationsMount from "@/components/notifications/PushNotificationsMount";
import { GlobalMessageChimeMount } from "@/components/notifications/GlobalMessageChimeMount";
import { AnimationProvider } from "@/contexts/AnimationContext";
import { CurrencyProvider } from "@/contexts/CurrencyContext";

import { useEffect } from "react";
import "@/i18n/config";
import SkipLink from "./components/SkipLink";
import { KidsParentalGateGuard } from "@/components/kids/KidsParentalGateGuard";
import { KidsGoldPassGate } from "@/components/kids/KidsGoldPassGate";
import { PageLoader } from "@/components/ui/PageLoader";
import { ErrorBoundary } from "./components/ErrorBoundary";

/**
 * Wraps children in an ErrorBoundary keyed by the current pathname, so that
 * navigating to a new route resets the boundary and the user isn't stuck on
 * "Something went wrong" after one page throws.
 */
function RouteResetErrorBoundary({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  return <ErrorBoundary key={pathname}>{children}</ErrorBoundary>;
}
import { installGlobalErrorHandlers } from "@/utils/logger";
import { installImagePerformancePatch } from "@/utils/imagePerformance";
import { prewarmHotRoutes } from "@/utils/prewarmRoutes";
import { HelmetProvider } from "react-helmet-async";
import { GlobalPaymentCleanup } from "@/components/payment/GlobalPaymentCleanup";
import { GameAdGateHost } from "@/components/games/GameAdGateHost";


const Navbar = lazy(() => import("./components/Navbar"));
const Footer = lazy(() => import("./components/Footer"));
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute").then((module) => ({ default: module.ProtectedRoute })));
const SubscriptionGuard = lazy(() => import("@/components/SubscriptionGuard").then((module) => ({ default: module.SubscriptionGuard })));
const MegatalentGuard = lazy(() => import("@/components/megatalent/MegatalentGuard").then((module) => ({ default: module.MegatalentGuard })));
const ProgressiveOnboarding = lazy(() => import("./components/onboarding/ProgressiveOnboarding"));
const GlobalAnnouncementBanner = lazy(() => import("./components/GlobalAnnouncementBanner").then((module) => ({ default: module.GlobalAnnouncementBanner })));
const ReferralCaptureMount = lazy(() => import("@/components/referral/ReferralCaptureMount").then((module) => ({ default: module.ReferralCaptureMount })));
const IQReferralCaptureMount = lazy(() => import("@/components/iq/IQReferralCaptureMount"));
const WelcomeOnboarding = lazy(() => import("@/components/onboarding/WelcomeOnboarding"));
const IQBrainLab = lazy(() => import("@/pages/IQBrainLab"));
const DunningBanner = lazy(() => import("@/components/billing/DunningBanner").then((module) => ({ default: module.DunningBanner })));
const SCABanner = lazy(() => import("@/components/billing/SCABanner").then((module) => ({ default: module.SCABanner })));
const Index = lazy(() => import("./pages/Index"));
const Friends = lazy(() => import("./pages/Friends"));
const NotificationsPage = lazy(() => import("./pages/Notifications"));
const StatusPage = lazy(() => import("./pages/StatusPage"));
const Auth = lazy(() => import("./pages/Auth"));
const Download = lazy(() => import("./pages/Download"));
const VerifyReport = lazy(() => import("./pages/VerifyReport"));
const UsernameRedirect = lazy(() => import("./pages/UsernameRedirect"));
const PublicAIGallery = lazy(() => import("./pages/PublicAIGallery"));

const ProfileRedirect = lazy(() => import("./pages/ProfileRedirect"));
const PropertyFavorites = lazy(() => import("./pages/PropertyFavorites"));
const Roadmap = lazy(() => import("./pages/Roadmap"));
const AdPreview = lazy(() => import("./pages/AdPreview"));
const MobileBottomNav = lazy(() => import("@/components/mobile/MobileBottomNav"));


// Install global runtime patches as early as possible
installGlobalErrorHandlers();
installImagePerformancePatch();
prewarmHotRoutes();

// Critical fallback only - keep heavy pages out of the initial JS boot path
import NotFound from "./pages/NotFound";

// All other pages - lazy loaded
import { ResetPassword,
  AuthCallback,
  Profile,
  EditProfile,
  Settings,
  SecuritySettings,
  Wall,
  SearchResults,
  Contact,
  Terms,
  WallSaved,
  WallVideos,
  PremiumVideos,
  Shorts,
  Pitch,
  Messenger,
  Stories,
  PostDetail,
  Megaforum,
  Megatalent,
  MegatalentCategory,
  MegatalentPost,
  MegatalentSuccess,
  MegatalentBattleResults,
  Verified,
  
  
  PremiumStore,
  Premium,
  AICreditsStore,
  MysteryBox,
  AIGeneration,
  BestFriend,
  AICompanions,
  CompanionChat,
  AIMentor,
  AIMentorChat,
  AIClone,
  
  KidsHomework,
  KidsPuzzles,
  AdultPuzzles,
  
  KidsStoryCreator,
  KidsStoryPricing,
  KidsScienceLab,
  KidsSciencePricing,
  KidsScienceAdmin,
  KidsDrawingBuddy,
  KidsDrawingPricing,
  KidsReadingCompanion,
  KidsReadingPricing,
  KidsAcademy,
  ColoringPages,
  
  TeenCareerCounselor,
  TeenCareerPricing,
  TeenHub,
  TeenHomeworkPro,
  TeenEssayCoach,
  TeenMentalWellness,
  TeenStudyPlanner,
  TeenSkillBuilder,
  TeenSocialCoach,
  KidsChannel,
  KidsShareView,
  ChooseAdventure,
  KidsVoiceChat,
  KidsVoiceChatPricing,
  CreateCharacter,
  CharacterGalleryPage,
  CharacterGallery,
  CharacterBattle,
  EducationalStories,
  BedtimeStories,
  StoryGames,
  KidsPricing,
  StoryVideoDemo,
  StoryGallery,
  SharedStory,
  KidsMagicLibrary,
  KidsParentalDashboard,
  Vacationer,
  Dating,
  FirstAid,
  FitSlim,
  DreamJournal,
  VirtualPet,
  Astrology,
  PetTranslator,
  PetTranslatorPricing,
  PetsHub,
  PetsAchievements,
  Psychology,
  OnlinePsychologist,
  Quiz,
  Wellness,
  SafetyPrevention,
  Cooking,
  CookingAI,
  RecipeGenerator,
  MealPlanner,
  FoodScanner,
  RestaurantAnalyzer,
  ChefChat,
  WinePairing,
  Bazaar,
  Auction,
  MyAuctions,
  PropertyMarketplace,
  PropertySubmission,
  MyProperties,
  StockContentLibrary,
  CouponMarketplace,
  CouponCreate,
  CouponMessages,
  CouponBrandPage,
  AdminCouponDisputes,
  Education,
  CourseDetail,
  GenerateCourses,
  PremiumCourses,
  Masterclasses,
  MasterclassLearning,
  InteractiveWorkshops,
  CertificationPrograms,
  CourseLearning,
  GenericLearning,
  CourseDetailPage,
  CourseLearnPage,
  BecomeCreator,
  InstructorEarnings,
  HowItWorks,
  MyLearning,
  TeacherDashboard,
  TutorialPlatform,
  Games,
  GamesHub,
  Rewards,
  XPAuditLog,
  AdminXPAudit,
  AdminXPReconciliation,
  LiveStream,
  LiveStreamList,
  CharacterArena,
  CharacterInventoryPage,
  CardCollections,
  CardCollectionCategory,
  CardCollectionsGallery,

  BrainDuel,
  VirtualEscapeRoom,
  HorseRacing,
  E2EAnonymousDateMatches,
  ComedyClub,
  ComedianDashboard,
  ComedyLiveShow,
  ComedyLiveViewer,
  LiveConcerts,
  ConcertWatch,
  
  ContentStudio,
  FashionStudio,
  BeautyStudio,
  AITattoo,
  HomeDesigner,
  PlantCare,
  PhotoRestoration,
  AntiqueAppraisal,
  VideoAdGenerator,
  AIVideoCreator,
  PhotoStyler,
  Handwriting,
  CreativeForge,
  Jobs,
  JobDetailPage,
  CompanyProfile,
  CompanyNew,
  JobBoost,
  AIJobDescriptionWriter,
  EmployerDashboard,
  EmployerVerification,
  BrandBuilder,
  BrandBattle,
  BrandArenaHub,
  BrainDuelHub,
  BrandDashboard,
  SponsorRegistration,
  SponsorDashboard,
  MonetizationIdeas,
  InfluKing,
  Referral,
  Earnings,
  InfluencerEarnings,
  CreatorStudio,
  CommunityDetail,
  CreatorDashboard,
  CreatorProfile,
  DiscoverCreators,
  CreatorsLanding,
  FutureFace,
  FairytaleBook,
  GuessAge,
  FaceInsight,

  TimeReversalSubscription,
  TimeReversalSocial,
  TimeReversalDashboard,
  TimeReversalTimeline,
  TimeCapsuleSubscription,
  TimeCapsule,
  PastLife,
  SportsPredictor,
  SportsAdmin,
  AdminSportsMatches,
  MyPurchasedTips,
  TipsterDashboard,
  LotteryAI,
  LotteryHistory,
  ShadowArena,
  ShadowArenaDashboard,
  ShadowArenaSubmitStory,
  ShadowArenaStoryDetail,
  FairyCastles,
  FairyCastleTour,
  FairyAdmin,
  NutritionHub,
  NutritionSubscriptions,
  HealthcareContentLibrary,
  UniversalAnalyzer,
  AnalyzerResult,
  AnalyzerPricing,
  AnalyzerHistory,
  AnalyzerCollections,
  Coffee,
  CoffeeCheckins,
  CoffeeBuddy,
  
  EmotionEconomy,
  HolographicAvatars,
  AboutPlatform,
  HolographicHistory,
  DigitalOffspring,
  CrystalEnergyNetwork,
  CrystalMarketplace,
  PhobiaTrading,
  SecretSanta,
  AnonymousDate,
  LieDetector,
  IQPlatform,
  IQTrophyProfile,
  IQPublicProfile,
  IQLeaderboard,
  CertificateGallery,
  Admin,
  AdminTransactions,
  AdminCorporateInquiries,
  AdminTipsters,
  AdminMasterChefPayouts,
  AdminComedyPayouts,
  AdminInfluencerPayouts,
  AdminBrandCampaigns,
  AdminBrandModeration,
  AdminPlatformEarnings,
  AdminPlatformWithdrawals,
  AdminIQDashboard,
  AdminIQAnalytics,
  AdminVerifications,
  AdminBazaarTrust,
  AdminWithdrawals,
  AdminPaymentDashboard,
  PaymentDocumentation,
  AdminPwaStats,
  QuizCreator,
  QuizTaker,
  Numerology,
  ParallelUniverse,
  MemoryAuctions,
  BrandKits } from "@/routes/lazyPages";

const AdminRefunds = lazy(() => import("@/pages/admin/AdminRefunds"));
// Education vertical
const EducationHub = lazy(() => import("@/pages/education/EducationHub"));
const FlashcardDecks = lazy(() => import("@/pages/education/FlashcardDecks"));
const FlashcardDeckDetail = lazy(() => import("@/pages/education/FlashcardDeckDetail"));
const DailyChallenge = lazy(() => import("@/pages/education/DailyChallenge"));
const EducationLessons = lazy(() => import("@/pages/education/Lessons"));
const EducationLessonDetail = lazy(() => import("@/pages/education/LessonDetail"));
const EduAchievements = lazy(() => import("@/pages/education/Achievements"));
const EduLeague = lazy(() => import("@/pages/education/League"));
const EduMathSolver = lazy(() => import("@/pages/education/MathSolver"));
const EduAITutor = lazy(() => import("@/pages/education/AITutor"));
const EduNotes = lazy(() => import("@/pages/education/Notes"));

const EduCertificates = lazy(() => import("@/pages/education/Certificates"));
const EduCertVerify = lazy(() => import("@/pages/education/CertificateVerify"));
const EduSkillTree = lazy(() => import("@/pages/education/SkillTree"));
const MentorHub = lazy(() => import("@/pages/mentor/MentorHub"));
const MentorPremium = lazy(() => import("@/pages/mentor/MentorPremium"));
const MentorFeature = lazy(() => import("@/pages/mentor/MentorFeature"));
const Mentor360Public = lazy(() => import("@/pages/mentor/Mentor360Public"));
const AdminDisputes = lazy(() => import("@/pages/admin/AdminDisputes"));
const AdminReconciliation = lazy(() => import("@/pages/admin/AdminReconciliation"));
const AdminReferralFraud = lazy(() => import("@/pages/admin/AdminReferralFraud"));
const AdminReferralFunnel = lazy(() => import("@/pages/admin/AdminReferralFunnel"));
const ReferralLeaderboard = lazy(() => import("@/pages/ReferralLeaderboard"));
const AdminSubscriptionAnalytics = lazy(() => import("@/pages/admin/AdminSubscriptionAnalytics"));
const AdminCohortRetention = lazy(() => import("@/pages/admin/AdminCohortRetention"));
const AdminOpsTools = lazy(() => import("@/pages/admin/AdminOpsTools"));
const AdminRewardsSeed = lazy(() => import("@/pages/admin/AdminRewardsSeed"));
const AdminRewardsAudit = lazy(() => import("@/pages/admin/AdminRewardsAudit"));
const MyProgress = lazy(() => import("@/pages/MyProgress"));
const YearWrappedPublic = lazy(() => import("@/pages/YearWrappedPublic"));
const AdminCreditsLedger = lazy(() => import("@/pages/admin/AdminCreditsLedger"));
const MyCreditsLedger = lazy(() => import("@/pages/MyCreditsLedger"));
const LuckyWheel = lazy(() => import("@/pages/LuckyWheel"));
const SpinSolve = lazy(() => import("@/pages/SpinSolve"));
const CreditGifts = lazy(() => import("@/pages/CreditGifts"));
const AdminEngagement = lazy(() => import("@/pages/admin/AdminEngagement"));
const AdminMonetagStats = lazy(() => import("@/pages/admin/AdminMonetagStats"));
const GlobalRewardedAd = lazy(() => import("@/components/ads/GlobalRewardedAd"));
const AdminVitals = lazy(() => import("@/pages/admin/AdminVitals"));
const AdminPerformance = lazy(() => import("@/pages/admin/AdminPerformance"));
const AdminEdgeMonitoring = lazy(() => import("@/pages/admin/AdminEdgeMonitoring"));
const AdminEdgeTester = lazy(() => import("@/pages/admin/AdminEdgeTester"));
const AdminButtonTester = lazy(() => import("@/pages/admin/AdminButtonTester"));
const AdminFanClubVerifyAudit = lazy(() => import("@/pages/admin/AdminFanClubVerifyAudit"));
const AdminClubShipping = lazy(() => import("@/pages/admin/AdminClubShipping"));
const AdminChallengeSubscribers = lazy(() => import("@/pages/admin/AdminChallengeSubscribers"));
const AdminUsersOverview = lazy(() => import("@/pages/admin/AdminUsersOverview"));
const AdminCrawler = lazy(() => import("@/pages/admin/AdminCrawler"));
const BugReportsManager = lazy(() => import("@/pages/admin/BugReportsManager"));
const ReportBug = lazy(() => import("@/pages/ReportBug"));
const MyBugReports = lazy(() => import("@/pages/MyBugReports"));
const Suggestions = lazy(() => import("@/pages/Suggestions"));
const AdminSuggestions = lazy(() => import("@/pages/admin/AdminSuggestions"));

const AdminDunning = lazy(() => import("@/pages/admin/AdminDunning"));
const AdminWinBack = lazy(() => import("@/pages/admin/AdminWinBack"));
const AdminSCA = lazy(() => import("@/pages/admin/AdminSCA"));
const AdminKYC = lazy(() => import("@/pages/admin/AdminKYC"));
const AdminMusicianVerifications = lazy(() => import("@/pages/admin/AdminMusicianVerifications"));
const AdminFounders = lazy(() => import("@/pages/admin/AdminFounders"));
const AdminAffiliateTiers = lazy(() => import("@/pages/admin/AdminAffiliateTiers"));
const AdminContestPeriods = lazy(() => import("@/pages/admin/AdminContestPeriods"));
const AdminPauseOverview = lazy(() => import("@/pages/admin/AdminPauseOverview"));
const AdminSupportInbox = lazy(() => import("@/pages/admin/AdminSupportInbox"));
const AdminErrorLogs = lazy(() => import("@/pages/admin/AdminErrorLogs"));

const AdminRouteErrors = lazy(() => import("@/pages/admin/AdminRouteErrors"));
const AdminClientErrors = lazy(() => import("@/pages/admin/AdminClientErrors"));
const AdminAuditLog = lazy(() => import("@/pages/admin/AdminAuditLog"));
const AdminSecurityScan = lazy(() => import("@/pages/admin/AdminSecurityScan"));
const AdminSmokeTest = lazy(() => import("@/pages/admin/AdminSmokeTest"));
const AdminMegatalentModeration = lazy(() => import("@/pages/admin/AdminMegatalentModeration"));
const AdminBattleRoyalePayouts = lazy(() => import("@/pages/admin/AdminBattleRoyalePayouts"));
const AdminDatingModeration = lazy(() => import("@/pages/admin/AdminDatingModeration"));
const AdminMegatalentPayouts = lazy(() => import("@/pages/admin/AdminMegatalentPayouts"));
const AdminConcertEarnings = lazy(() => import("@/pages/admin/AdminConcertEarnings"));
const AdminPremiumVideos = lazy(() => import("@/pages/admin/AdminPremiumVideos"));
const CouponsMy = lazy(() => import("@/pages/CouponsMy"));

// Tiny redirect helper for /education/course/:courseId → /course/:courseId
const EducationCourseRedirect = () => {
  const { courseId } = useParams<{ courseId: string }>();
  return <Navigate to={`/course/${courseId ?? ""}`} replace />;
};
const CreatorVerification = lazy(() => import("@/pages/CreatorVerification"));
const WinBackOffer = lazy(() => import("@/pages/WinBackOffer"));
const CreatorPayouts = lazy(() => import("@/pages/CreatorPayouts"));
const CreatorAnalytics = lazy(() => import("@/pages/CreatorAnalytics"));
const Billing = lazy(() => import("@/pages/Billing"));
const MySubscriptions = lazy(() => import("@/pages/MySubscriptions"));
const CreatorLiveAnalytics = lazy(() => import("@/pages/CreatorLiveAnalytics"));
const KitchenStarsBattles = lazy(() => import("@/pages/KitchenStarsBattles"));
const ReelBattles = lazy(() => import("@/pages/ReelBattles"));
const LegalPrivacy = lazy(() => import("@/pages/legal/Privacy"));
const LegalRefund = lazy(() => import("@/pages/legal/Refund"));
const LegalCreator = lazy(() => import("@/pages/legal/Creator"));
const LegalCommunity = lazy(() => import("@/pages/legal/Community"));
const EcoChallenge = lazy(() => import("@/pages/EcoChallenge"));
const HealthyChallenge = lazy(() => import("@/pages/HealthyChallenge"));
const HealthyChallengeHistory = lazy(() => import("@/pages/HealthyChallengeHistory"));
const EcoChallengeHistory = lazy(() => import("@/pages/EcoChallengeHistory"));

const queryClient = new QueryClient({ defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false } } });

const App = () => {
  useEffect(() => {
    document.documentElement.lang = "en";
  }, []);

  // A11Y: Auto-detect prefers-reduced-motion and apply system-wide
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = (matches: boolean) => {
      document.body.classList.toggle("reduce-animations", matches);
    };
    apply(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => apply(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} storageKey="unique-theme-v2" forcedTheme={undefined} disableTransitionOnChange>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AuthProvider>
            
            
            
            <Suspense fallback={null}>
              <ReferralCaptureMount />
              <IQReferralCaptureMount />
              <DunningBanner />
              <SCABanner />
              <RealTimeNotificationsMount />
              <GlobalMessageChimeMount />
              <PushNotificationsMount />
              <FanClubAutoResyncMount />
              <WelcomeOnboarding />
              

            </Suspense>
            <AnimationProvider>
              <CurrencyProvider>
              <TooltipProvider delayDuration={0}>
                <SkipLink />
                <Suspense fallback={null}>
                  <ProgressiveOnboarding />
                </Suspense>
                <Toaster />
                <Sonner />
                <div className="flex flex-col min-h-screen">
                  <ErrorBoundary>
                    <Suspense fallback={<div className="h-16 border-b border-border bg-background/95" aria-hidden="true" />}>
                      <Navbar />
                    </Suspense>
                  </ErrorBoundary>
                  <Suspense fallback={null}>
                    <GlobalAnnouncementBanner />
                  </Suspense>
                  {/* GlobalRewardedAd removed — Watch Ad now only renders below the hero on each page via <HeroRewardedAd /> */}
                  <main id="main-content" className="flex-1 pt-16 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
                    <GlobalPaymentCleanup />
                    <GameAdGateHost />


                    <RouteResetErrorBoundary>
                      <Suspense fallback={<PageLoader />}>
                        {/* Router-level SEO injection for AI Tools & Studios category */}
                        <RouteSEO />
                        {/* All routes render inside this Suspense boundary */}
                        <Routes>
                        <Route path="/" element={<Index />} />
                        <Route path="/eco-challenge" element={<EcoChallenge />} />
                        <Route path="/eco" element={<EcoChallenge />} />
                        <Route path="/eco-challenge/history" element={<EcoChallengeHistory />} />
                        <Route path="/healthy-challenge" element={<HealthyChallenge />} />
                        <Route path="/healthy" element={<HealthyChallenge />} />
                        <Route path="/healthy-challenge/history" element={<HealthyChallengeHistory />} />
                        <Route path="/challenges" element={<EcoChallenge />} />
                        <Route path="/education/hub" element={<EducationHub />} />
                        <Route path="/education/flashcards" element={<ProtectedRoute><FlashcardDecks /></ProtectedRoute>} />
                        <Route path="/education/flashcards/:deckId" element={<ProtectedRoute><FlashcardDeckDetail /></ProtectedRoute>} />
                        <Route path="/education/daily" element={<ProtectedRoute><DailyChallenge /></ProtectedRoute>} />
                        <Route path="/education/lessons" element={<EducationLessons />} />
                        <Route path="/education/lessons/:courseKey/:lessonKey" element={<EducationLessonDetail />} />
                        <Route path="/education/achievements" element={<ProtectedRoute><EduAchievements /></ProtectedRoute>} />
                        <Route path="/education/league" element={<EduLeague />} />
                        <Route path="/education/math-solver" element={<ProtectedRoute><EduMathSolver /></ProtectedRoute>} />
                        <Route path="/education/tutor" element={<ProtectedRoute><EduAITutor /></ProtectedRoute>} />
                        <Route path="/education/notes" element={<ProtectedRoute><EduNotes /></ProtectedRoute>} />
                        <Route path="/education/certificates" element={<ProtectedRoute><EduCertificates /></ProtectedRoute>} />
                        <Route path="/education/skill-tree" element={<EduSkillTree />} />
                        <Route path="/education/skill-tree/:subject" element={<EduSkillTree />} />
                        <Route path="/cert/:code" element={<EduCertVerify />} />
                        <Route path="/index" element={<Navigate to="/" replace />} />
                        <Route path="/download" element={<Download />} />
                        <Route path="/club" element={<Club />} />
                        <Route path="/club/checkout/:tier" element={<ClubCheckout />} />
                        <Route path="/club/card" element={<ClubCard />} />
                        <Route path="/subscriptions" element={<ProtectedRoute><Subscriptions /></ProtectedRoute>} />

                        <Route path="/downloads" element={<Navigate to="/download" replace />} />
                        <Route path="/wall" element={<ProtectedRoute><Wall /></ProtectedRoute>} />
                        <Route path="/search" element={<SearchResults />} />
                        <Route path="/wall/messages" element={<Navigate to="/messenger" replace />} />
                        <Route path="/wall/friends" element={<ProtectedRoute><Wall /></ProtectedRoute>} />
                       <Route path="/friends" element={<ProtectedRoute><Friends /></ProtectedRoute>} />
                       <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
                       <Route path="/wall/videos" element={<ProtectedRoute><WallVideos /></ProtectedRoute>} />
                       <Route path="/unlock-videos" element={<ProtectedRoute><PremiumVideos /></ProtectedRoute>} />
                       <Route path="/shorts" element={<ProtectedRoute><Shorts /></ProtectedRoute>} />
                       <Route path="/pitch" element={<Pitch />} />
                       <Route path="/wall/saved" element={<ProtectedRoute><WallSaved /></ProtectedRoute>} />
                        <Route path="/wall/trending" element={<ProtectedRoute><Wall /></ProtectedRoute>} />
                       <Route path="/wall/info" element={<ProtectedRoute><Wall /></ProtectedRoute>} />
                       <Route path="/wall/memories" element={<ProtectedRoute><Wall /></ProtectedRoute>} />
                        <Route path="/wall/more" element={<Navigate to="/wall" replace />} />
                        <Route path="/post/:id" element={<PostDetail />} />
                        <Route path="/messenger" element={<Messenger />} />
                        <Route path="/megatalent" element={<MegatalentGuard><Megatalent /></MegatalentGuard>} />
                        <Route path="/megatalent/post/:id" element={<MegatalentPost />} />
                        <Route path="/megatalent/success" element={<MegatalentSuccess />} />
                        <Route path="/megatalent/battle-results" element={<MegatalentBattleResults />} />
                        <Route path="/megatalent/battle-results/id/:tournamentId" element={<MegatalentBattleResults />} />
                        <Route path="/megatalent/battle-results/:category" element={<MegatalentBattleResults />} />
                        <Route path="/megatalent/:category" element={<MegatalentGuard><MegatalentCategory /></MegatalentGuard>} />
                        <Route path="/megaforum" element={<Megaforum />} />
                        <Route path="/psychologist" element={<Psychology />} />
                        <Route path="/online-psychologist" element={<OnlinePsychologist />} />
                        <Route path="/vacationer" element={<Vacationer />} />
                        <Route path="/dating" element={<Dating />} />
                        <Route path="/first-aid" element={<FirstAid />} />
                        <Route path="/fit-slim" element={<FitSlim />} />
                        <Route path="/marketplace" element={<SkillsMarketplace />} />
                        <Route path="/bazaar" element={<Bazaar />} />
                        <Route path="/bazaar/messages" element={<ProtectedRoute><BazaarMessages /></ProtectedRoute>} />
                        <Route path="/coupon-marketplace" element={<CouponMarketplace />} />
                        <Route path="/coupon-marketplace/create" element={<CouponCreate />} />
                        <Route path="/coupon-marketplace/messages" element={<CouponMessages />} />
                        <Route path="/coupons/season/:slug" element={<CouponSeasonalHub />} />
                        <Route path="/coupons/:brand" element={<CouponBrandPage />} />
                        <Route path="/coupons/my" element={<ProtectedRoute><CouponsMy /></ProtectedRoute>} />
                        <Route path="/coupon-marketplace/my" element={<ProtectedRoute><CouponMy /></ProtectedRoute>} />
                        <Route path="/admin/coupon-disputes" element={<ProtectedRoute requireAdmin={true}><AdminCouponDisputes /></ProtectedRoute>} />
                        <Route path="/admin/megatalent-moderation" element={<ProtectedRoute requireAdmin={true}><AdminMegatalentModeration /></ProtectedRoute>} />
                        <Route path="/admin/megatalent-payouts" element={<ProtectedRoute requireAdmin={true}><AdminMegatalentPayouts /></ProtectedRoute>} />
                        <Route path="/admin/concert-earnings" element={<ProtectedRoute requireAdmin={true}><AdminConcertEarnings /></ProtectedRoute>} />
                        <Route path="/admin/unlock-videos" element={<ProtectedRoute requireAdmin={true}><AdminPremiumVideos /></ProtectedRoute>} />
                        <Route path="/admin/premium-videos" element={<ProtectedRoute requireAdmin={true}><AdminPremiumVideos /></ProtectedRoute>} />

                        <Route path="/admin/battle-royale-payouts" element={<ProtectedRoute requireAdmin={true}><AdminBattleRoyalePayouts /></ProtectedRoute>} />
                        <Route path="/admin/dating-moderation" element={<ProtectedRoute requireAdmin={true}><AdminDatingModeration /></ProtectedRoute>} />
                        <Route path="/referral" element={<Referral />} />
                        <Route path="/games" element={<Games />} />
                        <Route path="/games-hub" element={<GamesHub />} />
                        <Route path="/jobs" element={<Jobs />} />
                        <Route path="/jobs/post/success" element={<Navigate to="/jobs" replace />} />
                        <Route path="/jobs/listing/:slug" element={<JobDetailPage />} />
                        <Route path="/jobs/companies/new" element={<ProtectedRoute><CompanyNew /></ProtectedRoute>} />
                        <Route path="/jobs/companies/:slug" element={<CompanyProfile />} />
                        <Route path="/jobs/boost/:jobId" element={<ProtectedRoute><JobBoost /></ProtectedRoute>} />
                        <Route path="/jobs/ai-jd-writer" element={<ProtectedRoute><AIJobDescriptionWriter /></ProtectedRoute>} />
                        <Route path="/employer-dashboard" element={<ProtectedRoute><EmployerDashboard /></ProtectedRoute>} />
                        <Route path="/admin/verifications" element={<ProtectedRoute requireAdmin={true}><AdminVerifications /></ProtectedRoute>} />
                        <Route path="/admin/bazaar-trust" element={<ProtectedRoute requireAdmin={true}><AdminBazaarTrust /></ProtectedRoute>} />
                        <Route path="/admin/club-shipping" element={<ProtectedRoute requireAdmin={true}><AdminClubShipping /></ProtectedRoute>} />
                        <Route path="/admin/challenge-subscribers" element={<ProtectedRoute requireAdmin={true}><AdminChallengeSubscribers /></ProtectedRoute>} />
                        <Route path="/admin/challenge-subs" element={<ProtectedRoute requireAdmin={true}><AdminChallengeSubscribers /></ProtectedRoute>} />
                        <Route path="/admin/users-overview" element={<ProtectedRoute requireAdmin={true}><AdminUsersOverview /></ProtectedRoute>} />
                        <Route path="/influ-king" element={<InfluKing />} />
                        <Route path="/influ-king/ppv/:id" element={<PPVPost />} />
                        <Route path="/paid-message/success" element={<PaidMessageSuccess />} />
                        <Route path="/paid-message/canceled" element={<PaidMessageSuccess />} />
                        <Route path="/gift/success" element={<GiftSuccess />} />
                        <Route path="/gift/canceled" element={<GiftSuccess />} />
                        <Route path="/gift/history" element={<ProtectedRoute><GiftHistory /></ProtectedRoute>} />
                        <Route path="/gifts/inbox" element={<ProtectedRoute><GiftsInbox /></ProtectedRoute>} />

                        <Route path="/auction" element={<Auction />} />
                        <Route path="/auction/create" element={<ProtectedRoute><AuctionCreate /></ProtectedRoute>} />
                        <Route path="/auction/my" element={<ProtectedRoute><AuctionMy /></ProtectedRoute>} />
                        <Route path="/auction/messages" element={<ProtectedRoute><AuctionMessages /></ProtectedRoute>} />
                        <Route path="/my-auctions" element={<ProtectedRoute><MyAuctions /></ProtectedRoute>} />
                        <Route path="/ai-generation" element={<ProtectedRoute><AIGeneration /></ProtectedRoute>} />
                        <Route path="/best-friend" element={<BestFriend />} />
                        <Route path="/cooking" element={<Cooking />} />
                        <Route path="/cooking-ai" element={<CookingAI />} />
                        <Route path="/recipe-generator" element={<RecipeGenerator />} />
                        <Route path="/meal-planner" element={<MealPlanner />} />
                        <Route path="/food-scanner" element={<FoodScanner />} />
                        <Route path="/restaurant-analyzer" element={<RestaurantAnalyzer />} />
                        <Route path="/chef-chat" element={<ChefChat />} />
                        <Route path="/wine-pairing" element={<WinePairing />} />
                        <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><Admin /></ProtectedRoute>} />
                        <Route path="/admin/masterchef-payouts" element={<ProtectedRoute requireAdmin={true}><AdminMasterChefPayouts /></ProtectedRoute>} />
                        <Route path="/admin/comedy-payouts" element={<ProtectedRoute requireAdmin={true}><AdminComedyPayouts /></ProtectedRoute>} />
                        <Route path="/admin/brand-campaigns" element={<ProtectedRoute requireAdmin={true}><AdminBrandCampaigns /></ProtectedRoute>} />
                        <Route path="/admin/brand-moderation" element={<ProtectedRoute requireAdmin={true}><AdminBrandModeration /></ProtectedRoute>} />
                       <Route path="/contact" element={<Contact />} />
                       <Route path="/status" element={<StatusPage />} />
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/terms" element={<Terms />} />
                        <Route path="/legal/terms" element={<Navigate to="/terms" replace />} />
                        <Route path="/legal/privacy" element={<LegalPrivacy />} />
                        <Route path="/legal/cookies" element={<Navigate to="/legal/privacy" replace />} />
                        <Route path="/legal/refund" element={<LegalRefund />} />
                        <Route path="/legal/creator" element={<LegalCreator />} />
                        <Route path="/legal/community" element={<LegalCommunity />} />
                        <Route path="/education" element={<Education />} />
                        <Route path="/quiz/create" element={<QuizCreator />} />
                        <Route path="/quiz/:quizId" element={<QuizTaker />} />
                        <Route path="/legacy-course/:courseName" element={<CourseDetail />} />
                        <Route path="/quiz" element={<Quiz />} />
                        <Route path="/profile" element={<ProfileRedirect />} />
                        <Route path="/profile/edit" element={<Navigate to="/edit-profile" replace />} />
                        <Route path="/profile/:userId" element={<Profile />} />
                        <Route path="/u/:userId/ai-gallery" element={<PublicAIGallery />} />
                        <Route path="/u/:username" element={<UsernameRedirect />} />

                        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
                        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                        <Route path="/settings/security" element={<ProtectedRoute><SecuritySettings /></ProtectedRoute>} />
                        <Route path="/subscription" element={<Navigate to="/ai-credits-store" replace />} />
                        <Route path="/verified" element={<Verified />} />
                        
                        <Route path="/pricing" element={<Navigate to="/ai-credits-store" replace />} />
                        <Route path="/plans" element={<Navigate to="/ai-credits-store" replace />} />
                        <Route path="/upgrade" element={<Navigate to="/ai-credits-store" replace />} />
                        
                        <Route path="/prices" element={<Navigate to="/ai-credits-store" replace />} />
                        <Route path="/billing" element={<Navigate to="/ai-credits-store" replace />} />
                        <Route path="/membership" element={<Navigate to="/ai-credits-store" replace />} />

                        <Route path="/premium-plans" element={<Navigate to="/premium" replace />} />
                        <Route path="/ai-credits-store" element={<AICreditsStore />} />
                        <Route path="/ai-credits" element={<AICreditsStore />} />
                        <Route path="/credits" element={<Navigate to="/ai-credits" replace />} />
                        <Route path="/credits/buy" element={<Navigate to="/ai-credits" replace />} />
                        <Route path="/credits/history" element={<ProtectedRoute><MyCreditsLedger /></ProtectedRoute>} />
                        <Route path="/my-credits-history" element={<ProtectedRoute><MyCreditsLedger /></ProtectedRoute>} />
                        <Route path="/lucky-wheel" element={<ProtectedRoute><LuckyWheel /></ProtectedRoute>} />
                        <Route path="/spin-solve" element={<ProtectedRoute><SpinSolve /></ProtectedRoute>} />
                        <Route path="/wheel-of-fortune" element={<Navigate to="/spin-solve" replace />} />
                        <Route path="/credit-gifts" element={<ProtectedRoute><CreditGifts /></ProtectedRoute>} />
                        <Route path="/admin/transactions" element={<ProtectedRoute requireAdmin={true}><AdminTransactions /></ProtectedRoute>} />
                        <Route path="/admin/corporate-inquiries" element={<ProtectedRoute requireAdmin={true}><AdminCorporateInquiries /></ProtectedRoute>} />
                        <Route path="/admin/tipsters" element={<ProtectedRoute requireAdmin={true}><AdminTipsters /></ProtectedRoute>} />
                        <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
                        <Route path="/livestream" element={<LiveStreamList />} />
                        <Route path="/live/:streamId" element={<LiveStream />} />
                        <Route path="/creator/live-analytics" element={<CreatorLiveAnalytics />} />
                        <Route path="/stories" element={<Navigate to="/messenger" replace />} />
                        <Route path="/stories/:userId" element={<Stories />} />
                        <Route path="/rewards" element={<Rewards />} />
                        <Route path="/rewards/audit" element={<ProtectedRoute><XPAuditLog /></ProtectedRoute>} />
                        <Route path="/my-progress" element={<ProtectedRoute><MyProgress /></ProtectedRoute>} />
                        <Route path="/wrapped/:slug" element={<YearWrappedPublic />} />
                        <Route path="/admin/xp-audit" element={<ProtectedRoute><AdminXPAudit /></ProtectedRoute>} />
                        <Route path="/admin/xp-audit/reconciliation" element={<ProtectedRoute requireAdmin={true}><AdminXPReconciliation /></ProtectedRoute>} />
                        <Route path="/admin/rewards-audit" element={<ProtectedRoute><AdminRewardsAudit /></ProtectedRoute>} />
                        <Route path="/admin/credits-ledger" element={<ProtectedRoute requireAdmin={true}><AdminCreditsLedger /></ProtectedRoute>} />
                        <Route path="/generate-courses" element={<GenerateCourses />} />
                        <Route path="/premium-store" element={<PremiumStore />} />
                        <Route path="/premium" element={<Premium />} />
                        <Route path="/ai-mentor" element={<AIMentor />} />
                        <Route path="/ai-mentor/hub" element={<ProtectedRoute><MentorHub /></ProtectedRoute>} />
                        <Route path="/ai-mentor/premium" element={<ProtectedRoute><MentorPremium /></ProtectedRoute>} />
                        <Route path="/ai-mentor/tools/:feature" element={<ProtectedRoute><MentorFeature /></ProtectedRoute>} />
                        <Route path="/mentor-360/:token" element={<Mentor360Public />} />
                        <Route path="/ai-mentor/:area" element={<AIMentorChat />} />
                        <Route path="/content-studio" element={<ContentStudio />} />
                        <Route path="/companions" element={<AICompanions />} />
                        <Route path="/companions/:conversationId" element={<CompanionChat />} />
                        <Route path="/dream-journal" element={<DreamJournal />} />
                        <Route path="/virtual-pet" element={<VirtualPet />} />
                        <Route path="/astrology" element={<Astrology />} />
                        <Route path="/character-arena" element={<CharacterArena />} />
                        <Route path="/character-inventory" element={<CharacterInventoryPage />} />
                        <Route path="/card-collections" element={<CardCollections />} />
                        <Route path="/card-collections/gallery" element={<CardCollectionsGallery />} />
                        <Route path="/card-collections/:slug" element={<CardCollectionCategory />} />


                        <Route path="/arena-hub" element={<Navigate to="/character-arena" replace />} />
                        <Route path="/mystery-box" element={<MysteryBox />} />
                       <Route path="/pet-translator" element={<PetTranslator />} />
                       <Route path="/pet-translator-pricing" element={<PetTranslatorPricing />} />
                       <Route path="/pets" element={<PetsHub />} />
                       <Route path="/pets/achievements" element={<ProtectedRoute><PetsAchievements /></ProtectedRoute>} />
                        <Route path="/future-face" element={<FutureFace />} />
                        <Route path="/fairytale-book" element={<FairytaleBook />} />
                        <Route path="/guess-age" element={<GuessAge />} />
                        <Route path="/face-insight" element={<FaceInsight />} />

                        <Route path="/skill-swap" element={<Navigate to="/marketplace" replace />} />
                        <Route path="/skill-swap/*" element={<Navigate to="/marketplace" replace />} />

                       <Route path="/skills-marketplace" element={<Navigate to="/marketplace" replace />} />
                       <Route path="/skills-marketplace/new" element={<ProtectedRoute><SkillsMarketplaceCreate /></ProtectedRoute>} />
                       <Route path="/skills-marketplace/orders" element={<ProtectedRoute><SkillsMarketplaceOrders /></ProtectedRoute>} />
                       <Route path="/skills-marketplace/orders/success" element={<ProtectedRoute><SkillsMarketplaceOrderSuccess /></ProtectedRoute>} />
                       <Route path="/skills-marketplace/orders/:id" element={<ProtectedRoute><SkillsMarketplaceOrderDetail /></ProtectedRoute>} />
                       <Route path="/skills-marketplace/mine" element={<ProtectedRoute><SkillsMarketplaceMine /></ProtectedRoute>} />
                       <Route path="/skills-marketplace/provider/:userId" element={<SkillsMarketplaceProvider />} />
                       <Route path="/skills-marketplace/:id/edit" element={<ProtectedRoute><SkillsMarketplaceEdit /></ProtectedRoute>} />
                       <Route path="/skills-marketplace/:id" element={<SkillOfferingDetail />} />
                       <Route path="/admin/skills-reviews" element={<ProtectedRoute><AdminSkillsReviewModeration /></ProtectedRoute>} />
                        
                        <Route path="/wellness" element={<Wellness />} />
                        <Route path="/safety-prevention" element={<SafetyPrevention />} />
                        <Route path="/handwriting" element={<Handwriting />} />
                        <Route path="/past-life" element={<PastLife />} />
                        <Route path="/anonymous-date" element={<AnonymousDate />} />
                        <Route path="/anonymous-dating" element={<Navigate to="/anonymous-date" replace />} />
                        <Route path="/dating/anonymous" element={<Navigate to="/anonymous-date" replace />} />
                        <Route path="/beauty" element={<Navigate to="/beauty-studio" replace />} />
                        <Route path="/music" element={<Navigate to="/music-production" replace />} />
                        <Route path="/sports" element={<Navigate to="/sports-predictor" replace />} />
                        <Route path="/investment" element={<Navigate to="/financial-investment" replace />} />
                        <Route path="/ai" element={<Navigate to="/ai-credits-store" replace />} />
                        <Route path="/jobs/employer" element={<Navigate to="/employer-dashboard" replace />} />
                        <Route path="/education/course/:courseId" element={<EducationCourseRedirect />} />
                        <Route path="/education/my-courses" element={<Navigate to="/my-learning" replace />} />
                        <Route path="/education/teach" element={<Navigate to="/teacher-dashboard" replace />} />
                        <Route path="/account/billing" element={<Navigate to="/ai-credits-store" replace />} />
                        <Route path="/account/credits" element={<Navigate to="/credits/history" replace />} />
                        <Route path="/account/parental" element={<Navigate to="/kids-channel/parental-dashboard" replace />} />
                        <Route path="/megatalent/go-live" element={<Navigate to="/megatalent" replace />} />
                        <Route path="/megatalent/my-submissions" element={<Navigate to="/creator-dashboard" replace />} />
                        <Route path="/megatalent/watch-party/:id" element={<Navigate to="/megatalent" replace />} />
                        <Route path="/teen/confessions" element={<Navigate to="/teen-hub" replace />} />
                        <Route path="/kitchenstars/recipes" element={<Navigate to="/masterchef/recipe-feed" replace />} />
                        <Route path="/kitchenstars/my-cookbook" element={<Navigate to="/masterchef" replace />} />
                        <Route path="/bazaar/create" element={<BazaarCreate />} />
                        <Route path="/promotions" element={<ProtectedRoute><PromotionsBoard /></ProtectedRoute>} />
                        <Route path="/promotions/new" element={<ProtectedRoute><PromotionsCreate /></ProtectedRoute>} />
                        <Route path="/promotions/success" element={<ProtectedRoute><PromotionsSuccess /></ProtectedRoute>} />
                        <Route path="/promotions/mine" element={<ProtectedRoute><MyPromotions /></ProtectedRoute>} />
                        <Route path="/bazaar/saved-searches" element={<BazaarSavedSearches />} />
                        <Route path="/bazaar/my" element={<ProtectedRoute><BazaarMy /></ProtectedRoute>} />
                        <Route path="/investment/portfolio" element={<InvestmentPortfolio />} />
                        <Route path="/lie-detector" element={<LieDetector />} />
                        <Route path="/verify-report" element={<VerifyReport />} />
                        <Route path="/secret-santa" element={<SecretSanta />} />
                        
                        <Route path="/brand-builder" element={<BrandBuilder />} />
                        <Route path="/home-designer" element={<HomeDesigner />} />
                        <Route path="/beauty-studio" element={<BeautyStudio />} />
                        
                        <Route path="/plant-care" element={<PlantCare />} />
                        <Route path="/ai-tattoo" element={<AITattoo />} />
                        <Route path="/kids-homework" element={<KidsGoldPassGate moduleName="Homework Helper" pricingPath="/kids-pricing" redirectPath="/kids-homework"><KidsHomework /></KidsGoldPassGate>} />
                        <Route path="/kids-homework-pricing" element={<Navigate to="/ai-credits" replace />} />
                        
                        <Route path="/kids-story-creator" element={<KidsGoldPassGate moduleName="Story Creator" pricingPath="/kids-pricing" creditTable="kids_story_credits" redirectPath="/kids-story-creator"><KidsStoryCreator /></KidsGoldPassGate>} />
                        <Route path="/kids-story-pricing" element={<Navigate to="/ai-credits" replace />} />
                        <Route path="/kids-science-lab" element={<KidsGoldPassGate moduleName="Science Lab" pricingPath="/kids-pricing" creditTable="science_credits" redirectPath="/kids-science-lab"><KidsScienceLab /></KidsGoldPassGate>} />
                        <Route path="/kids-science-pricing" element={<Navigate to="/ai-credits" replace />} />
                        <Route path="/kids-science-admin" element={<ProtectedRoute requireAdmin={true}><KidsScienceAdmin /></ProtectedRoute>} />
                        <Route path="/kids-drawing-buddy" element={<KidsGoldPassGate moduleName="Drawing Buddy" pricingPath="/kids-pricing" creditTable="kids_drawing_credits" redirectPath="/kids-drawing-buddy"><KidsDrawingBuddy /></KidsGoldPassGate>} />
                        <Route path="/kids-drawing-pricing" element={<Navigate to="/ai-credits" replace />} />
                        <Route path="/kids-reading-companion" element={<KidsGoldPassGate moduleName="Reading Companion" pricingPath="/kids-pricing" creditTable="kids_reading_credits" redirectPath="/kids-reading-companion"><KidsReadingCompanion /></KidsGoldPassGate>} />
                        <Route path="/kids-reading-pricing" element={<Navigate to="/ai-credits" replace />} />
                        <Route path="/kids" element={<Navigate to="/kids-academy" replace />} />
                        <Route path="/kids-academy" element={<KidsAcademy />} />
                        <Route path="/kids-puzzles" element={<KidsPuzzles />} />
                        <Route path="/adult-puzzles" element={<AdultPuzzles />} />
                        <Route path="/photo-restoration" element={<PhotoRestoration />} />
                        <Route path="/antique-appraisal" element={<AntiqueAppraisal />} />
                        <Route path="/teen-career-counselor" element={<TeenCareerCounselor />} />
                        <Route path="/teen-career-pricing" element={<Navigate to="/ai-credits" replace />} />
                        <Route path="/teen" element={<Navigate to="/teen-hub" replace />} />
                        <Route path="/teen-hub" element={<TeenHub />} />
                        <Route path="/teen-homework-pro" element={<TeenHomeworkPro />} />
                        <Route path="/teen-essay-coach" element={<TeenEssayCoach />} />
                        <Route path="/teen-mental-wellness" element={<TeenMentalWellness />} />
                        <Route path="/teen-study-planner" element={<TeenStudyPlanner />} />
                        <Route path="/teen-skill-builder" element={<TeenSkillBuilder />} />
                        <Route path="/teen-social-coach" element={<TeenSocialCoach />} />
                        <Route path="/premium-courses" element={<PremiumCourses />} />
                        <Route path="/masterclasses" element={<Masterclasses />} />
                        <Route path="/masterclass/:masterclassId" element={<MasterclassLearning />} />
                        <Route path="/interactive-workshops" element={<InteractiveWorkshops />} />
                        <Route path="/certification-programs" element={<CertificationPrograms />} />
                        <Route path="/certification-learn/:certificationId" element={<CourseLearning />} />
                        <Route path="/language-learning" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/language/:contentId" element={<GenericLearning />} />
                        <Route path="/fitness/:contentId" element={<GenericLearning />} />
                        <Route path="/digital-marketing" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/marketing/:contentId" element={<GenericLearning />} />
                        <Route path="/photography" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/photography/:contentId" element={<GenericLearning />} />
                        <Route path="/culinary-arts" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/culinary/:contentId" element={<GenericLearning />} />
                        <Route path="/music-production" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/music/:contentId" element={<GenericLearning />} />
                        <Route path="/graphic-design" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/design/:contentId" element={<GenericLearning />} />
                        <Route path="/public-speaking" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/speaking/:contentId" element={<GenericLearning />} />
                        <Route path="/financial-investment" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/investment/:contentId" element={<GenericLearning />} />
                        <Route path="/creative-writing" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/writing/:contentId" element={<GenericLearning />} />
                        <Route path="/creative-forge" element={<ProtectedRoute><CreativeForge /></ProtectedRoute>} />
                        <Route path="/coloring-pages" element={<KidsGoldPassGate moduleName="Coloring Pages" redirectPath="/coloring-pages"><KidsParentalGateGuard featureName="Coloring Pages" storageKey="pg_coloring"><ColoringPages /></KidsParentalGateGuard></KidsGoldPassGate>} />

                        <Route path="/for-schools" element={<Navigate to="/coloring-pages?tab=schools" replace />} />
                        <Route path="/for-healthcare" element={<Navigate to="/coloring-pages?tab=healthcare" replace />} />
                        <Route path="/for-business" element={<Navigate to="/coloring-pages?tab=corporate" replace />} />

                        <Route path="/schools" element={<Navigate to="/coloring-pages" replace />} />
                        <Route path="/healthcare" element={<Navigate to="/wellness" replace />} />
                        <Route path="/corporate-events" element={<Navigate to="/coloring-pages" replace />} />
                        <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
                        <Route path="/healthcare-dashboard" element={<Navigate to="/wellness" replace />} />
                        <Route path="/healthcare-library" element={<HealthcareContentLibrary />} />
                        {/* Booking Center & Book & Glow (services) removed */}
                        <Route path="/booking" element={<Navigate to="/" replace />} />
                        <Route path="/doctors/*" element={<Navigate to="/" replace />} />
                        <Route path="/doctor-dashboard" element={<Navigate to="/" replace />} />
                        <Route path="/my-bookings/doctors" element={<Navigate to="/" replace />} />
                        <Route path="/my-health/*" element={<Navigate to="/wellness" replace />} />

                        <Route path="/services-hub" element={<Navigate to="/" replace />} />
                        <Route path="/services/*" element={<Navigate to="/" replace />} />
                        <Route path="/services" element={<Navigate to="/" replace />} />
                        <Route path="/my-bookings/services" element={<Navigate to="/" replace />} />

                        <Route path="/brand-battle" element={<ProtectedRoute requireAdmin={true}><BrandBattle /></ProtectedRoute>} />
                        <Route path="/brand-battle/hub" element={<ProtectedRoute requireAdmin={true}><BrandArenaHub /></ProtectedRoute>} />
                        <Route path="/sponsor-registration" element={<ProtectedRoute requireAdmin={true}><SponsorRegistration /></ProtectedRoute>} />
                        <Route path="/sponsor-dashboard" element={<ProtectedRoute requireAdmin={true}><SponsorDashboard /></ProtectedRoute>} />
                        <Route path="/brain-duel" element={<ProtectedRoute><BrainDuel /></ProtectedRoute>} />
                        <Route path="/brain-duel/hub" element={<ProtectedRoute><BrainDuelHub /></ProtectedRoute>} />
                        <Route path="/fashion-studio" element={<FashionStudio />} />
                        <Route path="/nutrition-hub" element={<NutritionHub />} />
                        <Route path="/nutrition-subscriptions" element={<NutritionSubscriptions />} />
                        <Route path="/analyzer" element={<UniversalAnalyzer />} />
                        <Route path="/analyzer/result/:id" element={<AnalyzerResult />} />
                        <Route path="/analyzer/pricing" element={<AnalyzerPricing />} />
                        <Route path="/analyzer/history" element={<AnalyzerHistory />} />
                        <Route path="/analyzer/collections" element={<AnalyzerCollections />} />
                        <Route path="/video-ad-generator" element={<VideoAdGenerator />} />
                        <Route path="/ai-video-creator" element={<AIVideoCreator />} />
                        <Route path="/photo-styler" element={<PhotoStyler />} />
                        <Route path="/kids-channel" element={<KidsChannel />} />
                        <Route path="/kids-channel/share/:token" element={<KidsShareView />} />
                        <Route path="/choose-adventure" element={<ChooseAdventure />} />
                        <Route path="/kids-voice-chat" element={<KidsGoldPassGate moduleName="Character Chat" pricingPath="/kids-pricing" redirectPath="/kids-voice-chat"><KidsVoiceChat /></KidsGoldPassGate>} />
                        <Route path="/kids-voice-chat-pricing" element={<Navigate to="/ai-credits" replace />} />
                        <Route path="/create-character" element={<CreateCharacter />} />
                        <Route path="/educational-stories" element={<EducationalStories />} />
                        <Route path="/bedtime-stories" element={<KidsGoldPassGate moduleName="Bedtime Stories" redirectPath="/bedtime-stories"><KidsParentalGateGuard featureName="Bedtime Stories" storageKey="pg_bedtime"><BedtimeStories /></KidsParentalGateGuard></KidsGoldPassGate>} />
                        <Route path="/story-games" element={<StoryGames />} />
                        <Route path="/kids-pricing" element={<Navigate to="/ai-credits" replace />} />
                        <Route path="/story-video-demo" element={<KidsGoldPassGate moduleName="Story Videos" redirectPath="/story-video-demo"><StoryVideoDemo /></KidsGoldPassGate>} />
                        <Route path="/story-gallery" element={<StoryGallery />} />
                        <Route path="/shared/:shareCode" element={<SharedStory />} />
                        <Route path="/kids-channel/my-gallery" element={<ProtectedRoute><KidsParentalGateGuard featureName="Magic Library" storageKey="pg_magic_library"><KidsMagicLibrary /></KidsParentalGateGuard></ProtectedRoute>} />
                        <Route path="/kids-channel/parental-dashboard" element={<ProtectedRoute><KidsParentalDashboard /></ProtectedRoute>} />
                        <Route path="/coffee" element={<Coffee />} />
                        <Route path="/coffee/checkins" element={<CoffeeCheckins />} />
                        <Route path="/coffee/buddy" element={<CoffeeBuddy />} />
                        <Route path="/ai-clone" element={<AIClone />} />
                        
                        <Route path="/lottery-history" element={<LotteryHistory />} />
                        <Route path="/emotion-economy" element={<EmotionEconomy />} />
                        <Route path="/close-friends" element={<Friends />} />
                        <Route path="/community/:id" element={<CommunityDetail />} />
                        <Route path="/creators" element={<CreatorsLanding />} />
                        <Route path="/discover-creators" element={<DiscoverCreators />} />
                        <Route path="/creator-dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
                        <Route path="/creator/:creatorId" element={<CreatorProfile />} />
                        <Route path="/become-creator" element={<BecomeCreator />} />
                        <Route path="/instructor-earnings" element={<ProtectedRoute><InstructorEarnings /></ProtectedRoute>} />
                        <Route path="/admin/withdrawals" element={<ProtectedRoute requireAdmin={true}><AdminWithdrawals /></ProtectedRoute>} />
                        <Route path="/admin/support" element={<ProtectedRoute requireAdmin={true}><AdminSupportInbox /></ProtectedRoute>} />
                        <Route path="/admin/error-logs" element={<ProtectedRoute requireAdmin={true}><AdminErrorLogs /></ProtectedRoute>} />

                        <Route path="/admin/route-errors" element={<ProtectedRoute requireAdmin={true}><AdminRouteErrors /></ProtectedRoute>} />
                        <Route path="/admin/client-errors" element={<ProtectedRoute requireAdmin={true}><AdminClientErrors /></ProtectedRoute>} />
                        <Route path="/admin/audit-log" element={<ProtectedRoute requireAdmin={true}><AdminAuditLog /></ProtectedRoute>} />
                        <Route path="/admin/security-scan" element={<ProtectedRoute requireAdmin={true}><AdminSecurityScan /></ProtectedRoute>} />
                        <Route path="/admin/smoke-test" element={<ProtectedRoute requireAdmin={true}><AdminSmokeTest /></ProtectedRoute>} />
                        <Route path="/admin/influencer-payouts" element={<ProtectedRoute requireAdmin={true}><AdminInfluencerPayouts /></ProtectedRoute>} />
                        <Route path="/admin/platform-earnings" element={<ProtectedRoute requireAdmin={true}><AdminPlatformEarnings /></ProtectedRoute>} />
                        <Route path="/admin/platform-withdrawals" element={<ProtectedRoute requireAdmin={true}><AdminPlatformWithdrawals /></ProtectedRoute>} />
                        <Route path="/admin/iq" element={<ProtectedRoute requireAdmin={true}><AdminIQDashboard /></ProtectedRoute>} />
                        <Route path="/admin/iq-analytics" element={<ProtectedRoute requireAdmin={true}><AdminIQAnalytics /></ProtectedRoute>} />
                        <Route path="/admin/refunds" element={<ProtectedRoute requireAdmin={true}><AdminRefunds /></ProtectedRoute>} />
                        <Route path="/admin/disputes" element={<ProtectedRoute requireAdmin={true}><AdminDisputes /></ProtectedRoute>} />
                        <Route path="/admin/reconciliation" element={<ProtectedRoute requireAdmin={true}><AdminReconciliation /></ProtectedRoute>} />
                        <Route path="/admin/referral-fraud" element={<ProtectedRoute requireAdmin={true}><AdminReferralFraud /></ProtectedRoute>} />
                        <Route path="/admin/referral-funnel" element={<ProtectedRoute requireAdmin={true}><AdminReferralFunnel /></ProtectedRoute>} />
                        <Route path="/referrals/leaderboard" element={<ReferralLeaderboard />} />
                        <Route path="/admin/subscription-analytics" element={<ProtectedRoute requireAdmin={true}><AdminSubscriptionAnalytics /></ProtectedRoute>} />
                        <Route path="/admin/cohort-retention" element={<ProtectedRoute requireAdmin={true}><AdminCohortRetention /></ProtectedRoute>} />
                        <Route path="/admin/ops-tools" element={<ProtectedRoute requireAdmin={true}><AdminOpsTools /></ProtectedRoute>} />
                        <Route path="/admin/rewards-seed" element={<ProtectedRoute requireAdmin={true}><AdminRewardsSeed /></ProtectedRoute>} />
                        <Route path="/admin/engagement" element={<ProtectedRoute requireAdmin={true}><AdminEngagement /></ProtectedRoute>} />
                        <Route path="/admin/monetag-stats" element={<ProtectedRoute requireAdmin={true}><AdminMonetagStats /></ProtectedRoute>} />
                        <Route path="/admin/vitals" element={<ProtectedRoute requireAdmin={true}><AdminVitals /></ProtectedRoute>} />
                        <Route path="/admin/performance" element={<ProtectedRoute requireAdmin={true}><AdminPerformance /></ProtectedRoute>} />
                        <Route path="/admin/edge-monitoring" element={<ProtectedRoute requireAdmin={true}><AdminEdgeMonitoring /></ProtectedRoute>} />
                        <Route path="/admin/edge-tester" element={<ProtectedRoute requireAdmin={true}><AdminEdgeTester /></ProtectedRoute>} />
                        <Route path="/admin/button-tester" element={<ProtectedRoute requireAdmin={true}><AdminButtonTester /></ProtectedRoute>} />
                        <Route path="/admin/fanclub-verify-audit" element={<ProtectedRoute requireAdmin={true}><AdminFanClubVerifyAudit /></ProtectedRoute>} />
                        <Route path="/admin/crawler" element={<ProtectedRoute requireAdmin={true}><AdminCrawler /></ProtectedRoute>} />

                        <Route path="/admin/bug-reports" element={<ProtectedRoute requireAdmin={true}><BugReportsManager /></ProtectedRoute>} />
                        <Route path="/report-bug" element={<ReportBug />} />
                        <Route path="/my-bug-reports" element={<ProtectedRoute><MyBugReports /></ProtectedRoute>} />


                        <Route path="/admin/pwa-stats" element={<ProtectedRoute requireAdmin={true}><AdminPwaStats /></ProtectedRoute>} />
                        <Route path="/admin/dunning" element={<ProtectedRoute requireAdmin={true}><AdminDunning /></ProtectedRoute>} />
                        <Route path="/admin/winback" element={<ProtectedRoute requireAdmin={true}><AdminWinBack /></ProtectedRoute>} />
                        <Route path="/admin/sca" element={<ProtectedRoute requireAdmin={true}><AdminSCA /></ProtectedRoute>} />
                        <Route path="/admin/kyc" element={<ProtectedRoute requireAdmin={true}><AdminKYC /></ProtectedRoute>} />
                        <Route path="/admin/musician-verifications" element={<ProtectedRoute requireAdmin={true}><AdminMusicianVerifications /></ProtectedRoute>} />
                        <Route path="/admin/founders" element={<ProtectedRoute requireAdmin={true}><AdminFounders /></ProtectedRoute>} />
<Route path="/admin/affiliate-tiers" element={<ProtectedRoute requireAdmin={true}><AdminAffiliateTiers /></ProtectedRoute>} />
<Route path="/admin/contest-periods" element={<ProtectedRoute requireAdmin={true}><AdminContestPeriods /></ProtectedRoute>} />
                        <Route path="/admin/pauses" element={<ProtectedRoute requireAdmin={true}><AdminPauseOverview /></ProtectedRoute>} />
                        <Route path="/account/verification" element={<ProtectedRoute><CreatorVerification /></ProtectedRoute>} />
                        <Route path="/winback/:token" element={<WinBackOffer />} />
                        <Route path="/admin/payment-dashboard" element={<ProtectedRoute requireAdmin={true}><AdminPaymentDashboard /></ProtectedRoute>} />
                        <Route path="/creator-payouts" element={<ProtectedRoute><CreatorPayouts /></ProtectedRoute>} />
                        <Route path="/creator-analytics" element={<ProtectedRoute><CreatorAnalytics /></ProtectedRoute>} />
                        <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
                        <Route path="/account/subscriptions" element={<ProtectedRoute><MySubscriptions /></ProtectedRoute>} />
                        <Route path="/payment-documentation" element={<PaymentDocumentation />} />
                        <Route path="/course/:courseId" element={<CourseDetailPage />} />
                        <Route path="/course/:courseId/learn" element={<CourseLearnPage />} />
                        <Route path="/tutorial-course/:courseId" element={<CourseDetailPage />} />
                        <Route path="/tutorial-course/:courseId/learn" element={<CourseLearnPage />} />
                        <Route path="/lottery-ai" element={<LotteryAI />} />
                        <Route path="/brand-dashboard" element={<ProtectedRoute><BrandDashboard /></ProtectedRoute>} />
                        <Route path="/stock-content-library" element={<StockContentLibrary />} />
                        <Route path="/tutorial-platform" element={<TutorialPlatform />} />
                        <Route path="/monetization-ideas" element={<MonetizationIdeas />} />
                        <Route path="/shadow-arena" element={<ShadowArena />} />
                        <Route path="/shadow-arena/dashboard" element={<ShadowArenaDashboard />} />
                        <Route path="/shadow-arena/submit-story" element={<ShadowArenaSubmitStory />} />
                        <Route path="/shadow-arena/story/:storyId" element={<ShadowArenaStoryDetail />} />
                        <Route path="/virtual-escape-room" element={<VirtualEscapeRoom />} />
                        <Route path="/horse-racing" element={<HorseRacing />} />
                        <Route path="/comedy-club" element={<ComedyClub />} />
                        <Route path="/comedian-dashboard" element={<ProtectedRoute><ComedianDashboard /></ProtectedRoute>} />
                        <Route path="/comedy-live/:showId" element={<ComedyLiveShow />} />
                        <Route path="/comedy-watch/:showId" element={<ComedyLiveViewer />} />
                        <Route path="/kids-channel/fairy-castles" element={<KidsGoldPassGate moduleName="Fairy Castles" redirectPath="/kids-channel/fairy-castles"><KidsParentalGateGuard featureName="Fairy Castles" storageKey="pg_fairy_castles"><FairyCastles /></KidsParentalGateGuard></KidsGoldPassGate>} />
                        <Route path="/kids-channel/fairy-castles/:castleId" element={<KidsGoldPassGate moduleName="Fairy Castles" redirectPath="/kids-channel/fairy-castles"><KidsParentalGateGuard featureName="Fairy Castles" storageKey="pg_fairy_castles"><FairyCastleTour /></KidsParentalGateGuard></KidsGoldPassGate>} />
                        <Route path="/kids-channel/fairy-admin" element={<ProtectedRoute requireAdmin={true}><FairyAdmin /></ProtectedRoute>} />
                        <Route path="/kids-channel/certificate-gallery" element={<CertificateGallery />} />
                        <Route path="/numerology" element={<Numerology />} />
                        <Route path="/parallel-universe" element={<ParallelUniverse />} />
                        <Route path="/memory-auctions" element={<MemoryAuctions />} />
                        <Route path="/brand-kits" element={<BrandKits />} />

                        {/* KitchenStars — single Competitions page (video duels) */}
                        <Route path="/masterchef-subscription" element={<ProtectedRoute><KitchenStarsBattles /></ProtectedRoute>} />
                        <Route path="/masterchef/competitions" element={<Navigate to="/masterchef" replace />} />

                        <Route path="/influencer/earnings" element={<ProtectedRoute><InfluencerEarnings /></ProtectedRoute>} />
                        <Route path="/creator-studio" element={<ProtectedRoute><CreatorStudio /></ProtectedRoute>} />
                        <Route path="/time-reversal-subscription" element={<Navigate to="/time-reversal" replace />} />
                        <Route path="/time-reversal" element={<TimeReversalSocial />} />
                        <Route path="/time-reversal/dashboard" element={<ProtectedRoute><TimeReversalDashboard /></ProtectedRoute>} />
                        <Route path="/time-reversal/timeline" element={<TimeReversalTimeline />} />
                        <Route path="/time-reversal/create-post" element={<ProtectedRoute><TimeReversalDashboard /></ProtectedRoute>} />
                        {/* Sports Predictor aliases */}
                        <Route path="/sports-predictor" element={<SportsPredictor />} />
                        <Route path="/my-purchased-tips" element={<ProtectedRoute><MyPurchasedTips /></ProtectedRoute>} />
                        <Route path="/tipster-dashboard" element={<ProtectedRoute><TipsterDashboard /></ProtectedRoute>} />
                        <Route path="/admin/sports-matches" element={<ProtectedRoute requireAdmin={true}><AdminSportsMatches /></ProtectedRoute>} />
                        {/* Learning aliases */}
                        <Route path="/courses" element={<Navigate to="/tutorial-platform?view=browse" replace />} />
                        <Route path="/my-learning" element={<ProtectedRoute><MyLearning /></ProtectedRoute>} />
                        <Route path="/course-creator" element={<ProtectedRoute><TutorialPlatform /></ProtectedRoute>} />
                        {/* Verification alias */}
                        <Route path="/verification" element={<Navigate to="/account/verification" replace />} />
                        {/* KitchenStars Competitions */}
                        <Route path="/masterchef" element={<ProtectedRoute><KitchenStarsBattles /></ProtectedRoute>} />
                        {/* Clip Battles — short video duels */}
                        <Route path="/clip-battles" element={<ProtectedRoute><ReelBattles /></ProtectedRoute>} />
                        <Route path="/reel-battles" element={<Navigate to="/clip-battles" replace />} />

                        <Route path="/masterchef/live-battles" element={<Navigate to="/masterchef" replace />} />
                        <Route path="/kitchenstars/battles" element={<Navigate to="/masterchef" replace />} />
                        <Route path="/masterchef/duel-upload" element={<Navigate to="/masterchef" replace />} />

                        {/* KitchenStars brand aliases — redirect to internal /masterchef paths */}
                        <Route path="/kitchenstars" element={<Navigate to="/masterchef-subscription" replace />} />
                        <Route path="/kitchenstars-subscription" element={<Navigate to="/masterchef-subscription" replace />} />
                        <Route path="/kitchenstars/*" element={<KitchenStarsRedirect />} />
                        <Route path="/admin/kitchenstars-payouts" element={<Navigate to="/admin/masterchef-payouts" replace />} />
                        {/* ProClass brand aliases — redirect to internal /masterclass(es) paths */}
                        <Route path="/proclasses" element={<Navigate to="/masterclasses" replace />} />
                        <Route path="/proclass/*" element={<ProClassRedirect />} />
                        <Route path="/proclasses/*" element={<ProClassRedirect />} />
                        <Route path="/time-capsule-subscription" element={<Navigate to="/time-capsule" replace />} />
                        <Route path="/time-capsule" element={<TimeCapsule />} />
                       <Route path="/holographic-avatars" element={<HolographicAvatars />} />
                       <Route path="/about-platform" element={<AboutPlatform />} />
                       <Route path="/about" element={<Navigate to="/about-platform" replace />} />
                        <Route path="/holographic-history" element={<HolographicHistory />} />
                        <Route path="/digital-offspring" element={<DigitalOffspring />} />
                        {/* Crystal Energy Network */}
                        <Route path="/crystal-energy-network" element={<CrystalEnergyNetwork />} />
                        <Route path="/crystal-energy" element={<CrystalEnergyNetwork />} />
                        <Route path="/crystal-marketplace" element={<CrystalMarketplace />} />
                        {/* Phobia Trading */}
                        <Route path="/phobia-trading" element={<PhobiaTrading />} />
                        {/* Live Concerts */}
                        <Route path="/live-concerts" element={<LiveConcerts />} />
                        <Route path="/concert-watch/:id" element={<ProtectedRoute><ConcertWatch /></ProtectedRoute>} />
                        
                        <Route path="/coffee/leaderboard" element={<CoffeeCheckins />} />
                        <Route path="/kids-stories/adventure" element={<KidsGoldPassGate moduleName="Choose Adventure" redirectPath="/kids-stories/adventure"><ChooseAdventure /></KidsGoldPassGate>} />
                        <Route path="/kids-stories/voice-chat" element={<KidsGoldPassGate moduleName="Character Chat" redirectPath="/kids-stories/voice-chat"><KidsVoiceChat /></KidsGoldPassGate>} />
                        <Route path="/kids-stories/create-character" element={<KidsGoldPassGate moduleName="Create Your Hero" redirectPath="/kids-stories/create-character"><CreateCharacter /></KidsGoldPassGate>} />
                        <Route path="/kids-stories/character-gallery" element={<KidsGoldPassGate moduleName="Character Gallery" redirectPath="/kids-stories/character-gallery"><CharacterGalleryPage /></KidsGoldPassGate>} />
                        <Route path="/kids-stories/battle" element={<KidsGoldPassGate moduleName="Character Battle" redirectPath="/kids-stories/battle"><CharacterBattle /></KidsGoldPassGate>} />
                        <Route path="/character-gallery" element={<CharacterGallery />} />
                        <Route path="/kids-stories/educational" element={<KidsGoldPassGate moduleName="Learn & Play" redirectPath="/kids-stories/educational"><EducationalStories /></KidsGoldPassGate>} />
                        <Route path="/kids-stories/bedtime" element={<KidsGoldPassGate moduleName="Bedtime Stories" redirectPath="/kids-stories/bedtime"><KidsParentalGateGuard featureName="Bedtime Stories" storageKey="pg_bedtime"><BedtimeStories /></KidsParentalGateGuard></KidsGoldPassGate>} />
                        <Route path="/kids-stories/games" element={<KidsGoldPassGate moduleName="Story Games" redirectPath="/kids-stories/games"><StoryGames /></KidsGoldPassGate>} />
                        <Route path="/iq-platform" element={<IQPlatform />} />
                        <Route path="/iq-platform/lab" element={<IQBrainLab />} />
                        <Route path="/iq/lab" element={<IQBrainLab />} />
                        <Route path="/iq-platform/profile/:userId" element={<IQTrophyProfile />} />
                        <Route path="/iq/u/:slug" element={<IQPublicProfile />} />
                        <Route path="/iq/leaderboard" element={<IQLeaderboard />} />
                        
                        <Route path="/property-marketplace" element={<PropertyMarketplace />} />
                        <Route path="/property-submission" element={<PropertySubmission />} />
                        <Route path="/my-properties" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />
                        <Route path="/property-favorites" element={<ProtectedRoute><PropertyFavorites /></ProtectedRoute>} />
                        
                        <Route path="/__e2e/anonymous-date-matches" element={<E2EAnonymousDateMatches />} />
                        <Route path="/roadmap" element={<Roadmap />} />
                        <Route path="/__preview/ad" element={<AdPreview />} />
                        {/* Alias redirects for legacy / commonly-typed paths */}
                        <Route path="/teens" element={<Navigate to="/teen-hub" replace />} />
                        <Route path="/skills" element={<Navigate to="/marketplace" replace />} />
                        <Route path="/brand-arena" element={<ProtectedRoute requireAdmin={true}><BrandArenaHub /></ProtectedRoute>} />
                        <Route path="/messages" element={<Navigate to="/messenger" replace />} />
                        <Route path="/community" element={<Navigate to="/wall" replace />} />
                        <Route path="/health" element={<Navigate to="/wellness" replace />} />
                        <Route path="/legal" element={<Navigate to="/terms" replace />} />
                        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    </RouteResetErrorBoundary>
                  </main>

                  <Suspense fallback={null}>
                    <Footer />
                  </Suspense>
                  <Suspense fallback={null}>
                    <MobileBottomNav />
                  </Suspense>
                  <Suspense fallback={null}>
                    <UniAssistant />
                  </Suspense>
                  <Suspense fallback={null}>
                    <GoogleTranslateWidget />
                  </Suspense>

                </div>
              </TooltipProvider>
              </CurrencyProvider>
            </AnimationProvider>
            
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
    </HelmetProvider>
  );
};

export default App;

