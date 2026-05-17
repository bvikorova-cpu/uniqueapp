import { lazyWithRetry as lazy } from "@/utils/lazyWithRetry";

// Core pages must stay lazy too. Importing them synchronously from this shared
// route registry pulls a large homepage/auth graph into the initial App boot,
// which can leave preview/mobile users staring at the global "Loading Unique…" fallback.
export const Home = lazy(() => import("@/pages/Home"));
export const Auth = lazy(() => import("@/pages/Auth"));
export const NotFound = lazy(() => import("@/pages/NotFound"));

// Lazy loaded pages - grouped by feature
export const Wall = lazy(() => import("@/pages/Wall"));
export const Profile = lazy(() => import("@/pages/Profile"));
export const EditProfile = lazy(() => import("@/pages/EditProfile"));
export const Settings = lazy(() => import("@/pages/Settings"));
export const SearchResults = lazy(() => import("@/pages/SearchResults"));
export const Messenger = lazy(() => import("@/pages/Messenger"));
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const PostDetail = lazy(() => import("@/pages/PostDetail"));
export const Index = lazy(() => import("@/pages/Index"));

// Wall subpages
export const Groups = lazy(() => import("@/pages/Groups"));
export const Pages = lazy(() => import("@/pages/Pages"));
export const GroupDetail = lazy(() => import("@/pages/wall/GroupDetail"));
export const PageDetail = lazy(() => import("@/pages/wall/PageDetail"));
export const EventDetail = lazy(() => import("@/pages/wall/EventDetail"));
export const WallSaved = lazy(() => import("@/pages/wall/WallSaved"));
export const WallVideos = lazy(() => import("@/pages/wall/WallVideos"));

// Megatalent
export const Megatalent = lazy(() => import("@/pages/Megatalent"));
export const MegatalentCategory = lazy(() => import("@/pages/megatalent/MegatalentCategory"));
export const MegatalentSuccess = lazy(() => import("@/pages/megatalent/MegatalentSuccess"));
export const MegatalentBattleResults = lazy(() => import("@/pages/megatalent/MegatalentBattleResults"));
export const Megaforum = lazy(() => import("@/pages/Megaforum"));

// Entertainment & Games
export const Games = lazy(() => import("@/pages/Games"));
export const BrainDuel = lazy(() => import("@/pages/BrainDuel"));
export const VirtualEscapeRoom = lazy(() => import("@/pages/VirtualEscapeRoom"));
export const HorseRacing = lazy(() => import("@/pages/HorseRacing"));
export const FootballArena = lazy(() => import("@/pages/FootballArena"));
export const BasketballArena = lazy(() => import("@/pages/BasketballArena"));
export const HockeyArena = lazy(() => import("@/pages/HockeyArena"));
export const TennisArena = lazy(() => import("@/pages/TennisArena"));
export const AmericanFootballArena = lazy(() => import("@/pages/AmericanFootballArena"));
export const ComedyClub = lazy(() => import("@/pages/ComedyClub"));
export const ComedianDashboard = lazy(() => import("@/pages/ComedianDashboard"));
export const ComedyLiveShow = lazy(() => import("@/pages/ComedyLiveShow"));
export const ComedyLiveViewer = lazy(() => import("@/pages/ComedyLiveViewer"));

// Dating & Social
export const Dating = lazy(() => import("@/pages/Dating"));
export const AnonymousDate = lazy(() => import("@/pages/AnonymousDate"));
export const SkillSwap = lazy(() => import("@/pages/SkillSwap"));
export const SkillSwapDashboard = lazy(() => import("@/pages/SkillSwapDashboard"));
export const SkillSwapProfile = lazy(() => import("@/pages/SkillSwapProfile"));
export const SkillSwapSettings = lazy(() => import("@/pages/SkillSwapSettings"));

