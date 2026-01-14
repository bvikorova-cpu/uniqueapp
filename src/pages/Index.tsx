import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Baby, 
  GraduationCap, 
  Briefcase, 
  Heart,
  Sparkles,
  Trophy,
  Users,
  Video,
  Mic,
  ShoppingBag,
  Brain,
  TrendingUp,
  Ghost,
  Building2,
  Crown,
  Clock,
  Timer,
  ChefHat,
  MessageCircle,
  Star,
  MessageSquare,
  Palette
} from "lucide-react";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Premium Ecosystem Modules (Featured Section)
  const ecosystemModules = [
    {
      title: "👑 Holographic Avatars",
      description: "AI-powered 3D avatars with breeding, battles, and autonomous personalities",
      icon: Crown,
      path: "/holographic-avatars",
      badge: "3D AI",
      badgeColor: "bg-purple-600",
      gradient: "from-purple-600 to-pink-600",
      featured: true
    },
    {
      title: "⏰ Time Capsule 2.0",
      description: "Send messages to the future with encrypted storage (1-20 years)",
      icon: Clock,
      path: "/time-capsule-subscription",
      badge: "Future",
      badgeColor: "bg-blue-600",
      gradient: "from-blue-600 to-cyan-600"
    },
    {
      title: "⏮️ Time Reversal Social",
      description: "Live your life backwards with AI age transformation",
      icon: Timer,
      path: "/time-reversal-subscription",
      badge: "Social",
      badgeColor: "bg-violet-600",
      gradient: "from-violet-600 to-purple-600"
    },
    {
      title: "👨‍🍳 MasterChef Platform",
      description: "Online cooking competitions with voting and prizes",
      icon: ChefHat,
      path: "/masterchef-subscription",
      badge: "Competition",
      badgeColor: "bg-orange-600",
      gradient: "from-orange-600 to-red-600"
    },
    {
      title: "🏎️ GP Fantasy Racing",
      description: "3D racing with Three.js, team management, and leaderboards",
      icon: Car,
      path: "/f1-racing",
      badge: "3D Racing",
      badgeColor: "bg-red-600",
      gradient: "from-red-600 to-orange-600",
      featured: true
    },
    {
      title: "💬 Messenger",
      description: "Real-time chat with reactions, voice messages, and self-destructing messages",
      icon: MessageCircle,
      path: "/messenger",
      badge: "Chat",
      badgeColor: "bg-cyan-600",
      gradient: "from-cyan-600 to-blue-600"
    },
    {
      title: "⭐ Influ-King",
      description: "Creator profiles with 12 categories, stats, and virtual gift monetization",
      icon: Star,
      path: "/influ-king",
      badge: "Creators",
      badgeColor: "bg-yellow-600",
      gradient: "from-yellow-600 to-amber-600"
    },
    {
      title: "💬 Megaforum",
      description: "Open community forum with 9 categories (100% FREE)",
      icon: MessageSquare,
      path: "/megaforum",
      badge: "Free",
      badgeColor: "bg-emerald-600",
      gradient: "from-emerald-600 to-green-600"
    },
    {
      title: "🧠 Online Psychologist",
      description: "Anonymous AI chat with empathetic streaming responses",
      icon: Brain,
      path: "/psychologist",
      badge: "Anonymous",
      badgeColor: "bg-pink-600",
      gradient: "from-pink-600 to-rose-600"
    },
    {
      title: "🎨 Content Studio",
      description: "AI generation hub for social media, CVs, articles, and scripts",
      icon: Palette,
      path: "/content-studio",
      badge: "AI Studio",
      badgeColor: "bg-indigo-600",
      gradient: "from-indigo-600 to-purple-600"
    },
  ];

  const services = [
    {
      title: "🏎️ GP Fantasy Racing",
      description: "Premium 3D racing platform with fantasy teams & live competitions",
      icon: Car,
      path: "/f1-subscription",
      badge: "Premium",
      badgeColor: "bg-red-600",
      gradient: "from-red-600 to-orange-600",
      featured: true
    },
    {
      title: "👶 Kids Channel",
      description: "Interactive educational games, stories, and fun activities for children",
      icon: Baby,
      path: "/kids-channel",
      badge: "Family",
      badgeColor: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      title: "🎓 Education & AI Tutor",
      description: "AI-powered learning, tutoring, and educational resources",
      icon: GraduationCap,
      path: "/education",
      badge: "Learning",
      badgeColor: "bg-green-500",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      title: "💼 Jobs & Career",
      description: "Find jobs, create CV, prepare for interviews with AI assistance",
      icon: Briefcase,
      path: "/jobs",
      badge: "Career",
      badgeColor: "bg-purple-500",
      gradient: "from-purple-500 to-indigo-500"
    },
    {
      title: "💝 Dating",
      description: "Meet new people, create connections, and find love",
      icon: Heart,
      path: "/dating",
      badge: "Social",
      badgeColor: "bg-pink-500",
      gradient: "from-pink-500 to-rose-500"
    },
    {
      title: "✨ AI Generation",
      description: "Generate art, music, avatars, and creative content with AI",
      icon: Sparkles,
      path: "/ai-generation",
      badge: "Creative",
      badgeColor: "bg-yellow-500",
      gradient: "from-yellow-500 to-amber-500"
    },
    {
      title: "🎮 Games",
      description: "Play fun games, compete in tournaments, and win prizes",
      icon: Trophy,
      path: "/games",
      badge: "Entertainment",
      badgeColor: "bg-orange-500",
      gradient: "from-orange-500 to-red-500"
    },
    {
      title: "👥 Social Wall",
      description: "Connect with friends, share stories, and build your community",
      icon: Users,
      path: "/wall",
      badge: "Social",
      badgeColor: "bg-teal-500",
      gradient: "from-teal-500 to-cyan-500"
    },
    {
      title: "🎥 Live Streaming",
      description: "Stream live content, watch shows, and interact with creators",
      icon: Video,
      path: "/livestream",
      badge: "Entertainment",
      badgeColor: "bg-indigo-500",
      gradient: "from-indigo-500 to-purple-500"
    },
    {
      title: "🎤 Comedy Club",
      description: "Watch comedy shows, become a comedian, and make people laugh",
      icon: Mic,
      path: "/comedy-club",
      badge: "Entertainment",
      badgeColor: "bg-fuchsia-500",
      gradient: "from-fuchsia-500 to-pink-500"
    },
    {
      title: "🛍️ Marketplace",
      description: "Buy and sell products, discover unique items, and support creators",
      icon: ShoppingBag,
      path: "/marketplace",
      badge: "Shopping",
      badgeColor: "bg-violet-500",
      gradient: "from-violet-500 to-purple-500"
    },
    {
      title: "🧠 AI Services",
      description: "Psychology chat, astrology readings, best friend AI, and more",
      icon: Brain,
      path: "/psychology-chat",
      badge: "Wellness",
      badgeColor: "bg-emerald-500",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      title: "🧩 IQ Platform",
      description: "IQ tests, AI analysis, online competitions & earn credits",
      icon: Brain,
      path: "/iq-platform",
      badge: "Intelligence",
      badgeColor: "bg-blue-600",
      gradient: "from-blue-600 to-indigo-600"
    },
    {
      title: "🎭 Shadow Arena",
      description: "Horror storytelling platform with creator battles & AI-enhanced stories",
      icon: Ghost,
      path: "/shadow-arena",
      badge: "Horror",
      badgeColor: "bg-purple-600",
      gradient: "from-purple-600 to-fuchsia-600"
    },
    {
      title: "🎰 Lottery AI",
      description: "AI-powered lottery number predictions with advanced pattern analysis",
      icon: TrendingUp,
      path: "/lottery-ai",
      badge: "AI Predictions",
      badgeColor: "bg-amber-600",
      gradient: "from-amber-600 to-yellow-500"
    },
    {
      title: "🏠 Property Marketplace",
      description: "Professional real estate platform with premium listing packages",
      icon: Building2,
      path: "/property-marketplace",
      badge: "Real Estate",
      badgeColor: "bg-sky-600",
      gradient: "from-sky-600 to-blue-500"
    },
    {
      title: "👥 Membership Community",
      description: "Exclusive social network with tiered membership benefits",
      icon: Users,
      path: "/membership-community",
      badge: "Community",
      badgeColor: "bg-rose-600",
      gradient: "from-rose-600 to-pink-500"
    },
    {
      title: "💎 Crystal Energy Network",
      description: "Healing crystal marketplace with energy readings and subscriptions",
      icon: Sparkles,
      path: "/crystal-energy",
      badge: "Wellness",
      badgeColor: "bg-violet-600",
      gradient: "from-violet-600 to-purple-500"
    },
    {
      title: "🧬 DNA Memory Network",
      description: "Unlock ancestral memories through DNA analysis and AI restoration",
      icon: Brain,
      path: "/dna-memory",
      badge: "Heritage",
      badgeColor: "bg-cyan-600",
      gradient: "from-cyan-600 to-teal-500"
    },
    {
      title: "🔮 Reincarnation Social",
      description: "Discover past lives and connect with your soul family",
      icon: Heart,
      path: "/reincarnation-social",
      badge: "Spiritual",
      badgeColor: "bg-fuchsia-600",
      gradient: "from-fuchsia-600 to-pink-500"
    },
    {
      title: "⛓️ Blockchain Confessions",
      description: "Anonymous confession platform with crypto rewards and voting",
      icon: Ghost,
      path: "/blockchain-confessions",
      badge: "Anonymous",
      badgeColor: "bg-slate-600",
      gradient: "from-slate-600 to-gray-500"
    },
    {
      title: "🕷️ Phobia Trading",
      description: "Trade and overcome fears in a gamified therapeutic platform",
      icon: Ghost,
      path: "/phobia-trading",
      badge: "Therapy",
      badgeColor: "bg-orange-600",
      gradient: "from-orange-600 to-amber-500"
    },
    {
      title: "🌌 Multiverse Network",
      description: "Explore parallel universe versions of yourself with AI analysis",
      icon: Sparkles,
      path: "/multiverse-network",
      badge: "Exploration",
      badgeColor: "bg-indigo-600",
      gradient: "from-indigo-600 to-violet-500"
    },
    {
      title: "🎵 Live Concerts",
      description: "HD concert streaming with virtual gifts and VIP experiences",
      icon: Video,
      path: "/live-concerts",
      badge: "Entertainment",
      badgeColor: "bg-red-600",
      gradient: "from-red-600 to-rose-500"
    }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="max-w-7xl mx-auto p-2 sm:p-4 py-6 sm:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-12 animate-fade-in px-2">
          <h1 className="text-3xl sm:text-6xl font-bold mb-2 sm:mb-4 bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-text text-transparent">
            {t('index.welcome')}
          </h1>
          <p className="text-lg sm:text-2xl text-muted-foreground mb-1 sm:mb-2">
            {t('index.subtitle')}
          </p>
          <p className="text-sm sm:text-lg text-muted-foreground/80">
            Explore our premium services and discover amazing features
          </p>
        </div>

        {/* Ecosystem Modules Section */}
        <div className="mb-8 sm:mb-12">
          <div className="flex items-center gap-3 mb-4 sm:mb-6 px-2">
            <Crown className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
            <h2 className="text-xl sm:text-3xl font-bold">Ecosystem Modules</h2>
            <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white">Premium</Badge>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-4">
            {ecosystemModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Card
                  key={index}
                  className={`group cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:scale-[1.02] hover:shadow-xl ${
                    module.featured ? "border-primary/50 shadow-lg" : ""
                  }`}
                  onClick={() => navigate(module.path)}
                >
                  <CardHeader className="p-3 sm:p-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br ${module.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <CardTitle className="text-xs sm:text-sm group-hover:text-primary transition-colors line-clamp-2">
                      {module.title}
                    </CardTitle>
                    <Badge className={`${module.badgeColor} text-white text-[8px] sm:text-[10px] w-fit mt-1`}>
                      {module.badge}
                    </Badge>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
                    <p className="text-muted-foreground text-[10px] sm:text-xs line-clamp-2">
                      {module.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Services Grid */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-4 sm:mb-6 px-2">
            <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-primary" />
            <h2 className="text-xl sm:text-3xl font-bold">All Services</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2 sm:gap-6">
            {services.map((service, index) => {
              const Icon = service.icon;
              return (
                <Card
                  key={index}
                  className={`group cursor-pointer border-2 hover:border-primary transition-all duration-300 hover:scale-[1.02] sm:hover:scale-105 hover:shadow-xl sm:hover:shadow-2xl ${
                    service.featured ? "border-primary shadow-lg" : ""
                  }`}
                  onClick={() => navigate(service.path)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardHeader className="p-3 sm:p-6">
                    <div className={`w-10 h-10 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-2 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                      <CardTitle className="text-sm sm:text-xl group-hover:text-primary transition-colors line-clamp-2">
                        {service.title}
                      </CardTitle>
                      <Badge className={`${service.badgeColor} text-white text-[10px] sm:text-xs w-fit`}>
                        {service.badge}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 sm:p-6 sm:pt-0">
                    <p className="text-muted-foreground text-xs sm:text-base line-clamp-2">
                      {service.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div className="mt-6 sm:mt-12 text-center px-2">
          <Card className="border-2 border-primary bg-gradient-to-r from-primary/5 to-accent/5">
            <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
              <h3 className="text-lg sm:text-2xl font-bold mb-1 sm:mb-2">Ready to get started?</h3>
              <p className="text-muted-foreground text-sm sm:text-base mb-2 sm:mb-4">
                Choose a service above and begin your journey!
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
