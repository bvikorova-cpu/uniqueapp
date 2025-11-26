import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { SubscriptionGuard } from "@/components/SubscriptionGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Wall from "./pages/Wall";
import Groups from "./pages/Groups";
import Pages from "./pages/Pages";
import WallFeed from "./pages/wall/WallFeed";
import WallMessages from "./pages/wall/WallMessages";
import WallFriends from "./pages/wall/WallFriends";
import WallGroups from "./pages/wall/WallGroups";
import WallPages from "./pages/wall/WallPages";
import WallVideos from "./pages/wall/WallVideos";
import WallEvents from "./pages/wall/WallEvents";
import WallSaved from "./pages/wall/WallSaved";
import WallTrending from "./pages/wall/WallTrending";
import GroupDetail from "./pages/wall/GroupDetail";
import PageDetail from "./pages/wall/PageDetail";
import EventDetail from "./pages/wall/EventDetail";
import Messenger from "./pages/Messenger";
import Megatalent from "./pages/Megatalent";
import MegatalentCategory from "./pages/megatalent/MegatalentCategory";
import Subscription from "./pages/Subscription";
import Stories from "./pages/Stories";
import Vacationer from "./pages/Vacationer";
import Dating from "./pages/Dating";
import FirstAid from "./pages/FirstAid";
import FitSlim from "./pages/FitSlim";
import Cooking from "./pages/Cooking";
import CookingAI from "./pages/CookingAI";
import RecipeGenerator from "./pages/RecipeGenerator";
import MealPlanner from "./pages/MealPlanner";
import FoodScanner from "./pages/FoodScanner";
import RestaurantAnalyzer from "./pages/RestaurantAnalyzer";
import ChefChat from "./pages/ChefChat";
import WinePairing from "./pages/WinePairing";
import Contact from "./pages/Contact";
import Marketplace from "./pages/Marketplace";
import Terms from "./pages/Terms";
import Education from "./pages/Education";
import QuizCreator from "./components/education/QuizCreator";
import QuizTaker from "./components/education/QuizTaker";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminTransactions from "./pages/AdminTransactions";
import AdminCorporateInquiries from "./pages/AdminCorporateInquiries";
import AdminTipsters from "./pages/AdminTipsters";
import AdminMasterChefPayouts from "./pages/AdminMasterChefPayouts";
import AdminComedyPayouts from "./pages/AdminComedyPayouts";
import AdminInfluencerPayouts from "./pages/AdminInfluencerPayouts";
import AdminBrandCampaigns from "./pages/AdminBrandCampaigns";
import AdminPlatformEarnings from "./pages/AdminPlatformEarnings";
import Bazaar from "./pages/Bazaar";
import Auction from "./pages/Auction";
import AIGeneration from "./pages/AIGeneration";
import BestFriend from "./pages/BestFriend";
import Referral from "./pages/Referral";
import InfluKing from "./pages/InfluKing";
import Megaforum from "./pages/Megaforum";
import OnlinePsychologist from "./pages/OnlinePsychologist";
import LiveStream from "./pages/LiveStream";
import LiveStreamList from "./pages/LiveStreamList";
import Games from "./pages/Games";
import Rewards from "./pages/Rewards";
import Jobs from "./pages/Jobs";
import EmployerDashboard from "./pages/EmployerDashboard";
import EmployerVerification from "./pages/EmployerVerification";
import AdminVerifications from "./pages/AdminVerifications";
import AIMentor from "./pages/AIMentor";
import AIMentorChat from "./pages/AIMentorChat";
import ContentStudio from "./pages/ContentStudio";
import AICompanions from "./pages/AICompanions";
import CompanionChat from "./pages/CompanionChat";
import CourseDetail from "./pages/CourseDetail";
import GenerateCourses from "./pages/GenerateCourses";
import Earnings from "./pages/Earnings";

import DreamJournal from "./pages/DreamJournal";
import VirtualPet from "./pages/VirtualPet";
import Astrology from "./pages/Astrology";

