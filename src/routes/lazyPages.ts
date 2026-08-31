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
export const SecuritySettings = lazy(() => import("@/pages/SecuritySettings"));
export const SearchResults = lazy(() => import("@/pages/SearchResults"));
export const Messenger = lazy(() => import("@/pages/Messenger"));
export const ResetPassword = lazy(() => import("@/pages/ResetPassword"));
export const AuthCallback = lazy(() => import("@/pages/AuthCallback"));
export const PostDetail = lazy(() => import("@/pages/PostDetail"));
export const Index = lazy(() => import("@/pages/Index"));

// Wall subpages
export const Groups = lazy(() => import("@/pages/wall/WallGroups"));
export const Pages = lazy(() => import("@/pages/wall/WallPages"));
export const GroupDetail = lazy(() => import("@/pages/wall/GroupDetail"));
export const PageDetail = lazy(() => import("@/pages/wall/PageDetail"));
export const EventDetail = lazy(() => import("@/pages/wall/EventDetail"));
export const WallSaved = lazy(() => import("@/pages/wall/WallSaved"));
export const WallVideos = lazy(() => import("@/pages/wall/WallVideos"));
export const PremiumVideos = lazy(() => import("@/pages/PremiumVideos"));
export const Shorts = lazy(() => import("@/pages/Shorts"));
export const Pitch = lazy(() => import("@/pages/Pitch"));

// Megatalent
export const Megatalent = lazy(() => import("@/pages/Megatalent"));
export const MegatalentCategory = lazy(() => import("@/pages/megatalent/MegatalentCategory"));
export const MegatalentPost = lazy(() => import("@/pages/megatalent/MegatalentPost"));
export const MegatalentSuccess = lazy(() => import("@/pages/megatalent/MegatalentSuccess"));
export const MegatalentBattleResults = lazy(() => import("@/pages/megatalent/MegatalentBattleResults"));
export const Megaforum = lazy(() => import("@/pages/Megaforum"));

// Entertainment & Games
export const Games = lazy(() => import("@/pages/Games"));
export const GamesHub = lazy(() => import("@/pages/GamesHub"));
export const BrainDuel = lazy(() => import("@/pages/BrainDuel"));
export const VirtualEscapeRoom = lazy(() => import("@/pages/VirtualEscapeRoom"));
export const HorseRacing = lazy(() => import("@/pages/HorseRacing"));
export const ComedyClub = lazy(() => import("@/pages/ComedyClub"));
export const ComedianDashboard = lazy(() => import("@/pages/ComedianDashboard"));
export const ComedyLiveShow = lazy(() => import("@/pages/ComedyLiveShow"));
export const ComedyLiveViewer = lazy(() => import("@/pages/ComedyLiveViewer"));

// Dating & Social
export const Dating = lazy(() => import("@/pages/Dating"));
export const AnonymousDate = lazy(() => import("@/pages/AnonymousDate"));

// Marketplace & E-commerce
export const Marketplace = lazy(() => import("@/pages/Marketplace"));
export const Bazaar = lazy(() => import("@/pages/Bazaar"));
export const Auction = lazy(() => import("@/pages/Auction"));
export const MyAuctions = lazy(() => import("@/pages/MyAuctions"));
export const PropertyMarketplace = lazy(() => import("@/pages/PropertyMarketplace"));
export const PropertySubmission = lazy(() => import("@/pages/PropertySubmission"));
export const MyProperties = lazy(() => import("@/pages/MyProperties"));
export const CouponMarketplace = lazy(() => import("@/pages/CouponMarketplace"));
export const CouponCreate = lazy(() => import("@/pages/CouponCreate"));
export const CouponMessages = lazy(() => import("@/pages/CouponMessages"));
export const CouponBrandPage = lazy(() => import("@/pages/CouponBrandPage"));
export const AdminCouponDisputes = lazy(() => import("@/pages/AdminCouponDisputes"));

