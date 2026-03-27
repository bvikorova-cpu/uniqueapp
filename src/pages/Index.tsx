import { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useRecentServices } from "@/hooks/useRecentServices";
import {
  Car, Baby, GraduationCap, Briefcase, Heart, Sparkles, Trophy, Users,
  Video, Mic, ShoppingBag, Brain, TrendingUp, Ghost, Building2, Crown,
  Clock, Timer, ChefHat, MessageCircle, Star, MessageSquare, Palette,
  Camera, Gem, Shirt, ArrowRight, Rocket, Zap, Search, X,
  PenTool, Globe, ChevronRight,
  Pin, PinOff, BookOpen
} from "lucide-react";

// ── Data ──────────────────────────────────────────────

const ecosystemModules = [
  { title: "Holographic Avatars", description: "AI-powered 3D avatars with breeding & battles", icon: Crown, path: "/holographic-avatars", badge: "3D AI", gradient: "from-purple-600 to-pink-600", featured: true, category: "creative" },
  { title: "Time Capsule 2.0", description: "Send messages to the future (1-20 years)", icon: Clock, path: "/time-capsule-subscription", badge: "Future", gradient: "from-blue-600 to-cyan-600", category: "social" },
  { title: "Time Reversal Social", description: "Live your life backwards with AI transformation", icon: Timer, path: "/time-reversal-subscription", badge: "Social", gradient: "from-violet-600 to-purple-600", category: "social" },
  { title: "MasterChef Platform", description: "Online cooking competitions with prizes", icon: ChefHat, path: "/masterchef-subscription", badge: "Competition", gradient: "from-orange-600 to-red-600", category: "entertainment" },
  { title: "GP Fantasy Racing", description: "3D racing with team management & leaderboards", icon: Car, path: "/f1-racing", badge: "3D Racing", gradient: "from-red-600 to-orange-600", featured: true, category: "racing" },
  { title: "Messenger", description: "Real-time chat with reactions & voice messages", icon: MessageCircle, path: "/messenger", badge: "Chat", gradient: "from-cyan-600 to-blue-600", category: "social" },
  { title: "Influ-King", description: "Creator profiles with 12 categories & virtual gifts", icon: Star, path: "/influ-king", badge: "Creators", gradient: "from-yellow-600 to-amber-600", category: "social" },
  { title: "Megaforum", description: "Open community forum with 9 categories (FREE)", icon: MessageSquare, path: "/megaforum", badge: "Free", gradient: "from-emerald-600 to-green-600", category: "social" },
  { title: "Online Psychologist", description: "Anonymous AI chat with empathetic responses", icon: Brain, path: "/psychologist", badge: "Anonymous", gradient: "from-pink-600 to-rose-600", category: "wellness" },
  { title: "Content Studio", description: "AI hub for social media, CVs & scripts", icon: Palette, path: "/content-studio", badge: "AI Studio", gradient: "from-indigo-600 to-purple-600", category: "creative" },
];

const coreModules = [
  { title: "Character Companions", description: "Chat with 5 AI personas", icon: MessageCircle, path: "/companions", badge: "5 Free Msgs", gradient: "from-pink-600 to-rose-600", category: "creative" },
  { title: "Exclusive Experiences", description: "33 global destinations & fantasy worlds", icon: Sparkles, path: "/ai-experiences", badge: "15 Credits", gradient: "from-purple-600 to-violet-600", category: "entertainment" },
  { title: "Brand Builder", description: "Generate complete brand kits with AI", icon: Palette, path: "/brand-builder", badge: "15 Credits", gradient: "from-indigo-600 to-blue-600", category: "creative" },
  { title: "Home Designer", description: "AI room redesign + furniture marketplace", icon: Building2, path: "/home-designer", badge: "Marketplace", gradient: "from-sky-600 to-cyan-600", category: "creative" },
  { title: "Beauty Studio", description: "Virtual makeup & hair styling with AI", icon: Star, path: "/beauty-studio", badge: "2-5 Credits", gradient: "from-rose-600 to-pink-600", category: "creative" },
  { title: "Photo Restoration", description: "AI colorization & enhance old photos", icon: Camera, path: "/photo-restoration", badge: "1 Credit", gradient: "from-amber-600 to-yellow-600", category: "creative" },
  { title: "Antique Appraisal", description: "AI identification & valuation", icon: Gem, path: "/antique-appraisal", badge: "3-20 Credits", gradient: "from-orange-600 to-amber-600", category: "creative" },
  { title: "Collectibles", description: "Mystery boxes & AI item generator", icon: Crown, path: "/collectibles", badge: "10 Credits", gradient: "from-violet-600 to-purple-600", category: "entertainment" },
  { title: "Dream Journal", description: "AI dream analysis & mood tracking", icon: Brain, path: "/dream-journal", badge: "Wellness", gradient: "from-blue-600 to-indigo-600", category: "wellness" },
  { title: "Fashion Studio", description: "AI fashion generator & design challenges", icon: Shirt, path: "/fashion-studio", badge: "Creative", gradient: "from-fuchsia-600 to-pink-600", category: "creative" },
];