// Marketplace & E-commerce
export const Marketplace = lazy(() => import("@/pages/Marketplace"));
export const Bazaar = lazy(() => import("@/pages/Bazaar"));
export const Auction = lazy(() => import("@/pages/Auction"));
export const MyAuctions = lazy(() => import("@/pages/MyAuctions"));
export const Shop = lazy(() => import("@/pages/Shop"));
export const ProductDetail = lazy(() => import("@/pages/ProductDetail"));
export const PropertyMarketplace = lazy(() => import("@/pages/PropertyMarketplace"));
export const PropertySubmission = lazy(() => import("@/pages/PropertySubmission"));
export const MyProperties = lazy(() => import("@/pages/MyProperties"));
export const CouponMarketplace = lazy(() => import("@/pages/CouponMarketplace"));
export const CouponBrandPage = lazy(() => import("@/pages/CouponBrandPage"));
export const AdminCouponDisputes = lazy(() => import("@/pages/AdminCouponDisputes"));

// AI & Generation
export const AIGeneration = lazy(() => import("@/pages/AIGeneration"));
export const AIExperiences = lazy(() => import("@/pages/AIExperiences"));
export const BestFriend = lazy(() => import("@/pages/BestFriend"));
export const AICompanions = lazy(() => import("@/pages/AICompanions"));
export const CompanionChat = lazy(() => import("@/pages/CompanionChat"));
export const AIMentor = lazy(() => import("@/pages/AIMentor"));
export const AIMentorChat = lazy(() => import("@/pages/AIMentorChat"));
export const AIClone = lazy(() => import("@/pages/AIClone"));
export const ContentStudio = lazy(() => import("@/pages/ContentStudio"));
export const BeautyStudio = lazy(() => import("@/pages/BeautyStudio"));

export const AITattoo = lazy(() => import("@/pages/AITattoo"));
export const PhotoRestoration = lazy(() => import("@/pages/PhotoRestoration"));
export const UniversalAnalyzer = lazy(() => import("@/pages/UniversalAnalyzer"));
export const AnalyzerResult = lazy(() => import("@/pages/AnalyzerResult"));
export const AnalyzerPricing = lazy(() => import("@/pages/AnalyzerPricing"));
export const AnalyzerHistory = lazy(() => import("@/pages/AnalyzerHistory"));
export const AnalyzerCollections = lazy(() => import("@/pages/AnalyzerCollections"));

// Cooking
export const Cooking = lazy(() => import("@/pages/Cooking"));
export const CookingAI = lazy(() => import("@/pages/CookingAI"));
export const RecipeGenerator = lazy(() => import("@/pages/RecipeGenerator"));
export const MealPlanner = lazy(() => import("@/pages/MealPlanner"));
export const FoodScanner = lazy(() => import("@/pages/FoodScanner"));
export const RestaurantAnalyzer = lazy(() => import("@/pages/RestaurantAnalyzer"));
export const ChefChat = lazy(() => import("@/pages/ChefChat"));
export const WinePairing = lazy(() => import("@/pages/WinePairing"));