// AI & Generation
export const AIGeneration = lazy(() => import("@/pages/AIGeneration"));

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
export const KidsPuzzles = lazy(() => import("@/pages/KidsPuzzles"));
export const AdultPuzzles = lazy(() => import("@/pages/AdultPuzzles"));
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
export const BrandArenaHub = lazy(() => import("@/pages/brand-arena/BrandArenaHub"));
export const BrainDuelHub = lazy(() => import("@/pages/brain-duel/BrainDuelHub"));
export const TeenCareerCounselor = lazy(() => import("@/pages/TeenCareerCounselor"));
export const TeenCareerPricing = lazy(() => import("@/pages/TeenCareerPricing"));
export const TeenHub = lazy(() => import("@/pages/TeenHub"));
export const TeenHomeworkPro = lazy(() => import("@/pages/TeenHomeworkPro"));
export const TeenEssayCoach = lazy(() => import("@/pages/TeenEssayCoach"));
export const TeenMentalWellness = lazy(() => import("@/pages/TeenMentalWellness"));
export const TeenStudyPlanner = lazy(() => import("@/pages/TeenStudyPlanner"));
export const TeenSkillBuilder = lazy(() => import("@/pages/TeenSkillBuilder"));
export const TeenSocialCoach = lazy(() => import("@/pages/TeenSocialCoach"));
export const KidsChannel = lazy(() => import("@/pages/KidsChannel"));
export const KidsShareView = lazy(() => import("@/pages/kids/KidsShareView"));
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
export const GenerateCourses = lazy(() => import("@/pages/GenerateCourses"));
export const MyLearning = lazy(() => import("@/pages/MyLearning"));
export const GenericLearning = lazy(() => import("@/pages/GenericLearning"));

// Subject-specific learning

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
export const CharacterInventoryPage = lazy(() => import("@/pages/CharacterInventory"));
export const CardCollections = lazy(() => import("@/pages/CardCollections"));
export const CardCollectionCategory = lazy(() => import("@/pages/CardCollectionCategory"));
export const CardCollectionsGallery = lazy(() => import("@/pages/CardCollectionsGallery"));

export const FashionStudio = lazy(() => import("@/pages/FashionStudio"));
export const VideoAdGenerator = lazy(() => import("@/pages/VideoAdGenerator"));
export const AIVideoCreator = lazy(() => import("@/pages/AIVideoCreator"));
export const CreativeForge = lazy(() => import("@/pages/CreativeForge"));
export const Handwriting = lazy(() => import("@/pages/Handwriting"));

// Ancestors & History
export const FutureFace = lazy(() => import("@/pages/FutureFace"));
export const FairytaleBook = lazy(() => import("@/pages/FairytaleBook"));
export const GuessAge = lazy(() => import("@/pages/GuessAge"));
export const FaceInsight = lazy(() => import("@/pages/FaceInsight"));

export const PastLife = lazy(() => import("@/pages/PastLife"));
export const AntiqueAppraisal = lazy(() => import("@/pages/AntiqueAppraisal"));

// Streaming & Live
export const LiveStream = lazy(() => import("@/pages/LiveStream"));
export const LiveStreamList = lazy(() => import("@/pages/LiveStreamList"));
export const Stories = lazy(() => import("@/pages/Stories"));
export const LiveConcerts = lazy(() => import("@/pages/LiveConcerts"));

export const ConcertWatch = lazy(() => import("@/pages/ConcertWatch"));

// Sports & Betting
export const SportsPredictor = lazy(() => import("@/pages/SportsPredictor"));
export const SportsAdmin = lazy(() => import("@/pages/SportsAdmin"));
export const AdminSportsMatches = lazy(() => import("@/pages/AdminSportsMatches"));
export const MyPurchasedTips = lazy(() => import("@/pages/MyPurchasedTips"));
export const TipsterDashboard = lazy(() => import("@/pages/TipsterDashboard"));
export const LotteryAI = lazy(() => import("@/pages/LotteryAI"));
export const LotteryHistory = lazy(() => import("@/pages/LotteryHistory"));

// Influencer & Creator
export const InfluKing = lazy(() => import("@/pages/InfluKing"));
export const BrandBattle = lazy(() => import("@/pages/BrandBattle"));
export const SponsorRegistration = lazy(() => import("@/pages/SponsorRegistration"));
export const SponsorDashboard = lazy(() => import("@/pages/SponsorDashboard"));
export const CreatorDashboard = lazy(() => import("@/pages/CreatorDashboard"));
export const CreatorProfile = lazy(() => import("@/pages/CreatorProfile"));
export const DiscoverCreators = lazy(() => import("@/pages/DiscoverCreators"));
export const BecomeCreator = lazy(() => import("@/pages/BecomeCreator"));
export const CreatorsLanding = lazy(() => import("@/pages/CreatorsLanding"));
export const BrandDashboard = lazy(() => import("@/pages/BrandDashboard"));
export const InfluencerEarnings = lazy(() => import("@/pages/InfluencerEarnings"));
export const CreatorStudio = lazy(() => import("@/pages/CreatorStudio"));

