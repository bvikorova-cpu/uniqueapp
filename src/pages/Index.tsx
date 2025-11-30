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
  Ghost
} from "lucide-react";

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const services = [
    {
      title: "🏎️ F1 Fantasy Racing",
      description: "Premium 3D F1 racing platform with fantasy teams & live competitions",
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
      title: "⚽ Sports Match Predictions",
      description: "Expert tipsters + AI predictions for sports betting with win rate stats",
      icon: TrendingUp,
      path: "/sports-predictor",
      badge: "Sports",
      badgeColor: "bg-green-600",
      gradient: "from-green-600 to-emerald-600"
    },
    {
      title: "🎭 Shadow Arena",
      description: "Horror storytelling platform with creator battles & AI-enhanced stories",
      icon: Ghost,
      path: "/shadow-arena",
      badge: "Horror",
      badgeColor: "bg-purple-600",
      gradient: "from-purple-600 to-fuchsia-600"
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

        {/* Services Grid */}
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
