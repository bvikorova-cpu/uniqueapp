import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Feed from "./pages/Feed";
import Messenger from "./pages/Messenger";
import Megatalent from "./pages/Megatalent";
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
import TikTok from "./pages/TikTok";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import AdminTransactions from "./pages/AdminTransactions";
import Bazaar from "./pages/Bazaar";
import Auction from "./pages/Auction";
import AIGeneration from "./pages/AIGeneration";
import BestFriend from "./pages/BestFriend";
import Referral from "./pages/Referral";
import InfluKing from "./pages/InfluKing";
import Megaforum from "./pages/Megaforum";
import OnlinePsychologist from "./pages/OnlinePsychologist";
import LiveStream from "./pages/LiveStream";
import Games from "./pages/Games";
import Rewards from "./pages/Rewards";
import Jobs from "./pages/Jobs";
import AIMentor from "./pages/AIMentor";
import AIMentorChat from "./pages/AIMentorChat";
import ContentStudio from "./pages/ContentStudio";
import AICompanions from "./pages/AICompanions";
import CompanionChat from "./pages/CompanionChat";
import CourseDetail from "./pages/CourseDetail";
import GenerateCourses from "./pages/GenerateCourses";
import Earnings from "./pages/Earnings";
import CareerHub from "./pages/CareerHub";
import DreamJournal from "./pages/DreamJournal";
import FashionStylist from "./pages/FashionStylist";
import VirtualPet from "./pages/VirtualPet";
import Astrology from "./pages/Astrology";