// Membership & Subscriptions
export const Verified = lazy(() => import("@/pages/Verified"));

export const CommunityDetail = lazy(() => import("@/pages/CommunityDetail"));

export const PremiumStore = lazy(() => import("@/pages/PremiumStore"));
export const Premium = lazy(() => import("@/pages/Premium"));
export const AICreditsStore = lazy(() => import("@/pages/AICreditsStore"));
export const MysteryBox = lazy(() => import("@/pages/MysteryBox"));

// Jobs & Employment
export const Jobs = lazy(() => import("@/pages/Jobs"));
export const JobDetailPage = lazy(() => import("@/pages/jobs/JobDetailPage"));
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
export const ShadowArenaStoryDetail = lazy(() => import("@/pages/ShadowArenaStoryDetail"));

// MasterChef

// Time & Capsule
export const TimeReversalSubscription = lazy(() => import("@/pages/TimeReversalSubscription"));
export const TimeReversalSocial = lazy(() => import("@/pages/TimeReversalSocial"));
export const TimeReversalDashboard = lazy(() => import("@/pages/TimeReversalDashboard"));
export const TimeReversalTimeline = lazy(() => import("@/pages/TimeReversalTimeline"));
export const TimeCapsuleSubscription = lazy(() => import("@/pages/TimeCapsuleSubscription"));
export const TimeCapsule = lazy(() => import("@/pages/TimeCapsule"));

// Experimental & Future

export const EmotionEconomy = lazy(() => import("@/pages/EmotionEconomy"));
export const HolographicAvatars = lazy(() => import("@/pages/HolographicAvatars"));
export const AboutPlatform = lazy(() => import("@/pages/AboutPlatform"));
export const HolographicHistory = lazy(() => import("@/pages/HolographicHistory"));
export const DigitalOffspring = lazy(() => import("@/pages/DigitalOffspring"));
export const CrystalEnergyNetwork = lazy(() => import("@/pages/CrystalEnergyNetwork"));
export const CrystalMarketplace = lazy(() => import("@/pages/CrystalMarketplace"));
export const PhobiaTrading = lazy(() => import("@/pages/PhobiaTrading"));


// Home Decor

// Admin
export const Admin = lazy(() => import("@/pages/Admin"));
export const AdminTransactions = lazy(() => import("@/pages/AdminTransactions"));
export const AdminCorporateInquiries = lazy(() => import("@/pages/AdminCorporateInquiries"));
export const AdminTipsters = lazy(() => import("@/pages/AdminTipsters"));
export const AdminMasterChefPayouts = lazy(() => import("@/pages/AdminMasterChefPayouts"));
export const AdminComedyPayouts = lazy(() => import("@/pages/AdminComedyPayouts"));
export const AdminInfluencerPayouts = lazy(() => import("@/pages/AdminInfluencerPayouts"));
export const AdminBrandCampaigns = lazy(() => import("@/pages/AdminBrandCampaigns"));
export const AdminBrandModeration = lazy(() => import("@/pages/AdminBrandModeration"));
export const AdminPlatformEarnings = lazy(() => import("@/pages/AdminPlatformEarnings"));
export const AdminPlatformWithdrawals = lazy(() => import("@/pages/AdminPlatformWithdrawals"));
export const AdminIQDashboard = lazy(() => import("@/pages/AdminIQDashboard"));
export const AdminIQAnalytics = lazy(() => import("@/pages/AdminIQAnalytics"));
export const AdminVerifications = lazy(() => import("@/pages/AdminVerifications"));
export const AdminBazaarTrust = lazy(() => import("@/pages/AdminBazaarTrust"));
export const AdminWithdrawals = lazy(() => import("@/pages/AdminWithdrawals"));
export const AdminPaymentDashboard = lazy(() => import("@/pages/AdminPaymentDashboard"));
export const AdminPwaStats = lazy(() => import("@/pages/admin/AdminPwaStats"));


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
export const HealthcareContentLibrary = lazy(() => import("@/pages/HealthcareContentLibrary"));
export const Numerology = lazy(() => import("@/pages/Numerology"));
export const ParallelUniverse = lazy(() => import("@/pages/ParallelUniverse"));
export const MemoryAuctions = lazy(() => import("@/pages/MemoryAuctions"));
export const BrandKits = lazy(() => import("@/pages/BrandKits"));

// Components that need lazy loading
export const QuizCreator = lazy(() => import("@/components/education/QuizCreator"));
export const QuizTaker = lazy(() => import("@/components/education/QuizTaker"));
