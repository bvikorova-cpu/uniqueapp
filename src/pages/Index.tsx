import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { 
  Car, Baby, GraduationCap, Briefcase, Heart, Sparkles, Trophy, Users,
  Video, Mic, ShoppingBag, Brain, TrendingUp, Ghost, Building2, Crown,
  Clock, Timer, ChefHat, MessageCircle, Star, MessageSquare, Palette,
  Camera, Gem, RotateCcw, Shirt, ArrowRight, Rocket, Zap
} from "lucide-react";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const ecosystemModules = [
    { title: "Holographic Avatars", emoji: "👑", description: "AI-powered 3D avatars with breeding & battles", icon: Crown, path: "/holographic-avatars", badge: "3D AI", gradient: "from-purple-600 to-pink-600", featured: true },
    { title: "Time Capsule 2.0", emoji: "⏰", description: "Send messages to the future (1-20 years)", icon: Clock, path: "/time-capsule-subscription", badge: "Future", gradient: "from-blue-600 to-cyan-600" },
    { title: "Time Reversal Social", emoji: "⏮️", description: "Live your life backwards with AI transformation", icon: Timer, path: "/time-reversal-subscription", badge: "Social", gradient: "from-violet-600 to-purple-600" },
    { title: "MasterChef Platform", emoji: "👨‍🍳", description: "Online cooking competitions with prizes", icon: ChefHat, path: "/masterchef-subscription", badge: "Competition", gradient: "from-orange-600 to-red-600" },
    { title: "GP Fantasy Racing", emoji: "🏎️", description: "3D racing with team management & leaderboards", icon: Car, path: "/f1-racing", badge: "3D Racing", gradient: "from-red-600 to-orange-600", featured: true },
    { title: "Messenger", emoji: "💬", description: "Real-time chat with reactions & voice messages", icon: MessageCircle, path: "/messenger", badge: "Chat", gradient: "from-cyan-600 to-blue-600" },
    { title: "Influ-King", emoji: "⭐", description: "Creator profiles with 12 categories & virtual gifts", icon: Star, path: "/influ-king", badge: "Creators", gradient: "from-yellow-600 to-amber-600" },
    { title: "Megaforum", emoji: "💬", description: "Open community forum with 9 categories (FREE)", icon: MessageSquare, path: "/megaforum", badge: "Free", gradient: "from-emerald-600 to-green-600" },
    { title: "Online Psychologist", emoji: "🧠", description: "Anonymous AI chat with empathetic responses", icon: Brain, path: "/psychologist", badge: "Anonymous", gradient: "from-pink-600 to-rose-600" },
    { title: "Content Studio", emoji: "🎨", description: "AI hub for social media, CVs & scripts", icon: Palette, path: "/content-studio", badge: "AI Studio", gradient: "from-indigo-600 to-purple-600" },
  ];

  const coreModules = [
    { title: "Character Companions", emoji: "💬", description: "Chat with 5 AI personas", icon: MessageCircle, path: "/companions", badge: "5 Free Msgs", gradient: "from-pink-600 to-rose-600" },
    { title: "Exclusive Experiences", emoji: "🌍", description: "33 global destinations & fantasy worlds", icon: Sparkles, path: "/ai-experiences", badge: "15 Credits", gradient: "from-purple-600 to-violet-600" },
    { title: "Brand Builder", emoji: "🎨", description: "Generate complete brand kits with AI", icon: Palette, path: "/brand-builder", badge: "15 Credits", gradient: "from-indigo-600 to-blue-600" },
    { title: "Home Designer", emoji: "🏠", description: "AI room redesign + furniture marketplace", icon: Building2, path: "/home-designer", badge: "Marketplace", gradient: "from-sky-600 to-cyan-600" },
    { title: "Beauty Studio", emoji: "💄", description: "Virtual makeup & hair styling with AI", icon: Star, path: "/beauty-studio", badge: "2-5 Credits", gradient: "from-rose-600 to-pink-600" },
    { title: "Photo Restoration", emoji: "📸", description: "AI colorization & enhance old photos", icon: Camera, path: "/photo-restoration", badge: "1 Credit", gradient: "from-amber-600 to-yellow-600" },
    { title: "Antique Appraisal", emoji: "🏺", description: "AI identification & valuation", icon: Gem, path: "/antique-appraisal", badge: "3-20 Credits", gradient: "from-orange-600 to-amber-600" },
    { title: "Collectibles", emoji: "✨", description: "Mystery boxes & AI item generator", icon: Crown, path: "/collectibles", badge: "10 Credits", gradient: "from-violet-600 to-purple-600" },
    { title: "Dream Journal", emoji: "🌙", description: "AI dream analysis & mood tracking", icon: Brain, path: "/dream-journal", badge: "Wellness", gradient: "from-blue-600 to-indigo-600" },
    { title: "Fashion Studio", emoji: "👗", description: "AI fashion generator & design challenges", icon: Shirt, path: "/fashion-studio", badge: "Creative", gradient: "from-fuchsia-600 to-pink-600" },
  ];

  const services = [
    { title: "GP Fantasy Racing", emoji: "🏎️", icon: Car, path: "/f1-subscription", badge: "Premium", gradient: "from-red-600 to-orange-600", featured: true },
    { title: "Kids Channel", emoji: "👶", icon: Baby, path: "/kids-channel", badge: "Family", gradient: "from-blue-500 to-cyan-500" },
    { title: "Education & AI Tutor", emoji: "🎓", icon: GraduationCap, path: "/education", badge: "Learning", gradient: "from-green-500 to-emerald-500" },
    { title: "Jobs & Career", emoji: "💼", icon: Briefcase, path: "/jobs", badge: "Career", gradient: "from-purple-500 to-indigo-500" },
    { title: "Dating", emoji: "💝", icon: Heart, path: "/dating", badge: "Social", gradient: "from-pink-500 to-rose-500" },
    { title: "AI Generation", emoji: "✨", icon: Sparkles, path: "/ai-generation", badge: "Creative", gradient: "from-yellow-500 to-amber-500" },
    { title: "Games", emoji: "🎮", icon: Trophy, path: "/games", badge: "Entertainment", gradient: "from-orange-500 to-red-500" },
    { title: "Social Wall", emoji: "👥", icon: Users, path: "/wall", badge: "Social", gradient: "from-teal-500 to-cyan-500" },
    { title: "Live Streaming", emoji: "🎥", icon: Video, path: "/livestream", badge: "Entertainment", gradient: "from-indigo-500 to-purple-500" },
    { title: "Comedy Club", emoji: "🎤", icon: Mic, path: "/comedy-club", badge: "Entertainment", gradient: "from-fuchsia-500 to-pink-500" },
    { title: "Marketplace", emoji: "🛍️", icon: ShoppingBag, path: "/marketplace", badge: "Shopping", gradient: "from-violet-500 to-purple-500" },
    { title: "AI Services", emoji: "🧠", icon: Brain, path: "/psychology-chat", badge: "Wellness", gradient: "from-emerald-500 to-teal-500" },
    { title: "IQ Platform", emoji: "🧩", icon: Brain, path: "/iq-platform", badge: "Intelligence", gradient: "from-blue-600 to-indigo-600" },
    { title: "Shadow Arena", emoji: "🎭", icon: Ghost, path: "/shadow-arena", badge: "Horror", gradient: "from-purple-600 to-fuchsia-600" },
    { title: "Lottery AI", emoji: "🎰", icon: TrendingUp, path: "/lottery-ai", badge: "AI Predictions", gradient: "from-amber-600 to-yellow-500" },
    { title: "Property Marketplace", emoji: "🏠", icon: Building2, path: "/property-marketplace", badge: "Real Estate", gradient: "from-sky-600 to-blue-500" },
    { title: "Membership Community", emoji: "👥", icon: Users, path: "/membership-community", badge: "Community", gradient: "from-rose-600 to-pink-500" },
    { title: "Crystal Energy", emoji: "💎", icon: Sparkles, path: "/crystal-energy", badge: "Wellness", gradient: "from-violet-600 to-purple-500" },
    { title: "DNA Memory Network", emoji: "🧬", icon: Brain, path: "/dna-memory", badge: "Heritage", gradient: "from-cyan-600 to-teal-500" },
    { title: "Reincarnation Social", emoji: "🔮", icon: Heart, path: "/reincarnation-social", badge: "Spiritual", gradient: "from-fuchsia-600 to-pink-500" },
    { title: "Blockchain Confessions", emoji: "⛓️", icon: Ghost, path: "/blockchain-confessions", badge: "Anonymous", gradient: "from-slate-600 to-gray-500" },
    { title: "Phobia Trading", emoji: "🕷️", icon: Ghost, path: "/phobia-trading", badge: "Therapy", gradient: "from-orange-600 to-amber-500" },
    { title: "Multiverse Network", emoji: "🌌", icon: Sparkles, path: "/multiverse-network", badge: "Exploration", gradient: "from-indigo-600 to-violet-500" },
    { title: "Live Concerts", emoji: "🎵", icon: Video, path: "/live-concerts", badge: "Entertainment", gradient: "from-red-600 to-rose-500" },
  ];

  const ModuleCard = ({ mod, size = "sm" }: { mod: any; size?: "sm" | "lg" }) => {
    const Icon = mod.icon;
    const isLg = size === "lg";
    return (
      <motion.div variants={item}>
        <Card
          className={`group cursor-pointer overflow-hidden relative border-transparent hover:border-primary/40 transition-all duration-300 hover:scale-[1.03] ${mod.featured ? 'ring-1 ring-primary/30' : ''}`}
          onClick={() => navigate(mod.path)}
        >
          {/* Gradient top bar */}
          <div className={`h-1 bg-gradient-to-r ${mod.gradient}`} />
          <CardHeader className={isLg ? "p-4 sm:p-5" : "p-3 sm:p-4"}>
            <div className="flex items-start gap-3">
              <div className={`${isLg ? 'w-11 h-11 sm:w-14 sm:h-14' : 'w-9 h-9 sm:w-11 sm:h-11'} rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                <Icon className={`${isLg ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-4 h-4 sm:w-5 sm:h-5'} text-white`} />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className={`${isLg ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} group-hover:text-primary transition-colors line-clamp-1`}>
                  {mod.emoji} {mod.title}
                </CardTitle>
                <Badge variant="secondary" className="text-[9px] sm:text-[10px] mt-1 font-medium">
                  {mod.badge}
                </Badge>
              </div>
            </div>
          </CardHeader>
          {mod.description && (
            <CardContent className={`${isLg ? 'px-4 sm:px-5' : 'px-3 sm:px-4'} pb-3 sm:pb-4 pt-0`}>
              <p className="text-muted-foreground text-[10px] sm:text-xs line-clamp-2">{mod.description}</p>
            </CardContent>
          )}
        </Card>
      </motion.div>
    );
  };

  const SectionHeader = ({ icon: Icon, title, badge, badgeClass }: any) => (
    <motion.div variants={item} className="flex items-center gap-3 mb-4 sm:mb-6 px-1">
      <div className="p-2 rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>
      <h2 className="text-lg sm:text-2xl font-bold">{title}</h2>
      {badge && <Badge className={badgeClass || "bg-primary/10 text-primary border-primary/20"}>{badge}</Badge>}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-accent/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
        
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 pt-24 sm:pt-32 pb-8 sm:pb-16">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4 sm:mb-6">
              <Rocket className="w-4 h-4" />
              <span className="font-medium">All-in-One Platform</span>
            </div>
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 sm:mb-5 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight">
              {t('index.welcome')}
            </h1>
            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
              {t('index.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button size="lg" variant="premium" onClick={() => navigate('/wall')}>
                <Zap className="w-4 h-4" /> Explore Now
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/games')}>
                <Trophy className="w-4 h-4" /> Play Games
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-14">
        {/* Ecosystem */}
        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <SectionHeader icon={Crown} title="Ecosystem Modules" badge="Premium" badgeClass="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {ecosystemModules.map((mod, i) => <ModuleCard key={i} mod={mod} />)}
          </div>
        </motion.section>

        {/* Core */}
        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <SectionHeader icon={Sparkles} title="Core Modules" badge="AI-Powered" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {coreModules.map((mod, i) => <ModuleCard key={i} mod={mod} />)}
          </div>
        </motion.section>

        {/* All Services */}
        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}>
          <SectionHeader icon={Zap} title="All Services" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {services.map((mod, i) => <ModuleCard key={i} mod={mod} size="lg" />)}
          </div>
        </motion.section>

        {/* Footer CTA */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center pb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5 max-w-2xl mx-auto">
            <CardContent className="py-8 sm:py-10">
              <h3 className="text-xl sm:text-2xl font-black mb-2">Ready to get started?</h3>
              <p className="text-muted-foreground mb-4">Choose a service above and begin your journey!</p>
              <Button variant="premium" size="lg" onClick={() => navigate('/wall')}>
                <ArrowRight className="w-4 h-4" /> Get Started
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
