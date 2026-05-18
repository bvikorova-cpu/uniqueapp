import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import { useRecentServices } from "@/hooks/useRecentServices";
import RewardedAdCard from "@/components/ads/RewardedAdCard";
import { AD_PLACEMENTS } from "@/components/ads/AdPlacements";
import heroHdVideo from "@/assets/unique-hero-hd.mp4.asset.json";
import { SEO } from "@/components/SEO";
import { Age16Badge } from "@/components/Age16Badge";
import { HowItWorksTrust } from "@/components/trust/HowItWorksTrust";
import { FoundingMembersBanner } from "@/components/founding/FoundingMembersBanner";
import { InviteFriendsCallout } from "@/components/referral/InviteFriendsCallout";
import {
  Car, Baby, GraduationCap, Briefcase, Heart, Sparkles, Trophy, Users,
  Video, Mic, ShoppingBag, Brain, TrendingUp, Ghost, Building2, Crown,
  Clock, Timer, ChefHat, MessageCircle, Star, MessageSquare, Palette,
  Camera, Gem, Shirt, ArrowRight, Zap, Search, X,
  PenTool, Globe, ChevronRight, Layers, Coins,
  Pin, PinOff, BookOpen
} from "lucide-react";

// ── Data ──────────────────────────────────────────────