const services = [
  { title: "GP Fantasy Racing", icon: Car, path: "/f1-subscription", badge: "Premium", gradient: "from-red-600 to-orange-600", featured: true, category: "racing" },
  { title: "Kids Channel", icon: Baby, path: "/kids-channel", badge: "Family", gradient: "from-blue-500 to-cyan-500", category: "entertainment" },
  { title: "Education & AI Tutor", icon: GraduationCap, path: "/education", badge: "Learning", gradient: "from-green-500 to-emerald-500", category: "learning" },
  { title: "Jobs & Career", icon: Briefcase, path: "/jobs", badge: "Career", gradient: "from-purple-500 to-indigo-500", category: "career" },
  { title: "Dating", icon: Heart, path: "/dating", badge: "Social", gradient: "from-pink-500 to-rose-500", category: "social" },
  { title: "AI Generation", icon: Sparkles, path: "/ai-generation", badge: "Creative", gradient: "from-yellow-500 to-amber-500", category: "creative" },
  { title: "Social Wall", icon: Users, path: "/wall", badge: "Social", gradient: "from-teal-500 to-cyan-500", category: "social" },
  { title: "Live Streaming", icon: Video, path: "/livestream", badge: "Entertainment", gradient: "from-indigo-500 to-purple-500", category: "entertainment" },
  { title: "Comedy Club", icon: Mic, path: "/comedy-club", badge: "Entertainment", gradient: "from-fuchsia-500 to-pink-500", category: "entertainment" },
  { title: "Marketplace", icon: ShoppingBag, path: "/marketplace", badge: "Shopping", gradient: "from-violet-500 to-purple-500", category: "shopping" },
  { title: "AI Services", icon: Brain, path: "/psychology-chat", badge: "Wellness", gradient: "from-emerald-500 to-teal-500", category: "wellness" },
  { title: "IQ Platform", icon: Brain, path: "/iq-platform", badge: "Intelligence", gradient: "from-blue-600 to-indigo-600", category: "learning" },
  { title: "Shadow Arena", icon: Ghost, path: "/shadow-arena", badge: "Horror", gradient: "from-purple-600 to-fuchsia-600", category: "entertainment" },
  { title: "Lottery AI", icon: TrendingUp, path: "/lottery-ai", badge: "AI Predictions", gradient: "from-amber-600 to-yellow-500", category: "entertainment" },
  { title: "Property Marketplace", icon: Building2, path: "/property-marketplace", badge: "Real Estate", gradient: "from-sky-600 to-blue-500", category: "shopping" },
  { title: "Membership Community", icon: Users, path: "/membership-community", badge: "Community", gradient: "from-rose-600 to-pink-500", category: "social" },
  { title: "Crystal Energy", icon: Sparkles, path: "/crystal-energy", badge: "Wellness", gradient: "from-violet-600 to-purple-500", category: "wellness" },
  { title: "DNA Memory Network", icon: Brain, path: "/dna-memory", badge: "Heritage", gradient: "from-cyan-600 to-teal-500", category: "wellness" },
  { title: "Reincarnation Social", icon: Heart, path: "/reincarnation-social", badge: "Spiritual", gradient: "from-fuchsia-600 to-pink-500", category: "wellness" },
  { title: "Blockchain Confessions", icon: Ghost, path: "/blockchain-confessions", badge: "Anonymous", gradient: "from-slate-600 to-gray-500", category: "social" },
  { title: "Phobia Trading", icon: Ghost, path: "/phobia-trading", badge: "Therapy", gradient: "from-orange-600 to-amber-500", category: "wellness" },
  { title: "Multiverse Network", icon: Sparkles, path: "/multiverse-network", badge: "Exploration", gradient: "from-indigo-600 to-violet-500", category: "entertainment" },
  { title: "Live Concerts", icon: Video, path: "/live-concerts", badge: "Entertainment", gradient: "from-red-600 to-rose-500", category: "entertainment" },
];