import PremiumStore from "./pages/PremiumStore";
import AICreditsStore from "./pages/AICreditsStore";
import AIMusic from "./pages/AIMusic";
import MysteryBox from "./pages/MysteryBox";
import RoutineOptimizer from "./pages/RoutineOptimizer";
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
import KidsMathGames from "./pages/KidsMathGames";
import KidsScienceLab from "./pages/KidsScienceLab";
import KidsDrawingBuddy from "./pages/KidsDrawingBuddy";
import KidsReadingCompanion from "./pages/KidsReadingCompanion";
import ColoringPages from "./pages/ColoringPages";
import TeenStudyPlanner from "./pages/TeenStudyPlanner";
import TeenCareerCounselor from "./pages/TeenCareerCounselor";
import KidsChannel from "./pages/KidsChannel";
import KidsShowDetail from "./pages/KidsShowDetail";
import ChooseAdventure from "./pages/ChooseAdventure";
import KidsVoiceChat from "./pages/KidsVoiceChat";
import CreateCharacter from "./pages/CreateCharacter";
import EducationalStories from "./pages/EducationalStories";
import BedtimeStories from "./pages/BedtimeStories";
import StoryGames from "./pages/StoryGames";
import KidsPricing from "./pages/KidsPricing";
import StoryVideoDemo from "./pages/StoryVideoDemo";
import AdminImageEditor from "./pages/AdminImageEditor";
import PhotoRestoration from "./pages/PhotoRestoration";
import AntiqueAppraisal from "./pages/AntiqueAppraisal";
import TeenDebatePartner from "./pages/TeenDebatePartner";
import TeenCollegePrep from "./pages/TeenCollegePrep";
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
import MiniBizMarketplace from "./pages/MiniBizMarketplace";
import CreateBusiness from "./pages/CreateBusiness";
import UniversalAnalyzer from "./pages/UniversalAnalyzer";
import AnalyzerResult from "./pages/AnalyzerResult";
import AnalyzerPricing from "./pages/AnalyzerPricing";
import AnalyzerHistory from "./pages/AnalyzerHistory";
import AnalyzerCollections from "./pages/AnalyzerCollections";
import VideoAdGenerator from "./pages/VideoAdGenerator";
import Schools from "./pages/Schools";
import TeacherDashboard from "./pages/TeacherDashboard";
import Healthcare from "./pages/Healthcare";
import CorporateEvents from "./pages/CorporateEvents";
import BrandBattle from "./pages/BrandBattle";
import BrainDuel from "./pages/BrainDuel";
import CorporatePartnerships from "./pages/CorporatePartnerships";
import Coffee from "./pages/Coffee";
import CoffeeCheckins from "./pages/CoffeeCheckins";
import CoffeeBuddy from "./pages/CoffeeBuddy";
import AIClone from "./pages/AIClone";
import ParallelLives from "./pages/ParallelLives";
import EmotionEconomy from "./pages/EmotionEconomy";
import MemoryTheft from "./pages/MemoryTheft";
import QuantumSocial from "./pages/QuantumSocial";
import VirtualInfluencerAgency from "./pages/VirtualInfluencerAgency";
import AIContentMarketplace from "./pages/AIContentMarketplace";
import PrintOnDemand from "./pages/PrintOnDemand";
import BrandCollaboration from "./pages/BrandCollaboration";
import CustomCommissions from "./pages/CustomCommissions";
import StockContentLibrary from "./pages/StockContentLibrary";
import DigitalProductStore from "./pages/DigitalProductStore";
import AIAvatarService from "./pages/AIAvatarService";
import TutorialPlatform from "./pages/TutorialPlatform";
import VirtualEscapeRoom from "./pages/VirtualEscapeRoom";
import HorseRacing from "./pages/HorseRacing";
import ComedyClub from "./pages/ComedyClub";
import ComedianDashboard from "./pages/ComedianDashboard";
import DisneyCastles from "./pages/DisneyCastles";
import DisneyCastleTour from "./pages/DisneyCastleTour";
import DinosaurQuiz from "./pages/DinosaurQuiz";
import TravelMap from "./pages/TravelMap";
import PuppetTheater from "./pages/PuppetTheater";
import CircusAcademy from "./pages/CircusAcademy";
import MasterChefJunior from "./pages/MasterChefJunior";
import CakeDecorating from "./pages/CakeDecorating";
import Formula1Racing from "./pages/Formula1Racing";
import MonsterTrucks from "./pages/MonsterTrucks";
import F1Racing from "./pages/F1Racing";
import F1Subscription from "./pages/F1Subscription";
import F1FantasyTeam from "./pages/F1FantasyTeam";
import F1Leaderboard from "./pages/F1Leaderboard";
import MasterChefSubscription from "./pages/MasterChefSubscription";
import MasterChefDashboard from "./pages/MasterChefDashboard";
import MasterChefEarnings from "./pages/MasterChefEarnings";
import TimeReversalSubscription from "./pages/TimeReversalSubscription";
import TimeReversalTimeline from "./pages/TimeReversalTimeline";
import TimeCapsuleSubscription from "./pages/TimeCapsuleSubscription";
import HolographicAvatars from "./pages/HolographicAvatars";
import CrystalEnergyNetwork from "./pages/CrystalEnergyNetwork";
import DNAMemoryNetwork from "./pages/DNAMemoryNetwork";
import ReincarnationSocial from "./pages/ReincarnationSocial";
import BlockchainConfessions from "./pages/BlockchainConfessions";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <TooltipProvider delayDuration={0}>
        <Toaster />
        <Sonner />
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/feed" element={<Feed />} />
              <Route path="/tiktok" element={<TikTok />} />
              <Route path="/messenger" element={<Messenger />} />
              <Route path="/megatalent" element={<Megatalent />} />
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
              <Route path="/admin" element={<Admin />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/education" element={<Education />} />
              <Route path="/course/:courseName" element={<CourseDetail />} />
              <Route path="/quiz" element={<Quiz />} />
              
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/edit-profile" element={<EditProfile />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/ai-credits-store" element={<AICreditsStore />} />
              <Route path="/ai-credits" element={<AICreditsStore />} />
              <Route path="/admin/transactions" element={<AdminTransactions />} />
              <Route path="/earnings" element={<Earnings />} />
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
          <Route path="/career-hub" element={<CareerHub />} />
          <Route path="/dream-journal" element={<DreamJournal />} />
          <Route path="/fashion-stylist" element={<FashionStylist />} />
          <Route path="/virtual-pet" element={<VirtualPet />} />
          <Route path="/astrology" element={<Astrology />} />
          <Route path="/character-arena" element={<CharacterArena />} />
          <Route path="/ai-music" element={<AIMusic />} />
          <Route path="/mystery-box" element={<MysteryBox />} />
              <Route path="/routine-optimizer" element={<RoutineOptimizer />} />
            <Route path="/ai-experiences" element={<AIExperiences />} />
          <Route path="/brand-builder" element={<BrandBuilder />} />
          <Route path="/home-designer" element={<HomeDesigner />} />
          <Route path="/beauty-studio" element={<BeautyStudio />} />
          <Route path="/ai-music-producer" element={<AIMusicProducer />} />
          <Route path="/plant-care" element={<PlantCare />} />
          <Route path="/ai-tattoo" element={<AITattoo />} />
          <Route path="/kids-homework" element={<KidsHomework />} />
          <Route path="/kids-story-creator" element={<KidsStoryCreator />} />
          <Route path="/kids-math-games" element={<KidsMathGames />} />
          <Route path="/kids-science-lab" element={<KidsScienceLab />} />
          <Route path="/kids-drawing-buddy" element={<KidsDrawingBuddy />} />
          <Route path="/kids-reading-companion" element={<KidsReadingCompanion />} />
          <Route path="/teen-study-planner" element={<TeenStudyPlanner />} />
          <Route path="/photo-restoration" element={<PhotoRestoration />} />
          <Route path="/antique-appraisal" element={<AntiqueAppraisal />} />
          <Route path="/teen-career-counselor" element={<TeenCareerCounselor />} />
          <Route path="/teen-debate-partner" element={<TeenDebatePartner />} />
          <Route path="/teen-college-prep" element={<TeenCollegePrep />} />
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
          <Route path="/schools" element={<Schools />} />
          <Route path="/teacher-dashboard" element={<TeacherDashboard />} />
          <Route path="/healthcare" element={<Healthcare />} />
          <Route path="/corporate-events" element={<CorporateEvents />} />
          <Route path="/brand-battle" element={<BrandBattle />} />
          <Route path="/brain-duel" element={<BrainDuel />} />
          <Route path="/corporate-partnerships" element={<CorporatePartnerships />} />
          <Route path="/collectibles" element={<Collectibles />} />
          <Route path="/fashion-studio" element={<FashionStudio />} />
          <Route path="/nutrition-hub" element={<NutritionHub />} />
          <Route path="/nutrition-subscriptions" element={<NutritionSubscriptions />} />
          <Route path="/minibiz" element={<MiniBizMarketplace />} />
          <Route path="/minibiz/create" element={<CreateBusiness />} />
          <Route path="/analyzer" element={<UniversalAnalyzer />} />
          <Route path="/analyzer/result/:id" element={<AnalyzerResult />} />
          <Route path="/analyzer/pricing" element={<AnalyzerPricing />} />
          <Route path="/analyzer/history" element={<AnalyzerHistory />} />
          <Route path="/analyzer/collections" element={<AnalyzerCollections />} />
          <Route path="/video-ad-generator" element={<VideoAdGenerator />} />
          <Route path="/kids-channel" element={<KidsChannel />} />
          <Route path="/kids-channel/:showId" element={<KidsShowDetail />} />
          <Route path="/coffee" element={<Coffee />} />
          <Route path="/coffee/checkins" element={<CoffeeCheckins />} />
          <Route path="/coffee/buddy" element={<CoffeeBuddy />} />
          <Route path="/ai-clone" element={<AIClone />} />
          <Route path="/parallel-lives" element={<ParallelLives />} />
          <Route path="/emotion-economy" element={<EmotionEconomy />} />
          <Route path="/memory-theft" element={<MemoryTheft />} />
          <Route path="/quantum-social" element={<QuantumSocial />} />
          <Route path="/virtual-influencer-agency" element={<VirtualInfluencerAgency />} />
          <Route path="/ai-content-marketplace" element={<AIContentMarketplace />} />
          <Route path="/print-on-demand" element={<PrintOnDemand />} />
          <Route path="/brand-collaboration" element={<BrandCollaboration />} />
          <Route path="/custom-commissions" element={<CustomCommissions />} />
          <Route path="/stock-content-library" element={<StockContentLibrary />} />
          <Route path="/digital-product-store" element={<DigitalProductStore />} />
          <Route path="/ai-avatar-service" element={<AIAvatarService />} />
          <Route path="/tutorial-platform" element={<TutorialPlatform />} />
          <Route path="/virtual-escape-room" element={<VirtualEscapeRoom />} />
              <Route path="/horse-racing" element={<HorseRacing />} />
              <Route path="/comedy-club" element={<ComedyClub />} />
              <Route path="/comedian-dashboard" element={<ComedianDashboard />} />
              <Route path="/kids-channel/disney-castles" element={<DisneyCastles />} />
              <Route path="/kids-channel/disney-castles/:castleId" element={<DisneyCastleTour />} />
              <Route path="/kids-channel/dinosaur-quiz" element={<DinosaurQuiz />} />
              <Route path="/kids-channel/travel-map" element={<TravelMap />} />
              <Route path="/kids-channel/puppet-theater" element={<PuppetTheater />} />
              <Route path="/kids-channel/circus-academy" element={<CircusAcademy />} />
              <Route path="/kids-channel/masterchef-junior" element={<MasterChefJunior />} />
              <Route path="/kids-channel/cake-decorating" element={<CakeDecorating />} />
              <Route path="/kids-channel/formula1" element={<Formula1Racing />} />
              <Route path="/kids-channel/monster-trucks" element={<MonsterTrucks />} />
              <Route path="/f1-racing" element={<F1Racing />} />
              <Route path="/f1-subscription" element={<F1Subscription />} />
              <Route path="/f1-fantasy-team" element={<F1FantasyTeam />} />
              <Route path="/f1-leaderboard" element={<F1Leaderboard />} />
              <Route path="/masterchef-subscription" element={<MasterChefSubscription />} />
              <Route path="/masterchef/dashboard" element={<MasterChefDashboard />} />
              <Route path="/masterchef/earnings" element={<MasterChefEarnings />} />
              <Route path="/time-reversal-subscription" element={<TimeReversalSubscription />} />
              <Route path="/time-reversal/timeline" element={<TimeReversalTimeline />} />
              <Route path="/time-capsule-subscription" element={<TimeCapsuleSubscription />} />
              <Route path="/holographic-avatars" element={<HolographicAvatars />} />
          <Route path="/crystal-energy-network" element={<CrystalEnergyNetwork />} />
          <Route path="/dna-memory-network" element={<DNAMemoryNetwork />} />
          <Route path="/reincarnation-social" element={<ReincarnationSocial />} />
          <Route path="/blockchain-confessions" element={<BlockchainConfessions />} />
              <Route path="/coffee/leaderboard" element={<CoffeeCheckins />} />
          <Route path="/kids-stories/adventure" element={<ChooseAdventure />} />
          <Route path="/kids-stories/voice-chat" element={<KidsVoiceChat />} />
          <Route path="/kids-stories/create-character" element={<CreateCharacter />} />
          <Route path="/kids-stories/educational" element={<EducationalStories />} />
          <Route path="/kids-stories/bedtime" element={<BedtimeStories />} />
          <Route path="/kids-stories/games" element={<StoryGames />} />
          <Route path="/kids-pricing" element={<KidsPricing />} />
          <Route path="/story-video-demo" element={<StoryVideoDemo />} />
          <Route path="/admin/image-editor" element={<AdminImageEditor />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:handle" element={<ProductDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
        </div>
      </TooltipProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