// Kids
export const KidsHomework = lazy(() => import("@/pages/KidsHomework"));
export const KidsHomeworkPricing = lazy(() => import("@/pages/KidsHomeworkPricing"));
export const KidsStoryCreator = lazy(() => import("@/pages/KidsStoryCreator"));
export const KidsStoryPricing = lazy(() => import("@/pages/KidsStoryPricing"));
export const KidsScienceLab = lazy(() => import("@/pages/KidsScienceLab"));
export const KidsSciencePricing = lazy(() => import("@/pages/KidsSciencePricing"));
export const KidsScienceAdmin = lazy(() => import("@/pages/KidsScienceAdmin"));
export const KidsDrawingBuddy = lazy(() => import("@/pages/KidsDrawingBuddy"));
export const KidsDrawingPricing = lazy(() => import("@/pages/KidsDrawingPricing"));
export const KidsReadingCompanion = lazy(() => import("@/pages/KidsReadingCompanion"));
export const KidsReadingPricing = lazy(() => import("@/pages/KidsReadingPricing"));
export const KidsAcademy = lazy(() => import("@/pages/KidsAcademy"));
export const ColoringPages = lazy(() => import("@/pages/ColoringPages"));
export const ColoringHub = lazy(() => import("@/pages/coloring/ColoringHub"));
export const BrandArenaHub = lazy(() => import("@/pages/brand-arena/BrandArenaHub"));
export const BrainDuelHub = lazy(() => import("@/pages/brain-duel/BrainDuelHub"));
export const TeenCareerCounselor = lazy(() => import("@/pages/TeenCareerCounselor"));
export const TeenCareerPricing = lazy(() => import("@/pages/TeenCareerPricing"));
export const KidsChannel = lazy(() => import("@/pages/KidsChannel"));
export const KidsHub = lazy(() => import("@/pages/kids/KidsHub"));
export const KidsFeature = lazy(() => import("@/pages/kids/KidsFeature"));
export const KidsShareView = lazy(() => import("@/pages/kids/KidsShareView"));
export const KidsShowDetail = lazy(() => import("@/pages/KidsShowDetail"));
export const ChooseAdventure = lazy(() => import("@/pages/ChooseAdventure"));
export const KidsVoiceChat = lazy(() => import("@/pages/KidsVoiceChat"));
export const KidsVoiceChatPricing = lazy(() => import("@/pages/KidsVoiceChatPricing"));
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
export const FairyCastles = lazy(() => import("@/pages/FairyCastles"));
export const FairyCastleTour = lazy(() => import("@/pages/FairyCastleTour"));
export const FairyAdmin = lazy(() => import("@/pages/FairyAdmin"));
export const CertificateGallery = lazy(() => import("@/pages/CertificateGallery"));
export const KidsMagicLibrary = lazy(() => import("@/pages/KidsMagicLibrary"));
export const KidsParentalDashboard = lazy(() => import("@/pages/KidsParentalDashboard"));

// Education
export const Education = lazy(() => import("@/pages/Education"));
export const PremiumCourses = lazy(() => import("@/pages/PremiumCourses"));
export const Masterclasses = lazy(() => import("@/pages/Masterclasses"));
export const MasterclassLearning = lazy(() => import("@/pages/MasterclassLearning"));
export const InteractiveWorkshops = lazy(() => import("@/pages/InteractiveWorkshops"));
export const CertificationPrograms = lazy(() => import("@/pages/CertificationPrograms"));
export const CourseLearning = lazy(() => import("@/pages/CourseLearning"));
export const CourseDetail = lazy(() => import("@/pages/CourseDetail"));
export const CourseDetailPage = lazy(() => import("@/pages/CourseDetailPage"));
export const CourseLearnPage = lazy(() => import("@/pages/CourseLearnPage"));
export const CoursesHub = lazy(() => import("@/pages/CoursesHub"));
export const GenerateCourses = lazy(() => import("@/pages/GenerateCourses"));
export const MyLearning = lazy(() => import("@/pages/MyLearning"));
export const LanguageLearning = lazy(() => import("@/pages/LanguageLearning"));
export const GenericLearning = lazy(() => import("@/pages/GenericLearning"));

// Subject-specific learning
export const FitnessWellness = lazy(() => import("@/pages/FitnessWellness"));
export const DigitalMarketing = lazy(() => import("@/pages/DigitalMarketing"));
export const Photography = lazy(() => import("@/pages/Photography"));
export const CulinaryArts = lazy(() => import("@/pages/CulinaryArts"));
export const MusicProduction = lazy(() => import("@/pages/MusicProduction"));
export const GraphicDesign = lazy(() => import("@/pages/GraphicDesign"));
export const PublicSpeaking = lazy(() => import("@/pages/PublicSpeaking"));
export const FinancialInvestment = lazy(() => import("@/pages/FinancialInvestment"));
export const CreativeWriting = lazy(() => import("@/pages/CreativeWriting"));