import PremiumStore from "./pages/PremiumStore";
import AICreditsStore from "./pages/AICreditsStore";
import MysteryBox from "./pages/MysteryBox";
import PetTranslator from "./pages/PetTranslator";
import PetTranslatorPricing from "./pages/PetTranslatorPricing";
import FutureFace from "./pages/FutureFace";
import AncestorTwin from "./pages/AncestorTwin";
import AncestorTwinUpload from "./pages/AncestorTwinUpload";
import AncestorTwinHistory from "./pages/AncestorTwinHistory";
import AncestorTwinGallery from "./pages/AncestorTwinGallery";
import AncestorTwinComparison from "./pages/AncestorTwinComparison";
import SkillSwap from "./pages/SkillSwap";
import SkillSwapProfile from "./pages/SkillSwapProfile";
import SkillSwapSettings from "./pages/SkillSwapSettings";
import SkillSwapDashboard from "./pages/SkillSwapDashboard";
import SubscriptionManagement from "./pages/SubscriptionManagement";
import Psychology from "./pages/Psychology";
import Quiz from "./pages/Quiz";
import Home from "./pages/Home";
import AIExperiences from "./pages/AIExperiences";
import BrandBuilder from "./pages/BrandBuilder";
import HomeDesigner from "./pages/HomeDesigner";
import CharacterArena from "./pages/CharacterArena";
import BeautyStudio from "./pages/BeautyStudio";
import AIMusicProducer from "./pages/AIMusicProducer";
import PlantCare from "./pages/PlantCare";
import AITattoo from "./pages/AITattoo";
import KidsHomework from "./pages/KidsHomework";
import KidsStoryCreator from "./pages/KidsStoryCreator";
import KidsStoryPricing from "./pages/KidsStoryPricing";
import KidsScienceLab from "./pages/KidsScienceLab";
import KidsSciencePricing from "./pages/KidsSciencePricing";
import KidsScienceAdmin from "./pages/KidsScienceAdmin";
import KidsDrawingBuddy from "./pages/KidsDrawingBuddy";
import KidsReadingCompanion from "./pages/KidsReadingCompanion";
import ColoringPages from "./pages/ColoringPages";
import TeenCareerCounselor from "./pages/TeenCareerCounselor";
import KidsChannel from "./pages/KidsChannel";
import KidsShowDetail from "./pages/KidsShowDetail";
import ChooseAdventure from "./pages/ChooseAdventure";
import KidsVoiceChat from "./pages/KidsVoiceChat";
import CreateCharacter from "./pages/CreateCharacter";
import CharacterGalleryPage from "./pages/CharacterGalleryPage";
import CharacterGallery from "./pages/CharacterGallery";
import CharacterBattle from "./pages/CharacterBattle";
import EducationalStories from "./pages/EducationalStories";
import BedtimeStories from "./pages/BedtimeStories";
import StoryGames from "./pages/StoryGames";
import KidsPricing from "./pages/KidsPricing";
import StoryVideoDemo from "./pages/StoryVideoDemo";
import StoryGallery from "./pages/StoryGallery";
import SharedStory from "./pages/SharedStory";
import AdminImageEditor from "./pages/AdminImageEditor";
import PhotoRestoration from "./pages/PhotoRestoration";
import AntiqueAppraisal from "./pages/AntiqueAppraisal";
import PremiumCourses from "./pages/PremiumCourses";
import Masterclasses from "./pages/Masterclasses";
import MasterclassLearning from "./pages/MasterclassLearning";
import InteractiveWorkshops from "./pages/InteractiveWorkshops";
import CertificationPrograms from "./pages/CertificationPrograms";
import CourseLearning from "./pages/CourseLearning";
import LanguageLearning from "./pages/LanguageLearning";
import FitnessWellness from "./pages/FitnessWellness";
import DigitalMarketing from "./pages/DigitalMarketing";
import Photography from "./pages/Photography";
import CulinaryArts from "./pages/CulinaryArts";
import MusicProduction from "./pages/MusicProduction";
import GraphicDesign from "./pages/GraphicDesign";
import PublicSpeaking from "./pages/PublicSpeaking";
import FinancialInvestment from "./pages/FinancialInvestment";
import CreativeWriting from "./pages/CreativeWriting";
import Collectibles from "./pages/Collectibles";
import GenericLearning from "./pages/GenericLearning";
import FashionStudio from "./pages/FashionStudio";
import NutritionHub from "./pages/NutritionHub";
import NutritionSubscriptions from "./pages/NutritionSubscriptions";
import UniversalAnalyzer from "./pages/UniversalAnalyzer";
import AnalyzerResult from "./pages/AnalyzerResult";
import AnalyzerPricing from "./pages/AnalyzerPricing";
import AnalyzerHistory from "./pages/AnalyzerHistory";
import AnalyzerCollections from "./pages/AnalyzerCollections";
import VideoAdGenerator from "./pages/VideoAdGenerator";
import TeacherDashboard from "./pages/TeacherDashboard";
import HealthcareProviderDashboard from "./pages/HealthcareProviderDashboard";
import HealthcareContentLibrary from "./pages/HealthcareContentLibrary";
import BrandBattle from "./pages/BrandBattle";
import SponsorRegistration from "./pages/SponsorRegistration";
import SponsorDashboard from "./pages/SponsorDashboard";
import BrainDuel from "./pages/BrainDuel";

