import { lazy } from "react";

// Critical pages - loaded immediately
export { default as Index } from "@/pages/Index";
export { default as Auth } from "@/pages/Auth";
export { default as NotFound } from "@/pages/NotFound";

// Lazy loaded pages - grouped by feature
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const Profile = lazy(() => import("@/pages/Profile"));
export const EditProfile = lazy(() => import("@/pages/EditProfile"));
export const Settings = lazy(() => import("@/pages/Settings"));
export const Wall = lazy(() => import("@/pages/Wall"));
export const SearchResults = lazy(() => import("@/pages/SearchResults"));
export const Groups = lazy(() => import("@/pages/Groups"));
export const Pages = lazy(() => import("@/pages/Pages"));
export const Home = lazy(() => import("@/pages/Home"));
export const Contact = lazy(() => import("@/pages/Contact"));
export const Terms = lazy(() => import("@/pages/Terms"));

// Wall features
export const WallFeed = lazy(() => import("@/pages/wall/WallFeed"));
export const WallMessages = lazy(() => import("@/pages/wall/WallMessages"));
export const WallFriends = lazy(() => import("@/pages/wall/WallFriends"));
export const WallGroups = lazy(() => import("@/pages/wall/WallGroups"));
export const WallPages = lazy(() => import("@/pages/wall/WallPages"));
export const WallVideos = lazy(() => import("@/pages/wall/WallVideos"));
export const WallEvents = lazy(() => import("@/pages/wall/WallEvents"));
export const WallSaved = lazy(() => import("@/pages/wall/WallSaved"));
export const WallTrending = lazy(() => import("@/pages/wall/WallTrending"));
export const GroupDetail = lazy(() => import("@/pages/wall/GroupDetail"));
export const PageDetail = lazy(() => import("@/pages/wall/PageDetail"));
export const EventDetail = lazy(() => import("@/pages/wall/EventDetail"));

// Messenger & Social
export const Messenger = lazy(() => import("@/pages/Messenger"));
export const Stories = lazy(() => import("@/pages/Stories"));
export const PostDetail = lazy(() => import("@/pages/PostDetail"));
export const Megaforum = lazy(() => import("@/pages/Megaforum"));

// Megatalent
export const Megatalent = lazy(() => import("@/pages/Megatalent"));
export const MegatalentCategory = lazy(() => import("@/pages/megatalent/MegatalentCategory"));
export const MegatalentSuccess = lazy(() => import("@/pages/megatalent/MegatalentSuccess"));

// Subscription & Store
export const Subscription = lazy(() => import("@/pages/Subscription"));

export const PremiumStore = lazy(() => import("@/pages/PremiumStore"));
export const AICreditsStore = lazy(() => import("@/pages/AICreditsStore"));
export const MysteryBox = lazy(() => import("@/pages/MysteryBox"));
export const Shop = lazy(() => import("@/pages/Shop"));
export const ProductDetail = lazy(() => import("@/pages/ProductDetail"));

// AI Features
export const AIGeneration = lazy(() => import("@/pages/AIGeneration"));
export const BestFriend = lazy(() => import("@/pages/BestFriend"));
export const AICompanions = lazy(() => import("@/pages/AICompanions"));
export const CompanionChat = lazy(() => import("@/pages/CompanionChat"));
export const AIMentor = lazy(() => import("@/pages/AIMentor"));
export const AIMentorChat = lazy(() => import("@/pages/AIMentorChat"));
export const AIClone = lazy(() => import("@/pages/AIClone"));
export const AIExperiences = lazy(() => import("@/pages/AIExperiences"));