const ecosystemModules = [
  { title: "Holographic Avatars", description: "AI-powered 3D avatars with breeding & battles", icon: Crown, path: "/holographic-avatars", badge: "3D AI", gradient: "from-purple-600 to-pink-600", featured: true, category: "creative" },
  { title: "Time Capsule 2.0", description: "Send messages to the future (1-20 years)", icon: Clock, path: "/time-capsule", badge: "Future", gradient: "from-blue-600 to-cyan-600", category: "social" },
  { title: "Time Reversal Social", description: "Live your life backwards with AI transformation", icon: Timer, path: "/time-reversal", badge: "Social", gradient: "from-violet-600 to-purple-600", category: "social" },
  { title: "KitchenStars Platform", description: "Online cooking competitions with prizes", icon: ChefHat, path: "/masterchef-subscription", badge: "Competition", gradient: "from-orange-600 to-red-600", category: "entertainment" },
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
  { title: "Beauty Studio", description: "AI makeup, skincare, nail art & celebrity look matching", icon: Star, path: "/beauty-studio", badge: "✨ 8 AI Tools", gradient: "from-rose-600 to-pink-600", featured: true, category: "creative" },
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
  { title: "AI Services", icon: Brain, path: "/psychologist", badge: "Wellness", gradient: "from-emerald-500 to-teal-500", category: "wellness" },
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
  { title: "AI Mentor", icon: GraduationCap, path: "/ai-mentor", badge: "Coaching", gradient: "from-blue-600 to-cyan-500", category: "learning" },
  
  { title: "AI Tattoo Designer", icon: PenTool, path: "/ai-tattoo", badge: "Design", gradient: "from-slate-600 to-zinc-500", category: "creative" },
  { title: "Image Analyzer", icon: Camera, path: "/analyzer", badge: "AI Vision", gradient: "from-sky-500 to-blue-500", category: "creative" },
  { title: "Anonymous Dating", icon: Heart, path: "/anonymous-date", badge: "Dating", gradient: "from-pink-600 to-fuchsia-500", category: "social" },
  { title: "Astrology", icon: Star, path: "/astrology", badge: "Horoscope", gradient: "from-indigo-500 to-purple-500", category: "wellness" },
  { title: "Auction House", icon: Trophy, path: "/auction", badge: "Bidding", gradient: "from-amber-500 to-orange-500", category: "shopping" },
  { title: "Bazaar", icon: ShoppingBag, path: "/bazaar", badge: "Shopping", gradient: "from-emerald-500 to-green-500", category: "shopping" },
  { title: "AI Clone", icon: Users, path: "/ai-clone", badge: "AI Twin", gradient: "from-violet-500 to-indigo-500", category: "creative" },
  { title: "Best Friend AI", icon: Heart, path: "/best-friend", badge: "Companion", gradient: "from-rose-500 to-pink-500", category: "social" },
  { title: "Brain Duel", icon: Brain, path: "/brain-duel", badge: "Challenge", gradient: "from-orange-500 to-red-500", category: "entertainment" },
  { title: "Cooking AI", icon: ChefHat, path: "/cooking-ai", badge: "Recipes", gradient: "from-orange-500 to-amber-500", category: "creative" },
  { title: "Creative Writing", icon: PenTool, path: "/creative-writing", badge: "Writing", gradient: "from-indigo-500 to-blue-500", category: "creative" },
  { title: "Fitness & Wellness", icon: Heart, path: "/fitness-wellness", badge: "Health", gradient: "from-green-500 to-teal-500", category: "wellness" },
  { title: "Food Scanner", icon: Camera, path: "/food-scanner", badge: "Nutrition", gradient: "from-lime-500 to-green-500", category: "wellness" },
  { title: "Fundraising", icon: Heart, path: "/fundraising", badge: "Charity", gradient: "from-blue-500 to-indigo-500", category: "social" },
  { title: "Future Face", icon: Sparkles, path: "/future-face", badge: "Age AI", gradient: "from-cyan-500 to-blue-500", category: "creative" },
  { title: "Skill Swap", icon: Users, path: "/skill-swap", badge: "Exchange", gradient: "from-teal-500 to-emerald-500", category: "social" },
  { title: "Megatalent", icon: Star, path: "/megatalent", badge: "Talent", gradient: "from-yellow-500 to-amber-500", category: "entertainment" },
  { title: "Virtual Pet", icon: Heart, path: "/virtual-pet", badge: "Pet", gradient: "from-green-400 to-emerald-500", category: "entertainment" },
  { title: "Virtual Escape Room", icon: Ghost, path: "/virtual-escape-room", badge: "Puzzle", gradient: "from-purple-600 to-violet-500", category: "entertainment" },
  { title: "Wellness Hub", icon: Heart, path: "/wellness", badge: "Wellness", gradient: "from-teal-500 to-cyan-500", category: "wellness" },
  { title: "Wine Pairing", icon: ChefHat, path: "/wine-pairing", badge: "Sommelier", gradient: "from-red-500 to-rose-500", category: "creative" },
  { title: "Pet Translator", icon: MessageCircle, path: "/pet-translator", badge: "Pets", gradient: "from-amber-400 to-orange-500", category: "creative" },
  { title: "Plant Care", icon: Sparkles, path: "/plant-care", badge: "Garden", gradient: "from-green-500 to-lime-500", category: "wellness" },
  { title: "Photography", icon: Camera, path: "/photography", badge: "Photo", gradient: "from-sky-500 to-indigo-500", category: "creative" },
  { title: "Language Learning", icon: Globe, path: "/language-learning", badge: "Languages", gradient: "from-blue-500 to-purple-500", category: "learning" },
  { title: "Lie Detector", icon: Brain, path: "/lie-detector", badge: "Truth AI", gradient: "from-red-500 to-orange-500", category: "entertainment" },
  { title: "Kids Academy", icon: Baby, path: "/kids-academy", badge: "Education", gradient: "from-blue-400 to-cyan-400", category: "learning" },
  { title: "Coupon Marketplace", icon: ShoppingBag, path: "/coupon-marketplace", badge: "Deals", gradient: "from-green-500 to-emerald-500", category: "shopping" },
  { title: "Secret Santa", icon: Heart, path: "/secret-santa", badge: "Gifts", gradient: "from-red-500 to-green-500", category: "social" },
  { title: "Emotion Economy", icon: Heart, path: "/emotion-economy", badge: "Social", gradient: "from-pink-500 to-violet-500", category: "social" },
  { title: "Quantum Social", icon: Sparkles, path: "/quantum-social", badge: "Social", gradient: "from-blue-600 to-violet-600", category: "social" },
  { title: "Horse Racing", icon: Trophy, path: "/horse-racing", badge: "Racing", gradient: "from-green-600 to-emerald-600", category: "entertainment" },
  { title: "Vacationer", icon: Globe, path: "/vacationer", badge: "Travel", gradient: "from-sky-500 to-blue-500", category: "entertainment" },
  { title: "Video Ad Generator", icon: Video, path: "/video-ad-generator", badge: "Marketing", gradient: "from-red-500 to-pink-500", category: "creative" },
  { title: "Digital Marketing", icon: TrendingUp, path: "/digital-marketing", badge: "Marketing", gradient: "from-blue-500 to-indigo-500", category: "learning" },
  { title: "Handwriting AI", icon: PenTool, path: "/handwriting", badge: "AI", gradient: "from-amber-500 to-yellow-500", category: "creative" },
  { title: "Public Speaking", icon: Mic, path: "/public-speaking", badge: "Skills", gradient: "from-indigo-500 to-blue-500", category: "learning" },
  
  { title: "Past Life Explorer", icon: Sparkles, path: "/past-life", badge: "Spiritual", gradient: "from-purple-500 to-indigo-500", category: "wellness" },
  { title: "First Aid Guide", icon: Heart, path: "/first-aid", badge: "Health", gradient: "from-red-500 to-rose-500", category: "wellness" },
  { title: "Restaurant Analyzer", icon: ChefHat, path: "/restaurant-analyzer", badge: "Food", gradient: "from-orange-500 to-red-500", category: "creative" },
  { title: "Confessions", icon: Ghost, path: "/confessions", badge: "Anonymous", gradient: "from-gray-600 to-slate-500", category: "social" },
  { title: "Character Arena", icon: Trophy, path: "/character-arena", badge: "Battle", gradient: "from-red-600 to-orange-600", category: "entertainment" },
];