import Coffee from "./pages/Coffee";
import CoffeeCheckins from "./pages/CoffeeCheckins";
import CoffeeBuddy from "./pages/CoffeeBuddy";
import AIClone from "./pages/AIClone";
import ParallelLives from "./pages/ParallelLives";
import EmotionEconomy from "./pages/EmotionEconomy";
import QuantumSocial from "./pages/QuantumSocial";
import VirtualInfluencerAgency from "./pages/VirtualInfluencerAgency";
import MembershipCommunity from "./pages/MembershipCommunity";
import CreatorDashboard from "./pages/CreatorDashboard";
import CreatorProfile from "./pages/CreatorProfile";
import DiscoverCreators from "./pages/DiscoverCreators";
import CoursesHub from "./pages/CoursesHub";
import CourseDetailPage from "./pages/CourseDetailPage";
import CourseLearnPage from "./pages/CourseLearnPage";
import BecomeCreator from "./pages/BecomeCreator";
import InstructorEarnings from "./pages/InstructorEarnings";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import HowItWorks from "./pages/HowItWorks";
import MyLearning from "./pages/MyLearning";
import LotteryAI from "./pages/LotteryAI";
import LotteryHistory from "./pages/LotteryHistory";
import SportsPredictor from "./pages/SportsPredictor";
import SportsAdmin from "./pages/SportsAdmin";
import AdminSportsMatches from "./pages/AdminSportsMatches";
import MyPurchasedTips from "./pages/MyPurchasedTips";
import TipsterDashboard from "./pages/TipsterDashboard";
import PropertyMarketplace from "./pages/PropertyMarketplace";
import PropertySubmission from "./pages/PropertySubmission";
import MyProperties from "./pages/MyProperties";
import HomeDecorMarketplace from "./pages/HomeDecorMarketplace";
import HomeDecorSubscription from "./pages/HomeDecorSubscription";
import BrandCollaboration from "./pages/BrandCollaboration";
import StockContentLibrary from "./pages/StockContentLibrary";
import TutorialPlatform from "./pages/TutorialPlatform";
import MonetizationIdeas from "./pages/MonetizationIdeas";
import ShadowArena from "./pages/ShadowArena";
import ShadowArenaDashboard from "./pages/ShadowArenaDashboard";
import ShadowArenaSubmitStory from "./pages/ShadowArenaSubmitStory";
import ShadowArenaBattles from "./pages/ShadowArenaBattles";
import ShadowArenaBattleDetail from "./pages/ShadowArenaBattleDetail";
import ShadowArenaBattleSubmit from "./pages/ShadowArenaBattleSubmit";
import ShadowArenaStoryDetail from "./pages/ShadowArenaStoryDetail";
import VirtualEscapeRoom from "./pages/VirtualEscapeRoom";
import HorseRacing from "./pages/HorseRacing";
import ComedyClub from "./pages/ComedyClub";
import ComedianDashboard from "./pages/ComedianDashboard";
import ComedyLiveShow from "./pages/ComedyLiveShow";
import ComedyLiveViewer from "./pages/ComedyLiveViewer";
import DisneyCastles from "./pages/DisneyCastles";
import DisneyCastleTour from "./pages/DisneyCastleTour";
import DisneyAdmin from "./pages/DisneyAdmin";
import CertificateGallery from "./pages/CertificateGallery";
import F1Racing from "./pages/F1Racing";
import F1Subscription from "./pages/F1Subscription";
import F1FantasyTeam from "./pages/F1FantasyTeam";
import F1Leaderboard from "./pages/F1Leaderboard";
import MasterChefSubscription from "./pages/MasterChefSubscription";
import MasterChefDashboard from "./pages/MasterChefDashboard";
import MasterChefCompetitions from "./pages/MasterChefCompetitions";
import MasterChefCompetitionsGallery from "./pages/MasterChefCompetitionsGallery";
import MasterChefEarnings from "./pages/MasterChefEarnings";
import InfluencerEarnings from "./pages/InfluencerEarnings";
import TimeReversalSubscription from "./pages/TimeReversalSubscription";
import TimeReversalDashboard from "./pages/TimeReversalDashboard";
import TimeReversalTimeline from "./pages/TimeReversalTimeline";
import TimeCapsuleSubscription from "./pages/TimeCapsuleSubscription";
import TimeCapsule from "./pages/TimeCapsule";
import HolographicAvatars from "./pages/HolographicAvatars";
import CrystalEnergyNetwork from "./pages/CrystalEnergyNetwork";
import CrystalMarketplace from "./pages/CrystalMarketplace";
import DNAMemoryNetwork from "./pages/DNAMemoryNetwork";
import ReincarnationSocial from "./pages/ReincarnationSocial";
import BlockchainConfessions from "./pages/BlockchainConfessions";
import PhobiaTrading from "./pages/PhobiaTrading";
import MultiverseNetwork from "./pages/MultiverseNetwork";

import LiveConcerts from "./pages/LiveConcerts";
import MusicianDashboard from "./pages/MusicianDashboard";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import IQPlatform from "./pages/IQPlatform";