// Kids Features
export const KidsHomework = lazy(() => import("@/pages/KidsHomework"));
export const KidsStoryCreator = lazy(() => import("@/pages/KidsStoryCreator"));
export const KidsStoryPricing = lazy(() => import("@/pages/KidsStoryPricing"));
export const KidsScienceLab = lazy(() => import("@/pages/KidsScienceLab"));
export const KidsSciencePricing = lazy(() => import("@/pages/KidsSciencePricing"));
export const KidsScienceAdmin = lazy(() => import("@/pages/KidsScienceAdmin"));
export const KidsDrawingBuddy = lazy(() => import("@/pages/KidsDrawingBuddy"));
export const KidsReadingCompanion = lazy(() => import("@/pages/KidsReadingCompanion"));
export const KidsAcademy = lazy(() => import("@/pages/KidsAcademy"));
export const ColoringPages = lazy(() => import("@/pages/ColoringPages"));
export const TeenCareerCounselor = lazy(() => import("@/pages/TeenCareerCounselor"));
export const KidsChannel = lazy(() => import("@/pages/KidsChannel"));
export const KidsShowDetail = lazy(() => import("@/pages/KidsShowDetail"));
export const ChooseAdventure = lazy(() => import("@/pages/ChooseAdventure"));
export const KidsVoiceChat = lazy(() => import("@/pages/KidsVoiceChat"));
export const CreateCharacter = lazy(() => import("@/pages/CreateCharacter"));
export const CharacterGalleryPage = lazy(() => import("@/pages/CharacterGalleryPage"));
export const CharacterGallery = lazy(() => import("@/pages/CharacterGallery"));
export const CharacterBattle = lazy(() => import("@/pages/CharacterBattle"));
export const EducationalStories = lazy(() => import("@/pages/EducationalStories"));
export const BedtimeStories = lazy(() => import("@/pages/BedtimeStories"));
export const StoryGames = lazy(() => import("@/pages/StoryGames"));
export const KidsPricing = lazy(() => import("@/pages/KidsPricing"));
export const StoryVideoDemo = lazy(() => import("@/pages/StoryVideoDemo"));
export const StoryGallery = lazy(() => import("@/pages/StoryGallery"));
export const SharedStory = lazy(() => import("@/pages/SharedStory"));
export const KidsMagicLibrary = lazy(() => import("@/pages/KidsMagicLibrary"));
export const KidsParentalDashboard = lazy(() => import("@/pages/KidsParentalDashboard"));

// Lifestyle
export const Vacationer = lazy(() => import("@/pages/Vacationer"));
export const Dating = lazy(() => import("@/pages/Dating"));
export const FirstAid = lazy(() => import("@/pages/FirstAid"));
export const FitSlim = lazy(() => import("@/pages/FitSlim"));
export const DreamJournal = lazy(() => import("@/pages/DreamJournal"));
export const VirtualPet = lazy(() => import("@/pages/VirtualPet"));
export const Astrology = lazy(() => import("@/pages/Astrology"));
export const PetTranslator = lazy(() => import("@/pages/PetTranslator"));
export const PetTranslatorPricing = lazy(() => import("@/pages/PetTranslatorPricing"));
export const Psychology = lazy(() => import("@/pages/Psychology"));
export const OnlinePsychologist = lazy(() => import("@/pages/OnlinePsychologist"));
export const Quiz = lazy(() => import("@/pages/Quiz"));
export const Wellness = lazy(() => import("@/pages/Wellness"));
export const SafetyPrevention = lazy(() => import("@/pages/SafetyPrevention"));

// Cooking
export const Cooking = lazy(() => import("@/pages/Cooking"));
export const CookingAI = lazy(() => import("@/pages/CookingAI"));
export const RecipeGenerator = lazy(() => import("@/pages/RecipeGenerator"));
export const MealPlanner = lazy(() => import("@/pages/MealPlanner"));
export const FoodScanner = lazy(() => import("@/pages/FoodScanner"));
export const RestaurantAnalyzer = lazy(() => import("@/pages/RestaurantAnalyzer"));
export const ChefChat = lazy(() => import("@/pages/ChefChat"));
export const WinePairing = lazy(() => import("@/pages/WinePairing"));

// Marketplace
export const Marketplace = lazy(() => import("@/pages/Marketplace"));
export const Bazaar = lazy(() => import("@/pages/Bazaar"));
export const Auction = lazy(() => import("@/pages/Auction"));
export const PropertyMarketplace = lazy(() => import("@/pages/PropertyMarketplace"));
export const PropertySubmission = lazy(() => import("@/pages/PropertySubmission"));
export const MyProperties = lazy(() => import("@/pages/MyProperties"));
export const HomeDecorMarketplace = lazy(() => import("@/pages/HomeDecorMarketplace"));
export const HomeDecorSubscription = lazy(() => import("@/pages/HomeDecorSubscription"));
export const StockContentLibrary = lazy(() => import("@/pages/StockContentLibrary"));
export const CouponMarketplace = lazy(() => import("@/pages/CouponMarketplace"));