// Health & Wellness
export const FirstAid = lazy(() => import("@/pages/FirstAid"));
export const FitSlim = lazy(() => import("@/pages/FitSlim"));
export const Wellness = lazy(() => import("@/pages/Wellness"));
export const NutritionHub = lazy(() => import("@/pages/NutritionHub"));
export const NutritionSubscriptions = lazy(() => import("@/pages/NutritionSubscriptions"));
export const Psychology = lazy(() => import("@/pages/Psychology"));
export const OnlinePsychologist = lazy(() => import("@/pages/OnlinePsychologist"));
export const SafetyPrevention = lazy(() => import("@/pages/SafetyPrevention"));

// Entertainment & Lifestyle
export const Vacationer = lazy(() => import("@/pages/Vacationer"));
export const DreamJournal = lazy(() => import("@/pages/DreamJournal"));
export const VirtualPet = lazy(() => import("@/pages/VirtualPet"));
export const Astrology = lazy(() => import("@/pages/Astrology"));
export const SecretSanta = lazy(() => import("@/pages/SecretSanta"));
export const PetTranslator = lazy(() => import("@/pages/PetTranslator"));
export const PetTranslatorPricing = lazy(() => import("@/pages/PetTranslatorPricing"));
export const PetsHub = lazy(() => import("@/pages/PetsHub"));
export const PetsAchievements = lazy(() => import("@/pages/PetsAchievements"));
export const PlantCare = lazy(() => import("@/pages/PlantCare"));
export const Coffee = lazy(() => import("@/pages/Coffee"));
export const CoffeeCheckins = lazy(() => import("@/pages/CoffeeCheckins"));
export const CoffeeBuddy = lazy(() => import("@/pages/CoffeeBuddy"));

// Creative & Design
export const BrandBuilder = lazy(() => import("@/pages/BrandBuilder"));
export const HomeDesigner = lazy(() => import("@/pages/HomeDesigner"));
export const CharacterArena = lazy(() => import("@/pages/CharacterArena"));
export const FashionStudio = lazy(() => import("@/pages/FashionStudio"));
export const VideoAdGenerator = lazy(() => import("@/pages/VideoAdGenerator"));
export const CreativeForge = lazy(() => import("@/pages/CreativeForge"));
export const Handwriting = lazy(() => import("@/pages/Handwriting"));

// Ancestors & History
export const FutureFace = lazy(() => import("@/pages/FutureFace"));
export const PastLife = lazy(() => import("@/pages/PastLife"));
export const AntiqueAppraisal = lazy(() => import("@/pages/AntiqueAppraisal"));
export const Collectibles = lazy(() => import("@/pages/Collectibles"));

// Streaming & Live
export const LiveStream = lazy(() => import("@/pages/LiveStream"));
export const LiveStreamList = lazy(() => import("@/pages/LiveStreamList"));
export const Stories = lazy(() => import("@/pages/Stories"));
export const LiveConcerts = lazy(() => import("@/pages/LiveConcerts"));
export const MusicianDashboard = lazy(() => import("@/pages/MusicianDashboard"));

// Sports & Betting
export const SportsPredictor = lazy(() => import("@/pages/SportsPredictor"));
export const SportsAdmin = lazy(() => import("@/pages/SportsAdmin"));
export const AdminSportsMatches = lazy(() => import("@/pages/AdminSportsMatches"));
export const MyPurchasedTips = lazy(() => import("@/pages/MyPurchasedTips"));
export const TipsterDashboard = lazy(() => import("@/pages/TipsterDashboard"));
export const LotteryAI = lazy(() => import("@/pages/LotteryAI"));
export const LotteryHistory = lazy(() => import("@/pages/LotteryHistory"));
export const F1Racing = lazy(() => import("@/pages/F1Racing"));
export const F1Subscription = lazy(() => import("@/pages/F1Subscription"));
export const F1FantasyTeam = lazy(() => import("@/pages/F1FantasyTeam"));
export const F1RacingArena = lazy(() => import("@/pages/F1RacingArena"));
export const F1Leaderboard = lazy(() => import("@/pages/F1Leaderboard"));