import FundraisingHub from "./pages/fundraising/FundraisingHub";
import MedicalFundraising from "./pages/fundraising/MedicalFundraising";
import MedicalDetail from "./pages/fundraising/MedicalDetail";
import CreateMedicalCampaign from "./pages/fundraising/CreateMedicalCampaign";
import FundraisingDashboard from "./pages/fundraising/FundraisingDashboard";
import CampaignDashboard from "./pages/fundraising/CampaignDashboard";
import DreamMaker from "./pages/fundraising/DreamMaker";
import CreateDreamCampaign from "./pages/fundraising/CreateDreamCampaign";
import DreamDetail from "./pages/fundraising/DreamDetail";
import CommunityHero from "./pages/fundraising/CommunityHero";
import CreateHeroCampaign from "./pages/fundraising/CreateHeroCampaign";
import HeroDetail from "./pages/fundraising/HeroDetail";
import PetRescue from "./pages/fundraising/PetRescue";
import CreatePetCampaign from "./pages/fundraising/CreatePetCampaign";
import PetDetail from "./pages/fundraising/PetDetail";
import StudentSupport from "./pages/fundraising/StudentSupport";
import CreateStudentCampaign from "./pages/fundraising/CreateStudentCampaign";
import StudentDetail from "./pages/fundraising/StudentDetail";
import CrisisRelief from "./pages/fundraising/CrisisRelief";
import CreateCrisisCampaign from "./pages/fundraising/CreateCrisisCampaign";
import CrisisDetail from "./pages/fundraising/CrisisDetail";
import TalentSponsorship from "./pages/fundraising/TalentSponsorship";
import CreateTalentCampaign from "./pages/fundraising/CreateTalentCampaign";
import TalentDetail from "./pages/fundraising/TalentDetail";
import CampaignApprovals from "./pages/admin/CampaignApprovals";
import WithdrawalRequests from "./pages/admin/WithdrawalRequests";
import Wellness from "./pages/Wellness";
import PostDetail from "./pages/PostDetail";
import AdminPaymentDashboard from "./pages/AdminPaymentDashboard";
import PaymentDocumentation from "./pages/PaymentDocumentation";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Update HTML lang attribute when language changes
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider delayDuration={0}>
            <Toaster />
            <Sonner />
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-1">
                <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/wall" element={<Wall />} />
              <Route path="/wall/messages" element={<Wall />} />
              <Route path="/wall/friends" element={<Wall />} />
              <Route path="/wall/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
              <Route path="/wall/groups/:groupId" element={<GroupDetail />} />
              <Route path="/wall/pages" element={<ProtectedRoute><Pages /></ProtectedRoute>} />
              <Route path="/wall/pages/:pageId" element={<PageDetail />} />
              <Route path="/wall/videos" element={<Wall />} />
              <Route path="/wall/events" element={<Wall />} />
              <Route path="/wall/events/:eventId" element={<EventDetail />} />
              <Route path="/wall/saved" element={<Wall />} />
              <Route path="/wall/trending" element={<Wall />} />
              <Route path="/post/:id" element={<PostDetail />} />
              <Route path="/messenger" element={<Messenger />} />
              <Route path="/megatalent" element={<Megatalent />} />
              <Route path="/megatalent/:category" element={<MegatalentCategory />} />
              <Route path="/megaforum" element={<Megaforum />} />
              <Route path="/psychologist" element={<Psychology />} />
              <Route path="/vacationer" element={<Vacationer />} />
              <Route path="/dating" element={<Dating />} />
              <Route path="/first-aid" element={<FirstAid />} />
              <Route path="/fit-slim" element={<FitSlim />} />
              <Route path="/marketplace" element={<Marketplace />} />
              
              <Route path="/bazaar" element={<Bazaar />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/games" element={<Games />} />
              <Route path="/jobs" element={<Jobs />} />
              <Route path="/employer-dashboard" element={<ProtectedRoute><EmployerDashboard /></ProtectedRoute>} />
              <Route path="/employer-verification" element={<ProtectedRoute><EmployerVerification /></ProtectedRoute>} />
              <Route path="/admin/verifications" element={<ProtectedRoute requireAdmin={true}><AdminVerifications /></ProtectedRoute>} />
              <Route path="/influ-king" element={<InfluKing />} />
              <Route path="/auction" element={<Auction />} />
              <Route path="/ai-generation" element={<AIGeneration />} />
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
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/education" element={<Education />} />
              <Route path="/quiz/create" element={<QuizCreator />} />
              <Route path="/quiz/:quizId" element={<QuizTaker />} />
              <Route path="/course/:courseName" element={<CourseDetail />} />
              <Route path="/quiz" element={<Quiz />} />
              
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/ai-credits-store" element={<AICreditsStore />} />
              <Route path="/ai-credits" element={<AICreditsStore />} />
              <Route path="/admin/transactions" element={<ProtectedRoute requireAdmin={true}><AdminTransactions /></ProtectedRoute>} />
              <Route path="/admin/corporate-inquiries" element={<ProtectedRoute requireAdmin={true}><AdminCorporateInquiries /></ProtectedRoute>} />
              <Route path="/admin/tipsters" element={<ProtectedRoute requireAdmin={true}><AdminTipsters /></ProtectedRoute>} />
              <Route path="/earnings" element={<ProtectedRoute><Earnings /></ProtectedRoute>} />
              <Route path="/livestream" element={<LiveStreamList />} />
              <Route path="/live/:streamId" element={<LiveStream />} />
              <Route path="/stories/:userId" element={<Stories />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/generate-courses" element={<GenerateCourses />} />
              <Route path="/premium-store" element={<PremiumStore />} />
              <Route path="/ai-mentor" element={<AIMentor />} />
          <Route path="/ai-mentor/:area" element={<AIMentorChat />} />
          <Route path="/content-studio" element={<ContentStudio />} />
          <Route path="/companions" element={<AICompanions />} />
          <Route path="/companions/:conversationId" element={<CompanionChat />} />
          
          <Route path="/dream-journal" element={<DreamJournal />} />
          <Route path="/virtual-pet" element={<VirtualPet />} />
          <Route path="/astrology" element={<Astrology />} />
          <Route path="/character-arena" element={<CharacterArena />} />
          <Route path="/mystery-box" element={<MysteryBox />} />
          <Route path="/pet-translator" element={<PetTranslator />} />
          <Route path="/pet-translator-pricing" element={<PetTranslatorPricing />} />
          <Route path="/future-face" element={<FutureFace />} />
          <Route path="/ancestor-twin" element={<AncestorTwin />} />
          <Route path="/ancestor-twin/upload" element={<AncestorTwinUpload />} />
          <Route path="/ancestor-twin/history" element={<AncestorTwinHistory />} />
          <Route path="/ancestor-twin/gallery" element={<AncestorTwinGallery />} />
          <Route path="/ancestor-twin/comparison" element={<AncestorTwinComparison />} />
           <Route path="/skill-swap" element={<SkillSwap />} />
           <Route path="/skill-swap/dashboard" element={<ProtectedRoute><SkillSwapDashboard /></ProtectedRoute>} />
           <Route path="/skill-swap/profile/:userId" element={<ProtectedRoute><SkillSwapProfile /></ProtectedRoute>} />
           <Route path="/skill-swap/profile/edit" element={<ProtectedRoute><SkillSwapSettings /></ProtectedRoute>} />
           <Route path="/subscription-management" element={<ProtectedRoute><SubscriptionManagement /></ProtectedRoute>} />
           <Route path="/wellness" element={<Wellness />} />
            <Route path="/ai-experiences" element={<AIExperiences />} />
          <Route path="/brand-builder" element={<BrandBuilder />} />
          <Route path="/home-designer" element={<HomeDesigner />} />
          <Route path="/beauty-studio" element={<BeautyStudio />} />
          <Route path="/ai-music-producer" element={<AIMusicProducer />} />
          <Route path="/plant-care" element={<PlantCare />} />
          <Route path="/ai-tattoo" element={<AITattoo />} />
          <Route path="/kids-homework" element={<KidsHomework />} />
          <Route path="/kids-story-creator" element={<KidsStoryCreator />} />
          <Route path="/kids-story-pricing" element={<KidsStoryPricing />} />
          <Route path="/kids-science-lab" element={<KidsScienceLab />} />
          <Route path="/kids-science-pricing" element={<KidsSciencePricing />} />
          <Route path="/kids-science-admin" element={<ProtectedRoute requireAdmin={true}><KidsScienceAdmin /></ProtectedRoute>} />
          <Route path="/kids-drawing-buddy" element={<KidsDrawingBuddy />} />
          <Route path="/kids-reading-companion" element={<KidsReadingCompanion />} />
          <Route path="/photo-restoration" element={<PhotoRestoration />} />
          <Route path="/antique-appraisal" element={<AntiqueAppraisal />} />
          <Route path="/teen-career-counselor" element={<TeenCareerCounselor />} />
          <Route path="/premium-courses" element={<PremiumCourses />} />
          <Route path="/masterclasses" element={<Masterclasses />} />
          <Route path="/masterclass/:masterclassId" element={<MasterclassLearning />} />
          <Route path="/interactive-workshops" element={<InteractiveWorkshops />} />
          <Route path="/certification-programs" element={<CertificationPrograms />} />
          <Route path="/course/:certificationId" element={<CourseLearning />} />
          <Route path="/language-learning" element={<LanguageLearning />} />
          <Route path="/language/:contentId" element={<GenericLearning />} />
          <Route path="/fitness-wellness" element={<FitnessWellness />} />
          <Route path="/fitness/:contentId" element={<GenericLearning />} />
          <Route path="/digital-marketing" element={<DigitalMarketing />} />
          <Route path="/marketing/:contentId" element={<GenericLearning />} />
          <Route path="/photography" element={<Photography />} />
          <Route path="/photography/:contentId" element={<GenericLearning />} />
          <Route path="/culinary-arts" element={<CulinaryArts />} />
          <Route path="/culinary/:contentId" element={<GenericLearning />} />
          <Route path="/music-production" element={<MusicProduction />} />
          <Route path="/music/:contentId" element={<GenericLearning />} />
          <Route path="/graphic-design" element={<GraphicDesign />} />
          <Route path="/design/:contentId" element={<GenericLearning />} />
          <Route path="/public-speaking" element={<PublicSpeaking />} />
          <Route path="/speaking/:contentId" element={<GenericLearning />} />
          <Route path="/financial-investment" element={<FinancialInvestment />} />
          <Route path="/investment/:contentId" element={<GenericLearning />} />
          <Route path="/creative-writing" element={<CreativeWriting />} />
          <Route path="/writing/:contentId" element={<GenericLearning />} />
          <Route path="/coloring-pages" element={<ColoringPages />} />
          <Route path="/schools" element={<Navigate to="/coloring-pages" replace />} />
          <Route path="/healthcare" element={<Navigate to="/coloring-pages" replace />} />
          <Route path="/corporate-events" element={<Navigate to="/coloring-pages" replace />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/healthcare-dashboard" element={<HealthcareProviderDashboard />} />
          <Route path="/healthcare-library" element={<HealthcareContentLibrary />} />
           <Route path="/brand-battle" element={<BrandBattle />} />
           <Route path="/sponsor-registration" element={<SponsorRegistration />} />
           <Route path="/sponsor-dashboard" element={<ProtectedRoute><SponsorDashboard /></ProtectedRoute>} />
           <Route path="/brain-duel" element={
             <ProtectedRoute>
               <BrainDuel />
             </ProtectedRoute>
           } />
          
          <Route path="/collectibles" element={<Collectibles />} />
          <Route path="/fashion-studio" element={<FashionStudio />} />
          <Route path="/nutrition-hub" element={<NutritionHub />} />
          <Route path="/nutrition-subscriptions" element={<NutritionSubscriptions />} />
          <Route path="/analyzer" element={<UniversalAnalyzer />} />
          <Route path="/analyzer/result/:id" element={<AnalyzerResult />} />
          <Route path="/analyzer/pricing" element={<AnalyzerPricing />} />
          <Route path="/analyzer/history" element={<AnalyzerHistory />} />
          <Route path="/analyzer/collections" element={<AnalyzerCollections />} />
          <Route path="/video-ad-generator" element={<VideoAdGenerator />} />
          <Route path="/kids-channel" element={<KidsChannel />} />
          <Route path="/kids-channel/:showId" element={<KidsShowDetail />} />
          <Route path="/choose-adventure" element={<ChooseAdventure />} />
          <Route path="/kids-voice-chat" element={<KidsVoiceChat />} />
          <Route path="/create-character" element={<CreateCharacter />} />
          <Route path="/educational-stories" element={<EducationalStories />} />
          <Route path="/bedtime-stories" element={<BedtimeStories />} />
           <Route path="/story-games" element={<StoryGames />} />
           <Route path="/kids-pricing" element={<KidsPricing />} />
           <Route path="/story-video-demo" element={<StoryVideoDemo />} />
           <Route path="/story-gallery" element={<StoryGallery />} />
           <Route path="/shared/:shareCode" element={<SharedStory />} />
           <Route path="/admin-image-editor" element={<ProtectedRoute requireAdmin={true}><AdminImageEditor /></ProtectedRoute>} />
          <Route path="/coffee" element={<Coffee />} />
          <Route path="/coffee/checkins" element={<CoffeeCheckins />} />
          <Route path="/coffee/buddy" element={<CoffeeBuddy />} />
          <Route path="/ai-clone" element={<AIClone />} />
          <Route path="/parallel-lives" element={<ParallelLives />} />
          <Route path="/lottery-history" element={<LotteryHistory />} />
          <Route path="/emotion-economy" element={<EmotionEconomy />} />
          <Route path="/quantum-social" element={<QuantumSocial />} />
          <Route path="/virtual-influencer-agency" element={<VirtualInfluencerAgency />} />
          <Route path="/membership-community" element={<MembershipCommunity />} />
          <Route path="/discover-creators" element={<DiscoverCreators />} />
          <Route path="/creator-dashboard" element={<ProtectedRoute><CreatorDashboard /></ProtectedRoute>} />
          <Route path="/creator/:creatorId" element={<CreatorProfile />} />
          <Route path="/become-creator" element={<BecomeCreator />} />
              <Route path="/instructor-earnings" element={<ProtectedRoute><InstructorEarnings /></ProtectedRoute>} />
              <Route path="/admin/withdrawals" element={<ProtectedRoute requireAdmin={true}><AdminWithdrawals /></ProtectedRoute>} />
              <Route path="/admin/influencer-payouts" element={<ProtectedRoute requireAdmin={true}><AdminInfluencerPayouts /></ProtectedRoute>} />
              <Route path="/admin/platform-earnings" element={<ProtectedRoute requireAdmin={true}><AdminPlatformEarnings /></ProtectedRoute>} />
              <Route path="/admin/payment-dashboard" element={<ProtectedRoute requireAdmin={true}><AdminPaymentDashboard /></ProtectedRoute>} />
              <Route path="/payment-documentation" element={<PaymentDocumentation />} />
              <Route path="/course/:courseId" element={<CourseDetailPage />} />
          <Route path="/course/:courseId/learn" element={<CourseLearnPage />} />
          <Route path="/lottery-ai" element={<LotteryAI />} />
          <Route path="/sports-predictor" element={<SportsPredictor />} />
           <Route path="/my-purchased-tips" element={<ProtectedRoute><MyPurchasedTips /></ProtectedRoute>} />
           <Route path="/tipster-dashboard" element={<ProtectedRoute><TipsterDashboard /></ProtectedRoute>} />
           <Route path="/sports-admin" element={<ProtectedRoute requireAdmin={true}><SportsAdmin /></ProtectedRoute>} />
           <Route path="/admin/sports-matches" element={<ProtectedRoute requireAdmin={true}><AdminSportsMatches /></ProtectedRoute>} />
          <Route path="/brand-collaboration" element={<BrandCollaboration />} />
          <Route path="/stock-content-library" element={<StockContentLibrary />} />
          <Route path="/tutorial-platform" element={<TutorialPlatform />} />
          <Route path="/monetization-ideas" element={<MonetizationIdeas />} />
          <Route path="/shadow-arena" element={<ShadowArena />} />
          <Route path="/shadow-arena/dashboard" element={<ProtectedRoute><ShadowArenaDashboard /></ProtectedRoute>} />
          <Route path="/shadow-arena/submit-story" element={<ShadowArenaSubmitStory />} />
          <Route path="/shadow-arena/battles" element={<ShadowArenaBattles />} />
          <Route path="/shadow-arena/battle/:battleId" element={<ShadowArenaBattleDetail />} />
          <Route path="/shadow-arena/battle/:battleId/submit" element={<ShadowArenaBattleSubmit />} />
          <Route path="/shadow-arena/story/:storyId" element={<ShadowArenaStoryDetail />} />
          <Route path="/virtual-escape-room" element={<VirtualEscapeRoom />} />
              <Route path="/horse-racing" element={<HorseRacing />} />
              <Route path="/comedy-club" element={<ComedyClub />} />
              <Route path="/comedian-dashboard" element={<ProtectedRoute><ComedianDashboard /></ProtectedRoute>} />
              <Route path="/comedy-live/:showId" element={<ComedyLiveShow />} />
              <Route path="/comedy-watch/:showId" element={<ComedyLiveViewer />} />
              <Route path="/kids-channel/disney-castles" element={<DisneyCastles />} />
              <Route path="/kids-channel/disney-castles/:castleId" element={<DisneyCastleTour />} />
              <Route path="/kids-channel/disney-admin" element={<ProtectedRoute requireAdmin={true}><DisneyAdmin /></ProtectedRoute>} />
              <Route path="/kids-channel/certificate-gallery" element={<CertificateGallery />} />
              <Route path="/f1-racing" element={
                <SubscriptionGuard 
                  checkFunction="check-f1-subscription" 
                  redirectTo="/f1-subscription"
                  serviceName="F1 Racing"
                >
                  <F1Racing />
                </SubscriptionGuard>
              } />
              <Route path="/f1-subscription" element={<F1Subscription />} />
              <Route path="/f1-fantasy-team" element={
                <SubscriptionGuard 
                  checkFunction="check-f1-subscription" 
                  redirectTo="/f1-subscription"
                  serviceName="F1 Racing"
                >
                  <F1FantasyTeam />
                </SubscriptionGuard>
              } />
              <Route path="/f1-leaderboard" element={
                <SubscriptionGuard 
                  checkFunction="check-f1-subscription" 
                  redirectTo="/f1-subscription"
                  serviceName="F1 Racing"
                >
                  <F1Leaderboard />
                </SubscriptionGuard>
              } />
              <Route path="/masterchef-subscription" element={<MasterChefSubscription />} />
              <Route path="/masterchef/competitions-public" element={<MasterChefCompetitionsGallery />} />
              <Route path="/masterchef/gallery" element={<MasterChefCompetitionsGallery />} />
              <Route path="/masterchef/dashboard" element={<ProtectedRoute><MasterChefDashboard /></ProtectedRoute>} />
              <Route path="/masterchef/competitions" element={<ProtectedRoute><MasterChefCompetitions /></ProtectedRoute>} />
              <Route path="/masterchef/earnings" element={<ProtectedRoute><MasterChefEarnings /></ProtectedRoute>} />
              <Route path="/influencer/earnings" element={<ProtectedRoute><InfluencerEarnings /></ProtectedRoute>} />
          <Route path="/time-reversal-subscription" element={<TimeReversalSubscription />} />
              <Route path="/time-reversal/dashboard" element={<ProtectedRoute><TimeReversalDashboard /></ProtectedRoute>} />
              <Route path="/time-reversal/timeline" element={<TimeReversalTimeline />} />
              <Route path="/time-capsule-subscription" element={<TimeCapsuleSubscription />} />
              <Route path="/time-capsule" element={<TimeCapsule />} />
              <Route path="/home-decor-subscription" element={<HomeDecorSubscription />} />
          <Route path="/holographic-avatars" element={<HolographicAvatars />} />
          
          <Route path="/crystal-energy-network" element={<CrystalEnergyNetwork />} />
          <Route path="/crystal-marketplace" element={<CrystalMarketplace />} />
          <Route path="/dna-memory-network" element={<DNAMemoryNetwork />} />
          <Route path="/reincarnation-social" element={<ReincarnationSocial />} />
          <Route path="/blockchain-confessions" element={<BlockchainConfessions />} />
          <Route path="/phobia-trading" element={<PhobiaTrading />} />
          <Route path="/multiverse-network" element={<MultiverseNetwork />} />
          
          <Route path="/live-concerts" element={<LiveConcerts />} />
          <Route path="/musician-dashboard" element={<ProtectedRoute><MusicianDashboard /></ProtectedRoute>} />
              <Route path="/coffee/leaderboard" element={<CoffeeCheckins />} />
          <Route path="/kids-stories/adventure" element={<ChooseAdventure />} />
          <Route path="/kids-stories/voice-chat" element={<KidsVoiceChat />} />
        <Route path="/kids-stories/create-character" element={<CreateCharacter />} />
        <Route path="/kids-stories/character-gallery" element={<CharacterGalleryPage />} />
        <Route path="/kids-stories/battle" element={<CharacterBattle />} />
          <Route path="/character-gallery" element={<CharacterGallery />} />
          <Route path="/kids-stories/educational" element={<EducationalStories />} />
          <Route path="/kids-stories/bedtime" element={<BedtimeStories />} />
          <Route path="/kids-stories/games" element={<StoryGames />} />
          <Route path="/kids-pricing" element={<KidsPricing />} />
          <Route path="/story-video-demo" element={<StoryVideoDemo />} />
          <Route path="/admin/image-editor" element={<ProtectedRoute requireAdmin={true}><AdminImageEditor /></ProtectedRoute>} />
          <Route path="/shop" element={<Shop />} />
              <Route path="/product/:handle" element={<ProductDetail />} />
              <Route path="/iq-platform" element={<IQPlatform />} />
              
              {/* Fundraising Routes */}
              <Route path="/fundraising" element={<FundraisingHub />} />
              <Route path="/fundraising/dashboard" element={<ProtectedRoute><FundraisingDashboard /></ProtectedRoute>} />
              <Route path="/fundraising/:campaignType/:campaignId/dashboard" element={<ProtectedRoute><CampaignDashboard /></ProtectedRoute>} />
              <Route path="/fundraising/medical" element={<MedicalFundraising />} />
              <Route path="/fundraising/medical/create" element={<CreateMedicalCampaign />} />
              <Route path="/fundraising/medical/:id" element={<MedicalDetail />} />
              <Route path="/fundraising/dream" element={<DreamMaker />} />
              <Route path="/fundraising/dream/create" element={<CreateDreamCampaign />} />
              <Route path="/fundraising/dream/:id" element={<DreamDetail />} />
              <Route path="/fundraising/hero" element={<CommunityHero />} />
              <Route path="/fundraising/hero/create" element={<CreateHeroCampaign />} />
              <Route path="/fundraising/hero/:id" element={<HeroDetail />} />
              <Route path="/fundraising/pet" element={<PetRescue />} />
              <Route path="/fundraising/pet/create" element={<CreatePetCampaign />} />
              <Route path="/fundraising/pet/:id" element={<PetDetail />} />
              <Route path="/fundraising/student" element={<StudentSupport />} />
              <Route path="/fundraising/student/create" element={<CreateStudentCampaign />} />
              <Route path="/fundraising/student/:id" element={<StudentDetail />} />
              <Route path="/fundraising/crisis" element={<CrisisRelief />} />
              <Route path="/fundraising/crisis/create" element={<CreateCrisisCampaign />} />
              <Route path="/fundraising/crisis/:id" element={<CrisisDetail />} />
              <Route path="/fundraising/talent" element={<TalentSponsorship />} />
              <Route path="/fundraising/talent/create" element={<CreateTalentCampaign />} />
              <Route path="/fundraising/talent/:id" element={<TalentDetail />} />
              <Route path="/admin/campaign-approvals" element={<ProtectedRoute requireAdmin={true}><CampaignApprovals /></ProtectedRoute>} />
              <Route path="/admin/campaign-withdrawals" element={<ProtectedRoute requireAdmin={true}><WithdrawalRequests /></ProtectedRoute>} />
              <Route path="/property-marketplace" element={<PropertyMarketplace />} />
              <Route path="/property-submission" element={<PropertySubmission />} />
              <Route path="/my-properties" element={<ProtectedRoute><MyProperties /></ProtectedRoute>} />
              <Route path="/home-decor" element={<HomeDecorMarketplace />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