// Education
export const Education = lazy(() => import("@/pages/Education"));
export const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
export const GenerateCourses = lazy(() => import("@/pages/GenerateCourses"));
export const PremiumCourses = lazy(() => import("@/pages/PremiumCourses"));
export const Masterclasses = lazy(() => import("@/pages/Masterclasses"));
export const MasterclassLearning = lazy(() => import("@/pages/MasterclassLearning"));
export const InteractiveWorkshops = lazy(() => import("@/pages/InteractiveWorkshops"));
export const CertificationPrograms = lazy(() => import("@/pages/CertificationPrograms"));
export const CourseLearning = lazy(() => import("@/pages/CourseLearning"));
export const LanguageLearning = lazy(() => import("@/pages/LanguageLearning"));
export const FitnessWellness = lazy(() => import("@/pages/FitnessWellness"));
export const DigitalMarketing = lazy(() => import("@/pages/DigitalMarketing"));
export const Photography = lazy(() => import("@/pages/Photography"));
export const CulinaryArts = lazy(() => import("@/pages/CulinaryArts"));
export const MusicProduction = lazy(() => import("@/pages/MusicProduction"));
export const GraphicDesign = lazy(() => import("@/pages/GraphicDesign"));
export const PublicSpeaking = lazy(() => import("@/pages/PublicSpeaking"));
export const FinancialInvestment = lazy(() => import("@/pages/FinancialInvestment"));
export const CreativeWriting = lazy(() => import("@/pages/CreativeWriting"));
export const Collectibles = lazy(() => import("@/pages/Collectibles"));
export const GenericLearning = lazy(() => import("@/pages/GenericLearning"));
export const CoursesHub = lazy(() => import("@/pages/CoursesHub"));
export const CourseDetailPage = lazy(() => import("@/pages/CourseDetailPage"));
export const CourseLearnPage = lazy(() => import("@/pages/CourseLearnPage"));
export const BecomeCreator = lazy(() => import("@/pages/BecomeCreator"));
export const InstructorEarnings = lazy(() => import("@/pages/InstructorEarnings"));
export const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
export const MyLearning = lazy(() => import("@/pages/MyLearning"));
export const TeacherDashboard = lazy(() => import("@/pages/TeacherDashboard"));
export const TutorialPlatform = lazy(() => import("@/pages/TutorialPlatform"));

// Games & Entertainment
export const Games = lazy(() => import("@/pages/Games"));
export const Rewards = lazy(() => import("@/pages/Rewards"));
export const LiveStream = lazy(() => import("@/pages/LiveStream"));
export const LiveStreamList = lazy(() => import("@/pages/LiveStreamList"));
export const CharacterArena = lazy(() => import("@/pages/CharacterArena"));
export const BrainDuel = lazy(() => import("@/pages/BrainDuel"));
export const VirtualEscapeRoom = lazy(() => import("@/pages/VirtualEscapeRoom"));
export const HorseRacing = lazy(() => import("@/pages/HorseRacing"));
export const F1Racing = lazy(() => import("@/pages/F1Racing"));
export const F1Subscription = lazy(() => import("@/pages/F1Subscription"));
export const F1FantasyTeam = lazy(() => import("@/pages/F1FantasyTeam"));
export const F1RacingArena = lazy(() => import("@/pages/F1RacingArena"));
export const F1Leaderboard = lazy(() => import("@/pages/F1Leaderboard"));

// Comedy
export const ComedyClub = lazy(() => import("@/pages/ComedyClub"));
export const ComedianDashboard = lazy(() => import("@/pages/ComedianDashboard"));
export const ComedyLiveShow = lazy(() => import("@/pages/ComedyLiveShow"));
export const ComedyLiveViewer = lazy(() => import("@/pages/ComedyLiveViewer"));

// Music
export const LiveConcerts = lazy(() => import("@/pages/LiveConcerts"));
export const MusicianDashboard = lazy(() => import("@/pages/MusicianDashboard"));
export const AIMusicProducer = lazy(() => import("@/pages/AIMusicProducer"));