const allModules = [...ecosystemModules, ...coreModules, ...services.map(s => ({ ...s, description: "" }))];
const uniqueModules = allModules.filter((m, i, arr) => arr.findIndex(x => x.path === m.path) === i);

const quickActions = [
  { label: "Chat Now", icon: MessageCircle, path: "/messenger", gradient: "from-cyan-500 to-blue-500" },
  { label: "Create Content", icon: PenTool, path: "/content-studio", gradient: "from-purple-500 to-indigo-500" },
  { label: "AI Services", icon: Brain, path: "/psychology-chat", gradient: "from-emerald-500 to-teal-500" },
  { label: "Explore World", icon: Globe, path: "/ai-experiences", gradient: "from-blue-500 to-violet-500" },
  { label: "Go Live", icon: Video, path: "/livestream", gradient: "from-red-500 to-pink-500" },
  { label: "Learn", icon: BookOpen, path: "/education", gradient: "from-green-500 to-emerald-500" },
];

const stats = [
  { label: "Services", value: 40, suffix: "+" },
  { label: "AI Features", value: 25, suffix: "+" },
  { label: "Categories", value: 15, suffix: "" },
  { label: "Experiences", value: 33, suffix: "+" },
];

const spotlightServices = [
  { ...ecosystemModules[0], spotlight: "Most Popular" },
  { ...ecosystemModules[4], spotlight: "Trending" },
  { ...ecosystemModules[3], spotlight: "New" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
};
const itemVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }
};

// ── Animated Counter ──────────────────────────────────

function AnimatedCounter({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let frame: number;
    const duration = 1500;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [target]);
  return <>{count}{suffix}</>;
}

// ── Component ─────────────────────────────────────────