const allModules = [...ecosystemModules, ...coreModules, ...services.map(s => ({ ...s, description: "" }))];
const uniqueModules = allModules.filter((m, i, arr) => arr.findIndex(x => x.path === m.path) === i);

const quickActions = [
  { label: "Chat Now", icon: MessageCircle, path: "/messenger", gradient: "from-cyan-500 to-blue-500" },
  { label: "Create Content", icon: PenTool, path: "/content-studio", gradient: "from-purple-500 to-indigo-500" },
  { label: "AI Services", icon: Brain, path: "/psychologist", gradient: "from-emerald-500 to-teal-500" },
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

import spotlightAvatars from "@/assets/spotlight-avatars.jpg";
import spotlightRacing from "@/assets/spotlight-racing.jpg";
import spotlightChef from "@/assets/spotlight-chef.jpg";
import spotlightBeauty from "@/assets/spotlight-beauty.jpg";

const spotlightServices = [
  { ...coreModules[4], spotlight: "🔥 Hot Now", image: spotlightBeauty },
  { ...ecosystemModules[0], spotlight: "Most Popular", image: spotlightAvatars },
  { ...ecosystemModules[4], spotlight: "Trending", image: spotlightRacing },
  { ...ecosystemModules[3], spotlight: "New", image: spotlightChef },
];

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


  const handleNavigate = (path: string) => {
    trackVisit(path);
    navigate(path);
  };

  const currentSpotlight = spotlightServices[spotlightIdx];

  return (
    <>
      <SEO
        title="Unique - All-in-one social platform with AI, marketplace & games"
        description="Join Unique: AI tools, marketplace, dating, jobs, games, fundraising and creator monetization in one social platform."
        canonical="/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Unique",
          url: "https://uniqueapp.fun/",
          applicationCategory: "SocialNetworkingApplication",
          operatingSystem: "Web",
          offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
        }}
      />
    <div className="min-h-screen bg-background">
      {/* ── Hero Section ─────────────────────────────── */}
      <div className="relative overflow-hidden min-h-[500px] sm:min-h-[640px] lg:min-h-[720px] xl:min-h-[820px]">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="/unique-hero-poster-hd.jpg"
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ objectPosition: "center 35%" }}
        >
          <source src="/unique-hero-mobile-v3.mp4" type="video/mp4" media="(max-width: 767px)" />
          <source src={heroHdVideo.url} type="video/mp4" media="(min-width: 768px)" />
          <source src="/unique-hero-opt-v3.mp4" type="video/mp4" />
        </video>
        {/* Gradient fallback behind video */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-primary animate-gradient-shift -z-10" />
        {/* Cinematic overlays — vignette + bottom gradient for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.55)_100%)]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-[480px] sm:min-h-[640px] lg:min-h-[720px] xl:min-h-[820px] px-4 text-center pt-16 pb-8 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap justify-center mb-6">
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/50 backdrop-blur-md border border-white/40 text-white text-sm shadow-lg drop-shadow-md">
              <Sparkles className="w-4 h-4 text-white" />
              <span className="font-semibold text-white" style={{ textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>All-in-One Digital Platform</span>
            </div>
            <Age16Badge size="sm" withLabel={false} variant="outline" className="text-white border-white/40 bg-white/10 backdrop-blur-md" />
          </div>

          <h1
            className="text-4xl sm:text-6xl lg:text-8xl font-black text-white mb-4 tracking-tight"
            style={{ textShadow: "0 4px 30px rgba(0,0,0,0.5)" }}
          >
            Welcome to{" "}
            <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-300 bg-clip-text text-transparent">
              Unique
            </span>
          </h1>

          <p
            className="text-base sm:text-xl text-white max-w-2xl mb-8 font-semibold"
            style={{ textShadow: "0 2px 12px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.6)" }}
          >
            Discover, create, connect — your digital universe starts here
          </p>

          {/* Search bar */}
          <div className="relative w-full max-w-xl mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search services... (e.g. education, dating, AI)"
                className="pl-12 pr-10 h-14 text-base rounded-2xl bg-white/15 backdrop-blur-lg border-white/20 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/20 shadow-2xl transition-all"
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
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
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
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-3 w-full px-4">
            <Button size="lg" onClick={() => handleNavigate('/wall')} className="bg-white text-foreground hover:bg-white/90 shadow-2xl font-bold rounded-xl px-8 w-full sm:w-auto">
              <Zap className="w-4 h-4" /> Explore Now
            </Button>
            <Button size="lg" onClick={() => handleNavigate('/ai-experiences')} className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-[0_8px_30px_-5px_hsl(var(--accent)/0.6)] font-bold rounded-xl px-8 w-full sm:w-auto border-2 border-white/30">
              <Sparkles className="w-4 h-4" /> Discover AI
            </Button>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-10 sm:space-y-14">

        {/* ── Founding Members programme (first 100) ───── */}
        <FoundingMembersBanner />

        {/* ── Stats ────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-2 sm:-mt-16 relative z-20">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="text-center p-5 sm:p-7 rounded-2xl bg-card border border-border/40 hover:border-primary/40 transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
            >
              <p className="text-3xl sm:text-5xl font-black bg-gradient-to-br from-primary to-accent bg-clip-text text-transparent">
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* ── Quick Actions ────────────────────────────── */}
        <section>
          <SectionHeader icon={Zap} title="Quick Actions" />
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
            {quickActions.map((action, i) => (
              <Card
                key={i}
                className="group cursor-pointer text-center p-4 sm:p-5 hover:border-primary/40 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 bg-card"
                onClick={() => handleNavigate(action.path)}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 mx-auto rounded-2xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-2 sm:mb-3 group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-lg`}>
                  <action.icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <p className="text-xs sm:text-sm font-semibold group-hover:text-primary transition-colors">{action.label}</p>
              </Card>
            ))}
          </div>
          <RewardedAdCard sectionKey="quick_actions" adSlot={AD_PLACEMENTS.FOOTER_BANNER} className="mt-4" />
        </section>
        <section>
          <SectionHeader icon={Star} title="Spotlight" badge="Featured" badgeClass="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30" />
          <Card className="overflow-hidden border-border/30 shadow-xl group">
            <AnimatePresence mode="wait">
              <motion.div
                key={spotlightIdx}
                initial={{ opacity: 0, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.5 }}
                className="relative cursor-pointer"
                onClick={() => handleNavigate(currentSpotlight.path)}
              >
                {/* Background image */}
                <img
                  src={currentSpotlight.image}
                  alt={currentSpotlight.title}
                  className="w-full h-[220px] sm:h-[300px] object-cover"
                  loading="lazy"
                  width={800}
                  height={512}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className={`absolute inset-0 bg-gradient-to-br ${currentSpotlight.gradient} opacity-30 mix-blend-overlay`} />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <div className="flex items-end gap-4">
                    <div className="flex-1">
                      <Badge className="bg-white/20 text-white border-white/30 mb-3 backdrop-blur-sm">{currentSpotlight.spotlight}</Badge>
                      <h3 className="text-2xl sm:text-4xl font-black text-white mb-1 drop-shadow-lg">{currentSpotlight.title}</h3>
                      <p className="text-white/80 text-sm sm:text-base max-w-md">{currentSpotlight.description}</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 group-hover:bg-white/30 transition-colors">
                      <ArrowRight className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Dots */}
                  <div className="flex justify-center gap-2 mt-5">
                    {spotlightServices.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setSpotlightIdx(i); }}
                        className={`h-2 rounded-full transition-all ${i === spotlightIdx ? 'bg-white w-8' : 'bg-white/40 w-2'}`}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </Card>
          <RewardedAdCard sectionKey="spotlight" adSlot={AD_PLACEMENTS.FOOTER_BANNER} className="mt-4" />
        </section>
        {favoriteModules.length > 0 && (
          <section>
            <SectionHeader icon={Pin} title="Your Favorites" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
              {favoriteModules.map((mod: any, i) => <ModuleCard key={i} mod={mod} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />)}
            </div>
          </section>
        )}

        {/* ── Recently Visited ─────────────────────────── */}
        {recentModules.length > 0 && (
          <section>
            <SectionHeader icon={Clock} title="Recently Visited" />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
              {recentModules.map((mod: any, i) => <ModuleCard key={i} mod={mod} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />)}
            </div>
          </section>
        )}

        {/* ── Ecosystem ────────────────────────────────── */}
        <section>
          <SectionHeader icon={Crown} title="Ecosystem Modules" badge="Premium" badgeClass="bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {ecosystemModules.map((mod, i) => (
              <ModuleCard key={i} mod={mod} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
            ))}
          </div>
          <RewardedAdCard sectionKey="ecosystem" adSlot={AD_PLACEMENTS.FOOTER_BANNER} className="mt-4" />
        </section>

        {/* ── Core ─────────────────────────────────────── */}
        <section>
          <SectionHeader icon={Sparkles} title="Core Modules" badge="AI-Powered" />

          {/* Beauty Studio Featured Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="mb-4 cursor-pointer relative overflow-hidden rounded-xl border border-pink-500/30 bg-gradient-to-r from-rose-950/80 via-pink-950/60 to-purple-950/80 p-4 sm:p-6 shadow-xl shadow-pink-500/10"
            onClick={() => navigate("/beauty-studio")}
          >
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(244,63,94,0.15),_transparent_60%)]" />
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3">
              <Badge className="bg-pink-500/20 text-pink-300 border-pink-500/30 text-[10px] sm:text-xs animate-pulse">
                🔥 Featured
              </Badge>
            </div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0 shadow-lg shadow-pink-500/30">
                <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-xl font-black text-white">✨ Beauty Studio</h3>
                <p className="text-xs sm:text-sm text-pink-200/80 mt-0.5">AI makeup, skincare analysis, nail art & celebrity look matching</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {["Makeup", "Skin AI", "Nail Art", "Celebrity Match", "Hair", "Gallery"].map(tag => (
                    <span key={tag} className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-pink-500/15 text-pink-300 border border-pink-500/20">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-pink-400 shrink-0 hidden sm:block" />
            </div>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
            {coreModules.map((mod, i) => (
              <ModuleCard key={i} mod={mod} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
            ))}
          </div>
          <RewardedAdCard sectionKey="core_modules" adSlot={AD_PLACEMENTS.FOOTER_BANNER} className="mt-4" />
        </section>

        {/* ── All Services ─────────────────────────────── */}
        <section>
          <SectionHeader icon={Zap} title="All Services" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {services.map((mod, i) => (
              <ModuleCard key={i} mod={{ ...mod, description: "" }} showFav onNavigate={handleNavigate} isFavorite={isFavorite} toggleFavorite={toggleFavorite} />
            ))}
          </div>
          <RewardedAdCard sectionKey="all_services" adSlot={AD_PLACEMENTS.FOOTER_BANNER} className="mt-4" />
        </section>

        {/* ── About Unique ─────────────────────────────── */}
        <section>
          <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-card via-card to-card/90 shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.06),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,hsl(var(--accent)/0.05),transparent_50%)]" />
            <CardHeader className="relative text-center pb-4">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('home.welcome_title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="relative space-y-5 text-center px-6 sm:px-10 pb-8">
              <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
                {t('home.welcome_intro')}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                <span className="text-xs text-primary font-bold uppercase tracking-widest">{t('home.welcome_priority')}</span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
              </div>
              <p className="text-base sm:text-lg text-foreground/85 leading-relaxed">
                {t('home.welcome_feedback')}{" "}
                <Link to="/contact" className="text-primary hover:underline font-semibold">{t('home.welcome_contact_link')}</Link>.{" "}
                {t('home.welcome_feedback_value')}
              </p>
              <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                <p className="text-base font-semibold text-foreground/90">
                  {t('home.welcome_promise')}
                </p>
              </div>
              <p className="text-lg font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {t('home.welcome_thanks')}
              </p>
            </CardContent>
          </Card>
        </section>

        {/* ── Why Unique? ──────────────────────────────── */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl sm:text-4xl font-black mb-3">
              {t('home.why_unique_title')}{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Unique</span>?
            </h2>
            <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
              {t('home.why_unique_discover')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Card className="group border border-primary/20 hover:border-primary/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/10 bg-card">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <Layers className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{t('home.all_in_one_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t('home.all_in_one_desc')}</p>
              </CardContent>
            </Card>

            <Card className="group border border-accent/20 hover:border-accent/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-accent/10 bg-card">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">{t('home.premium_features_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t('home.premium_features_desc')}</p>
              </CardContent>
            </Card>

            <Card className="group border border-gold/20 hover:border-gold/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-gold/10 bg-card">
              <CardHeader>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold to-yellow-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg">
                  <Coins className="w-7 h-7 text-white" />
                </div>
                <CardTitle className="text-xl group-hover:text-gold transition-colors">{t('home.earn_while_social_title')}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed">{t('home.earn_while_social_desc')}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Trust + How it works + FAQ ───────────────── */}
        <InviteFriendsCallout />

        <HowItWorksTrust />

        {/* ── Footer CTA ───────────────────────────────── */}
        <div className="text-center pb-8">
          <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-background to-accent/5 max-w-2xl mx-auto shadow-lg">
            <CardContent className="py-8 sm:py-10">
              <h3 className="text-xl sm:text-2xl font-black mb-2">Ready to get started?</h3>
              <p className="text-muted-foreground mb-4">Choose a service above and begin your journey!</p>
              <Button size="lg" onClick={() => handleNavigate('/wall')} className="bg-gradient-to-r from-primary to-accent text-white hover:opacity-90 shadow-lg">
                <ArrowRight className="w-4 h-4" /> Get Started
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </>
  );
};

// ── Sub-components (outside main component to avoid re-creation) ──

function SectionHeader({ icon: Icon, title, badge, badgeClass }: { icon: any; title: string; badge?: string; badgeClass?: string }) {
  return (
    <div className="flex items-center gap-3 mb-4 sm:mb-6 px-1">
      <div className="p-2 rounded-xl bg-primary/10">
        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
      </div>
      <h2 className="text-lg sm:text-2xl font-black">{title}</h2>
      {badge && <Badge className={badgeClass || "bg-primary/10 text-primary border-primary/20"}>{badge}</Badge>}
    </div>
  );
}

function ModuleCard({ mod, size = "sm", showFav = false, onNavigate, isFavorite, toggleFavorite }: {
  mod: any; size?: "sm" | "lg"; showFav?: boolean;
  onNavigate: (path: string) => void;
  isFavorite: (path: string) => boolean;
  toggleFavorite: (path: string) => void;
}) {
  const Icon = mod.icon;
  const isLg = size === "lg";
  return (
    <Card
      className={`group cursor-pointer overflow-hidden relative border-border/50 hover:border-primary/40 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5 bg-card ${mod.featured ? 'ring-1 ring-primary/20' : ''}`}
      onClick={() => onNavigate(mod.path)}
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
  );
}

export default Index;