// Creative Tools
export const ContentStudio = lazy(() => import("@/pages/ContentStudio"));
export const FashionStudio = lazy(() => import("@/pages/FashionStudio"));
export const BeautyStudio = lazy(() => import("@/pages/BeautyStudio"));
export const AITattoo = lazy(() => import("@/pages/AITattoo"));
export const HomeDesigner = lazy(() => import("@/pages/HomeDesigner"));
export const PlantCare = lazy(() => import("@/pages/PlantCare"));
export const PhotoRestoration = lazy(() => import("@/pages/PhotoRestoration"));
export const AntiqueAppraisal = lazy(() => import("@/pages/AntiqueAppraisal"));
export const VideoAdGenerator = lazy(() => import("@/pages/VideoAdGenerator"));
export const Handwriting = lazy(() => import("@/pages/Handwriting"));
export const CreativeForge = lazy(() => import("@/pages/CreativeForge"));

// Business & Jobs
export const Jobs = lazy(() => import("@/pages/Jobs"));
export const EmployerDashboard = lazy(() => import("@/pages/EmployerDashboard"));
export const EmployerVerification = lazy(() => import("@/pages/EmployerVerification"));
export const BrandBuilder = lazy(() => import("@/pages/BrandBuilder"));
export const BrandBattle = lazy(() => import("@/pages/BrandBattle"));
export const BrandDashboard = lazy(() => import("@/pages/BrandDashboard"));
export const SponsorRegistration = lazy(() => import("@/pages/SponsorRegistration"));
export const SponsorDashboard = lazy(() => import("@/pages/SponsorDashboard"));
export const MonetizationIdeas = lazy(() => import("@/pages/MonetizationIdeas"));

// Influencer
export const InfluKing = lazy(() => import("@/pages/InfluKing"));
export const Referral = lazy(() => import("@/pages/Referral"));
export const Earnings = lazy(() => import("@/pages/Earnings"));
export const InfluencerEarnings = lazy(() => import("@/pages/InfluencerEarnings"));
export const VirtualInfluencerAgency = lazy(() => import("@/pages/VirtualInfluencerAgency"));
export const MembershipCommunity = lazy(() => import("@/pages/MembershipCommunity"));
export const CreatorDashboard = lazy(() => import("@/pages/CreatorDashboard"));
export const CreatorProfile = lazy(() => import("@/pages/CreatorProfile"));
export const DiscoverCreators = lazy(() => import("@/pages/DiscoverCreators"));

// Ancestor & Time
export const FutureFace = lazy(() => import("@/pages/FutureFace"));
export const TimeReversalSubscription = lazy(() => import("@/pages/TimeReversalSubscription"));
export const TimeReversalSocial = lazy(() => import("@/pages/TimeReversalSocial"));
export const TimeReversalDashboard = lazy(() => import("@/pages/TimeReversalDashboard"));
export const TimeReversalTimeline = lazy(() => import("@/pages/TimeReversalTimeline"));
export const TimeCapsuleSubscription = lazy(() => import("@/pages/TimeCapsuleSubscription"));
export const TimeCapsule = lazy(() => import("@/pages/TimeCapsule"));
export const PastLife = lazy(() => import("@/pages/PastLife"));

// Sports & Betting
export const SportsPredictor = lazy(() => import("@/pages/SportsPredictor"));
export const SportsAdmin = lazy(() => import("@/pages/SportsAdmin"));
export const AdminSportsMatches = lazy(() => import("@/pages/AdminSportsMatches"));
export const MyPurchasedTips = lazy(() => import("@/pages/MyPurchasedTips"));
export const TipsterDashboard = lazy(() => import("@/pages/TipsterDashboard"));
export const LotteryAI = lazy(() => import("@/pages/LotteryAI"));
export const LotteryHistory = lazy(() => import("@/pages/LotteryHistory"));