// Influencer & Creator
export const InfluKing = lazy(() => import("@/pages/InfluKing"));
export const BrandBattle = lazy(() => import("@/pages/BrandBattle"));
export const SponsorRegistration = lazy(() => import("@/pages/SponsorRegistration"));
export const SponsorDashboard = lazy(() => import("@/pages/SponsorDashboard"));
export const CreatorDashboard = lazy(() => import("@/pages/CreatorDashboard"));
export const CreatorProfile = lazy(() => import("@/pages/CreatorProfile"));
export const DiscoverCreators = lazy(() => import("@/pages/DiscoverCreators"));
export const BecomeCreator = lazy(() => import("@/pages/BecomeCreator"));
export const BrandDashboard = lazy(() => import("@/pages/BrandDashboard"));
export const VirtualInfluencerAgency = lazy(() => import("@/pages/VirtualInfluencerAgency"));
export const InfluencerEarnings = lazy(() => import("@/pages/InfluencerEarnings"));
export const CreatorStudio = lazy(() => import("@/pages/CreatorStudio"));

// Membership & Subscriptions
export const Subscription = lazy(() => import("@/pages/Subscription"));

export const MembershipCommunity = lazy(() => import("@/pages/MembershipCommunity"));
export const PremiumStore = lazy(() => import("@/pages/PremiumStore"));
export const Premium = lazy(() => import("@/pages/Premium"));
export const AICreditsStore = lazy(() => import("@/pages/AICreditsStore"));
export const MysteryBox = lazy(() => import("@/pages/MysteryBox"));

// Jobs & Employment
export const Jobs = lazy(() => import("@/pages/Jobs"));
export const JobPostSuccess = lazy(() => import("@/pages/JobPostSuccess"));
export const SavedJobs = lazy(() => import("@/pages/jobs/SavedJobs"));
export const ApplicationTracker = lazy(() => import("@/pages/jobs/ApplicationTracker"));
export const JobAlerts = lazy(() => import("@/pages/jobs/JobAlerts"));
export const Companies = lazy(() => import("@/pages/jobs/Companies"));
export const CompanyProfile = lazy(() => import("@/pages/jobs/CompanyProfile"));
export const CompanyNew = lazy(() => import("@/pages/jobs/CompanyNew"));
export const SalaryInsights = lazy(() => import("@/pages/jobs/SalaryInsights"));
export const InterviewQuestions = lazy(() => import("@/pages/jobs/InterviewQuestions"));
export const EmployerATS = lazy(() => import("@/pages/jobs/EmployerATS"));
export const CandidateSearch = lazy(() => import("@/pages/jobs/CandidateSearch"));
export const JobAnalytics = lazy(() => import("@/pages/jobs/JobAnalytics"));
export const RejectionTemplates = lazy(() => import("@/pages/jobs/RejectionTemplates"));
export const PersonalizedFeed = lazy(() => import("@/pages/jobs/PersonalizedFeed"));
export const JobsMap = lazy(() => import("@/pages/jobs/JobsMap"));
export const Referrals = lazy(() => import("@/pages/jobs/Referrals"));
export const SkillAssessments = lazy(() => import("@/pages/jobs/SkillAssessments"));
export const AssessmentTake = lazy(() => import("@/pages/jobs/AssessmentTake"));
export const CareerPath = lazy(() => import("@/pages/jobs/CareerPath"));
export const MockInterview = lazy(() => import("@/pages/jobs/MockInterview"));
export const VideoResumes = lazy(() => import("@/pages/jobs/VideoResumes"));
export const DiversitySelfId = lazy(() => import("@/pages/jobs/DiversitySelfId"));
export const DiversityReports = lazy(() => import("@/pages/jobs/DiversityReports"));
export const JobBoost = lazy(() => import("@/pages/jobs/JobBoost"));
export const AIJobDescriptionWriter = lazy(() => import("@/pages/jobs/AIJobDescriptionWriter"));
export const References = lazy(() => import("@/pages/jobs/References"));
export const BackgroundChecks = lazy(() => import("@/pages/jobs/BackgroundChecks"));
export const Onboarding = lazy(() => import("@/pages/jobs/Onboarding"));
export const JobPostingTemplates = lazy(() => import("@/pages/jobs/JobPostingTemplates"));
export const BulkHiring = lazy(() => import("@/pages/jobs/BulkHiring"));
export const HeadhunterMarketplace = lazy(() => import("@/pages/jobs/HeadhunterMarketplace"));
export const AICandidateRanking = lazy(() => import("@/pages/jobs/AICandidateRanking"));
export const EmployerDashboard = lazy(() => import("@/pages/EmployerDashboard"));
export const EmployerVerification = lazy(() => import("@/pages/EmployerVerification"));