const Index = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recent, favorites, trackVisit, toggleFavorite, isFavorite } = useRecentServices();
  const [search, setSearch] = useState("");
  const [spotlightIdx, setSpotlightIdx] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setSpotlightIdx(i => (i + 1) % spotlightServices.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return uniqueModules.filter(m =>
      m.title.toLowerCase().includes(q) ||
      m.badge?.toLowerCase().includes(q) ||
      m.category?.toLowerCase().includes(q) ||
      m.description?.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [search]);

  const recentModules = useMemo(() =>
    recent.map(path => uniqueModules.find(m => m.path === path)).filter(Boolean).slice(0, 6),
    [recent]
  );

  const favoriteModules = useMemo(() =>
    favorites.map(path => uniqueModules.find(m => m.path === path)).filter(Boolean),
    [favorites]
  );

  const recommendations = useMemo(() => {
    const visitedCategories = recent
      .map(path => uniqueModules.find(m => m.path === path)?.category)
      .filter(Boolean) as string[];
    const catCounts: Record<string, number> = {};
    visitedCategories.forEach(c => { catCounts[c] = (catCounts[c] || 0) + 1; });
    const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1]).map(e => e[0]);
    if (topCats.length === 0) return uniqueModules.filter(m => (m as any).featured).slice(0, 4);
    return uniqueModules
      .filter(m => topCats.includes(m.category || '') && !recent.includes(m.path))
      .slice(0, 4);
  }, [recent]);

  const handleNavigate = (path: string) => {
    trackVisit(path);
    navigate(path);
  };

  const currentSpotlight = spotlightServices[spotlightIdx];

  const ModuleCard = ({ mod, size = "sm", showFav = false }: { mod: any; size?: "sm" | "lg"; showFav?: boolean }) => {
    const Icon = mod.icon;
    const isLg = size === "lg";
    return (
      <motion.div variants={itemVariant}>
        <Card
          className={`group cursor-pointer overflow-hidden relative border-border/50 hover:border-primary/40 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/5 ${mod.featured ? 'ring-1 ring-primary/20' : ''}`}
          onClick={() => handleNavigate(mod.path)}
        >
          <div className={`h-1 bg-gradient-to-r ${mod.gradient} opacity-70 group-hover:opacity-100 transition-opacity`} />
          <CardHeader className={isLg ? "p-4 sm:p-5" : "p-3 sm:p-4"}>
            <div className="flex items-start gap-3">
              <div className={`${isLg ? 'w-11 h-11 sm:w-14 sm:h-14' : 'w-9 h-9 sm:w-11 sm:h-11'} rounded-xl bg-gradient-to-br ${mod.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg group-hover:shadow-xl`}>
                <Icon className={`${isLg ? 'w-5 h-5 sm:w-7 sm:h-7' : 'w-4 h-4 sm:w-5 sm:h-5'} text-white`} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-1">
                  <CardTitle className={`${isLg ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'} group-hover:text-primary transition-colors line-clamp-1`}>
                    {mod.title}
                  </CardTitle>
                  {showFav && (
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(mod.path); }}
                      className="shrink-0 p-1 hover:bg-primary/10 rounded transition-colors"
                    >
                      {isFavorite(mod.path) ? <Pin className="w-3 h-3 text-primary" /> : <PinOff className="w-3 h-3 text-muted-foreground" />}
                    </button>
                  )}
                </div>
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

  const SectionHeader = ({ icon: Icon, title, badge, badgeClass, action }: any) => (
    <motion.div variants={itemVariant} className="flex items-center gap-3 mb-4 sm:mb-6 px-1">
      <div className="p-2 rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>
      <h2 className="text-lg sm:text-2xl font-bold">{title}</h2>
      {badge && <Badge className={badgeClass || "bg-primary/10 text-primary border-primary/20"}>{badge}</Badge>}
      {action}
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* ── Video Hero ───────────────────────────────── */}
      <div className="relative overflow-hidden h-[70vh] sm:h-[80vh] min-h-[500px]">
        {/* Video background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          src="/beach-hero-sm.mp4"
        />
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />

        {/* Content over video */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white/90 text-sm mb-8"
              animate={{ boxShadow: ["0 0 0 0 rgba(255,255,255,0)", "0 0 30px 4px rgba(255,255,255,0.1)", "0 0 0 0 rgba(255,255,255,0)"] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4" />
              <span className="font-medium">All-in-One Digital Platform</span>
            </motion.div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black text-white mb-4 tracking-tight"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              Unique
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-lg sm:text-xl text-white/80 max-w-2xl mb-10 font-light"
            style={{ textShadow: "0 2px 10px rgba(0,0,0,0.4)" }}
          >
            Discover, create, connect — your digital universe starts here
          </motion.p>

          {/* Search bar over video */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            className="relative w-full max-w-xl mb-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services... (e.g. education, dating, AI)"
                className="pl-12 pr-10 h-14 text-base rounded-2xl bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/15 shadow-2xl"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-white/60 hover:text-white transition-colors" />
                </button>
              )}
            </div>

            <AnimatePresence>
              {searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  className="absolute top-full mt-2 w-full bg-card border border-border/50 rounded-xl shadow-2xl z-50 overflow-hidden"
                >
                  {searchResults.map((mod) => {
                    const Icon = mod.icon;
                    return (
                      <button
                        key={mod.path}
                        onClick={() => { setSearch(""); handleNavigate(mod.path); }}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 transition-colors text-left"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${mod.gradient} flex items-center justify-center shrink-0`}>
                          <Icon className="w-4 h-4 text-white" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{mod.title}</p>
                          {mod.description && <p className="text-xs text-muted-foreground truncate">{mod.description}</p>}
                        </div>
                        <Badge variant="secondary" className="text-[9px] shrink-0">{mod.badge}</Badge>
                        <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1 }}
            className="flex flex-wrap justify-center gap-3"
          >
            <Button size="lg" onClick={() => handleNavigate('/wall')} className="bg-white text-black hover:bg-white/90 shadow-2xl font-bold rounded-xl px-8">
              <Zap className="w-4 h-4" /> Explore Now
            </Button>
            <Button size="lg" variant="outline" onClick={() => handleNavigate('/ai-experiences')} className="border-white/30 text-black bg-white/80 hover:bg-white/90 rounded-xl px-8">
              <Sparkles className="w-4 h-4" /> Discover AI
            </Button>
          </motion.div>
        </div>

        {/* Bottom fade to content */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 py-6 sm:py-10 space-y-8 sm:space-y-14">

        {/* ── Stats ────────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 -mt-16 relative z-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              className="text-center p-4 sm:p-6 rounded-2xl bg-card border border-border/30 hover:border-primary/30 transition-colors shadow-lg"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-2xl sm:text-4xl font-black text-primary">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Quick Actions ────────────────────────────── */}
        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <SectionHeader icon={Zap} title="Quick Actions" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {quickActions.map((action, i) => (
              <motion.div key={i} variants={itemVariant}>
                <Card
                  className="group cursor-pointer text-center p-4 sm:p-5 hover:border-primary/40 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
                  onClick={() => handleNavigate(action.path)}
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                    <action.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold group-hover:text-primary transition-colors">{action.label}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ── Featured Spotlight ───────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <SectionHeader icon={Star} title="Spotlight" badge="Featured" badgeClass="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30" />
          <Card className="overflow-hidden border-border/30">
            <AnimatePresence mode="wait">
              <motion.div
                key={spotlightIdx}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.4 }}
                className={`relative p-6 sm:p-10 bg-gradient-to-br ${currentSpotlight.gradient} cursor-pointer`}
                onClick={() => handleNavigate(currentSpotlight.path)}
              >
                <div className="absolute inset-0 bg-black/30" />
                <div className="relative z-10 flex items-center gap-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <currentSpotlight.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </div>
                  <div className="flex-1">
                    <Badge className="bg-white/20 text-white border-white/30 mb-2">{currentSpotlight.spotlight}</Badge>
                    <h3 className="text-xl sm:text-3xl font-black text-white mb-1">{currentSpotlight.title}</h3>
                    <p className="text-white/70 text-sm sm:text-base">{currentSpotlight.description}</p>
                  </div>
                  <ArrowRight className="w-8 h-8 text-white/60 shrink-0" />
                </div>
                <div className="relative z-10 flex justify-center gap-2 mt-6">
                  {spotlightServices.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setSpotlightIdx(i); }}
                      className={`w-2 h-2 rounded-full transition-all ${i === spotlightIdx ? 'bg-white w-6' : 'bg-white/40'}`}
                    />
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
        </motion.section>

        {/* ── Favorites ────────────────────────────────── */}
        {favoriteModules.length > 0 && (
          <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <SectionHeader icon={Pin} title="Your Favorites" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {favoriteModules.map((mod: any, i) => <ModuleCard key={i} mod={mod} showFav />)}
            </div>
          </motion.section>
        )}

        {/* ── Recently Visited ─────────────────────────── */}
        {recentModules.length > 0 && (
          <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <SectionHeader icon={Clock} title="Recently Visited" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {recentModules.map((mod: any, i) => <ModuleCard key={i} mod={mod} showFav />)}
            </div>
          </motion.section>
        )}

        {/* ── Recommendations ──────────────────────────── */}
        {recommendations.length > 0 && (
          <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <SectionHeader icon={Sparkles} title="Recommended for You" badge="AI" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {recommendations.map((mod: any, i) => <ModuleCard key={i} mod={mod} showFav />)}
            </div>
          </motion.section>
        )}

        {/* ── Ecosystem ────────────────────────────────── */}
        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <SectionHeader icon={Crown} title="Ecosystem Modules" badge="Premium" badgeClass="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {ecosystemModules.map((mod, i) => <ModuleCard key={i} mod={mod} showFav />)}
          </div>
        </motion.section>

        {/* ── Core ─────────────────────────────────────── */}
        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
          <SectionHeader icon={Sparkles} title="Core Modules" badge="AI-Powered" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {coreModules.map((mod, i) => <ModuleCard key={i} mod={mod} showFav />)}
          </div>
        </motion.section>

        {/* ── All Services ─────────────────────────────── */}
        <motion.section variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.05 }}>
          <SectionHeader icon={Zap} title="All Services" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {services.map((mod, i) => <ModuleCard key={i} mod={{ ...mod, description: "" }} size="lg" showFav />)}
          </div>
        </motion.section>

        {/* ── Footer CTA ───────────────────────────────── */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center pb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5 max-w-2xl mx-auto">
            <CardContent className="py-8 sm:py-10">
              <h3 className="text-xl sm:text-2xl font-black mb-2">Ready to get started?</h3>
              <p className="text-muted-foreground mb-4">Choose a service above and begin your journey!</p>
              <Button size="lg" onClick={() => handleNavigate('/wall')} className="bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90">
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