// Shadow Arena
export const ShadowArena = lazy(() => import("@/pages/ShadowArena"));
export const ShadowArenaDashboard = lazy(() => import("@/pages/ShadowArenaDashboard"));
export const ShadowArenaSubmitStory = lazy(() => import("@/pages/ShadowArenaSubmitStory"));
export const ShadowArenaBattles = lazy(() => import("@/pages/ShadowArenaBattles"));
export const ShadowArenaBattleDetail = lazy(() => import("@/pages/ShadowArenaBattleDetail"));
export const ShadowArenaBattleSubmit = lazy(() => import("@/pages/ShadowArenaBattleSubmit"));
export const ShadowArenaStoryDetail = lazy(() => import("@/pages/ShadowArenaStoryDetail"));

// Disney
export const DisneyCastles = lazy(() => import("@/pages/DisneyCastles"));
export const DisneyCastleTour = lazy(() => import("@/pages/DisneyCastleTour"));
export const DisneyAdmin = lazy(() => import("@/pages/DisneyAdmin"));

// MasterChef
export const MasterChefSubscription = lazy(() => import("@/pages/MasterChefSubscription"));
export const MasterChefDashboard = lazy(() => import("@/pages/MasterChefDashboard"));
export const MasterChefCompetitions = lazy(() => import("@/pages/MasterChefCompetitions"));
export const MasterChefCompetitionsGallery = lazy(() => import("@/pages/MasterChefCompetitionsGallery"));
export const MasterChefEarnings = lazy(() => import("@/pages/MasterChefEarnings"));

// Nutrition & Health
export const NutritionHub = lazy(() => import("@/pages/NutritionHub"));
export const NutritionSubscriptions = lazy(() => import("@/pages/NutritionSubscriptions"));
export const HealthcareProviderDashboard = lazy(() => import("@/pages/HealthcareProviderDashboard"));
export const HealthcareContentLibrary = lazy(() => import("@/pages/HealthcareContentLibrary"));

// Analyzer
export const UniversalAnalyzer = lazy(() => import("@/pages/UniversalAnalyzer"));
export const AnalyzerResult = lazy(() => import("@/pages/AnalyzerResult"));
export const AnalyzerPricing = lazy(() => import("@/pages/AnalyzerPricing"));
export const AnalyzerHistory = lazy(() => import("@/pages/AnalyzerHistory"));
export const AnalyzerCollections = lazy(() => import("@/pages/AnalyzerCollections"));

// Coffee
export const Coffee = lazy(() => import("@/pages/Coffee"));
export const CoffeeCheckins = lazy(() => import("@/pages/CoffeeCheckins"));
export const CoffeeBuddy = lazy(() => import("@/pages/CoffeeBuddy"));

// Social Experiments
export const ParallelLives = lazy(() => import("@/pages/ParallelLives"));
export const EmotionEconomy = lazy(() => import("@/pages/EmotionEconomy"));
export const QuantumSocial = lazy(() => import("@/pages/QuantumSocial"));
export const HolographicAvatars = lazy(() => import("@/pages/HolographicAvatars"));
export const CrystalEnergyNetwork = lazy(() => import("@/pages/CrystalEnergyNetwork"));
export const CrystalMarketplace = lazy(() => import("@/pages/CrystalMarketplace"));
export const DNAMemoryNetwork = lazy(() => import("@/pages/DNAMemoryNetwork"));
export const ReincarnationSocial = lazy(() => import("@/pages/ReincarnationSocial"));
export const BlockchainConfessions = lazy(() => import("@/pages/BlockchainConfessions"));
export const PhobiaTrading = lazy(() => import("@/pages/PhobiaTrading"));
export const MultiverseNetwork = lazy(() => import("@/pages/MultiverseNetwork"));
export const SecretSanta = lazy(() => import("@/pages/SecretSanta"));
export const SkillSwap = lazy(() => import("@/pages/SkillSwap"));
export const SkillSwapProfile = lazy(() => import("@/pages/SkillSwapProfile"));
export const SkillSwapSettings = lazy(() => import("@/pages/SkillSwapSettings"));
export const SkillSwapDashboard = lazy(() => import("@/pages/SkillSwapDashboard"));
export const AnonymousDate = lazy(() => import("@/pages/AnonymousDate"));
export const LieDetector = lazy(() => import("@/pages/LieDetector"));

// IQ Platform
export const IQPlatform = lazy(() => import("@/pages/IQPlatform"));
export const CertificateGallery = lazy(() => import("@/pages/CertificateGallery"));