// Earnings & Finance
export const Earnings = lazy(() => import("@/pages/Earnings"));
export const InstructorEarnings = lazy(() => import("@/pages/InstructorEarnings"));
export const Rewards = lazy(() => import("@/pages/Rewards"));
export const XPAuditLog = lazy(() => import("@/pages/XPAuditLog"));
export const AdminXPAudit = lazy(() => import("@/pages/AdminXPAudit"));
export const AdminXPReconciliation = lazy(() => import("@/pages/AdminXPReconciliation"));
export const Referral = lazy(() => import("@/pages/Referral"));

// Quiz & Challenges
export const Quiz = lazy(() => import("@/pages/Quiz"));
export const IQPlatform = lazy(() => import("@/pages/IQPlatform"));
export const IQTrophyProfile = lazy(() => import("@/pages/IQTrophyProfile"));
export const IQPublicProfile = lazy(() => import("@/pages/IQPublicProfile"));
export const IQLeaderboard = lazy(() => import("@/pages/IQLeaderboard"));
export const LieDetector = lazy(() => import("@/pages/LieDetector"));

// Shadow Arena
export const ShadowArena = lazy(() => import("@/pages/ShadowArena"));
export const ShadowArenaDashboard = lazy(() => import("@/pages/ShadowArenaDashboard"));
export const ShadowArenaSubmitStory = lazy(() => import("@/pages/ShadowArenaSubmitStory"));
export const ShadowArenaBattles = lazy(() => import("@/pages/ShadowArenaBattles"));
export const ShadowArenaBattleDetail = lazy(() => import("@/pages/ShadowArenaBattleDetail"));
export const ShadowArenaBattleSubmit = lazy(() => import("@/pages/ShadowArenaBattleSubmit"));
export const ShadowArenaStoryDetail = lazy(() => import("@/pages/ShadowArenaStoryDetail"));

// MasterChef
export const MasterChefSubscription = lazy(() => import("@/pages/MasterChefSubscription"));
export const MasterChefDashboard = lazy(() => import("@/pages/MasterChefDashboard"));
export const MasterChefCompetitions = lazy(() => import("@/pages/MasterChefCompetitions"));
export const MasterChefCompetitionsGallery = lazy(() => import("@/pages/MasterChefCompetitionsGallery"));
export const MasterChefEarnings = lazy(() => import("@/pages/MasterChefEarnings"));

// Time & Capsule
export const TimeReversalSubscription = lazy(() => import("@/pages/TimeReversalSubscription"));
export const TimeReversalSocial = lazy(() => import("@/pages/TimeReversalSocial"));
export const TimeReversalDashboard = lazy(() => import("@/pages/TimeReversalDashboard"));
export const TimeReversalTimeline = lazy(() => import("@/pages/TimeReversalTimeline"));
export const TimeCapsuleSubscription = lazy(() => import("@/pages/TimeCapsuleSubscription"));
export const TimeCapsule = lazy(() => import("@/pages/TimeCapsule"));

// Experimental & Future

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

// Fundraising
export const FundraisingHub = lazy(() => import("@/pages/fundraising/FundraisingHub"));
export const MedicalFundraising = lazy(() => import("@/pages/fundraising/MedicalFundraising"));
export const MedicalDetail = lazy(() => import("@/pages/fundraising/MedicalDetail"));
export const CreateMedicalCampaign = lazy(() => import("@/pages/fundraising/CreateMedicalCampaign"));
export const DonationReceipt = lazy(() => import("@/pages/fundraising/DonationReceipt"));
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

// Home Decor
export const HomeDecorMarketplace = lazy(() => import("@/pages/HomeDecorMarketplace"));
export const HomeDecorSubscription = lazy(() => import("@/pages/HomeDecorSubscription"));

// Admin
export const Admin = lazy(() => import("@/pages/Admin"));
export const AdminTransactions = lazy(() => import("@/pages/AdminTransactions"));
export const AdminCorporateInquiries = lazy(() => import("@/pages/AdminCorporateInquiries"));
export const AdminTipsters = lazy(() => import("@/pages/AdminTipsters"));
export const AdminMasterChefPayouts = lazy(() => import("@/pages/AdminMasterChefPayouts"));
export const AdminComedyPayouts = lazy(() => import("@/pages/AdminComedyPayouts"));
export const AdminInfluencerPayouts = lazy(() => import("@/pages/AdminInfluencerPayouts"));
export const AdminBrandCampaigns = lazy(() => import("@/pages/AdminBrandCampaigns"));
export const AdminPlatformEarnings = lazy(() => import("@/pages/AdminPlatformEarnings"));
export const AdminIQDashboard = lazy(() => import("@/pages/AdminIQDashboard"));
export const AdminIQAnalytics = lazy(() => import("@/pages/AdminIQAnalytics"));
export const AdminVerifications = lazy(() => import("@/pages/AdminVerifications"));
export const AdminBazaarTrust = lazy(() => import("@/pages/AdminBazaarTrust"));
export const AdminWithdrawals = lazy(() => import("@/pages/AdminWithdrawals"));
export const AdminImageEditor = lazy(() => import("@/pages/AdminImageEditor"));
export const AdminPaymentDashboard = lazy(() => import("@/pages/AdminPaymentDashboard"));
export const CampaignApprovals = lazy(() => import("@/pages/admin/CampaignApprovals"));
export const WithdrawalRequests = lazy(() => import("@/pages/admin/WithdrawalRequests"));
export const CampaignSuccess = lazy(() => import("@/pages/fundraising/CampaignSuccess"));

// Glamour World
export const GlamourWorld = lazy(() => import("@/pages/GlamourWorld"));

// E2E test harness — only used by Playwright. Page itself is a no-op in production.
export const E2EAnonymousDateMatches = lazy(
  () => import("@/pages/E2EAnonymousDateMatches")
);

// Misc
export const Contact = lazy(() => import("@/pages/Contact"));
export const Terms = lazy(() => import("@/pages/Terms"));
export const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
export const MonetizationIdeas = lazy(() => import("@/pages/MonetizationIdeas"));
export const StockContentLibrary = lazy(() => import("@/pages/StockContentLibrary"));
export const TutorialPlatform = lazy(() => import("@/pages/TutorialPlatform"));
export const PaymentDocumentation = lazy(() => import("@/pages/PaymentDocumentation"));
export const TeacherDashboard = lazy(() => import("@/pages/TeacherDashboard"));
export const HealthcareProviderDashboard = lazy(() => import("@/pages/HealthcareProviderDashboard"));
export const HealthcareContentLibrary = lazy(() => import("@/pages/HealthcareContentLibrary"));

// Components that need lazy loading
export const QuizCreator = lazy(() => import("@/components/education/QuizCreator"));
export const QuizTaker = lazy(() => import("@/components/education/QuizTaker"));