// Fundraising
export const FundraisingHub = lazy(() => import("@/pages/fundraising/FundraisingHub"));
export const MedicalFundraising = lazy(() => import("@/pages/fundraising/MedicalFundraising"));
export const MedicalDetail = lazy(() => import("@/pages/fundraising/MedicalDetail"));
export const CreateMedicalCampaign = lazy(() => import("@/pages/fundraising/CreateMedicalCampaign"));
export const FundraisingDashboard = lazy(() => import("@/pages/fundraising/FundraisingDashboard"));
export const CampaignDashboard = lazy(() => import("@/pages/fundraising/CampaignDashboard"));
export const DreamMaker = lazy(() => import("@/pages/fundraising/DreamMaker"));
export const CreateDreamCampaign = lazy(() => import("@/pages/fundraising/CreateDreamCampaign"));
export const DreamDetail = lazy(() => import("@/pages/fundraising/DreamDetail"));
export const CommunityHero = lazy(() => import("@/pages/fundraising/CommunityHero"));
export const CreateHeroCampaign = lazy(() => import("@/pages/fundraising/CreateHeroCampaign"));
export const HeroDetail = lazy(() => import("@/pages/fundraising/HeroDetail"));
export const PetRescue = lazy(() => import("@/pages/fundraising/PetRescue"));
export const CreatePetCampaign = lazy(() => import("@/pages/fundraising/CreatePetCampaign"));
export const PetDetail = lazy(() => import("@/pages/fundraising/PetDetail"));
export const StudentSupport = lazy(() => import("@/pages/fundraising/StudentSupport"));
export const CreateStudentCampaign = lazy(() => import("@/pages/fundraising/CreateStudentCampaign"));
export const StudentDetail = lazy(() => import("@/pages/fundraising/StudentDetail"));
export const CrisisRelief = lazy(() => import("@/pages/fundraising/CrisisRelief"));
export const CreateCrisisCampaign = lazy(() => import("@/pages/fundraising/CreateCrisisCampaign"));
export const CrisisDetail = lazy(() => import("@/pages/fundraising/CrisisDetail"));
export const TalentSponsorship = lazy(() => import("@/pages/fundraising/TalentSponsorship"));
export const CreateTalentCampaign = lazy(() => import("@/pages/fundraising/CreateTalentCampaign"));
export const TalentDetail = lazy(() => import("@/pages/fundraising/TalentDetail"));

// Admin Pages
export const Admin = lazy(() => import("@/pages/Admin"));
export const AdminTransactions = lazy(() => import("@/pages/AdminTransactions"));
export const AdminCorporateInquiries = lazy(() => import("@/pages/AdminCorporateInquiries"));
export const AdminTipsters = lazy(() => import("@/pages/AdminTipsters"));
export const AdminMasterChefPayouts = lazy(() => import("@/pages/AdminMasterChefPayouts"));
export const AdminComedyPayouts = lazy(() => import("@/pages/AdminComedyPayouts"));
export const AdminInfluencerPayouts = lazy(() => import("@/pages/AdminInfluencerPayouts"));
export const AdminBrandCampaigns = lazy(() => import("@/pages/AdminBrandCampaigns"));
export const AdminPlatformEarnings = lazy(() => import("@/pages/AdminPlatformEarnings"));
export const AdminVerifications = lazy(() => import("@/pages/AdminVerifications"));
export const AdminWithdrawals = lazy(() => import("@/pages/AdminWithdrawals"));
export const AdminImageEditor = lazy(() => import("@/pages/AdminImageEditor"));
export const AdminPaymentDashboard = lazy(() => import("@/pages/AdminPaymentDashboard"));
export const PaymentDocumentation = lazy(() => import("@/pages/PaymentDocumentation"));
export const CampaignApprovals = lazy(() => import("@/pages/admin/CampaignApprovals"));
export const WithdrawalRequests = lazy(() => import("@/pages/admin/WithdrawalRequests"));
export const CampaignSuccess = lazy(() => import("@/pages/fundraising/CampaignSuccess"));

// Education Components
export const QuizCreator = lazy(() => import("@/components/education/QuizCreator"));
export const QuizTaker = lazy(() => import("@/components/education/QuizTaker"));
