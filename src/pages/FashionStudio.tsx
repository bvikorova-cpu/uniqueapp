import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Palette, Sparkles, ShoppingBag, Trophy, Camera, Package, Heart,
  Shirt, ArrowLeft, TrendingUp, Brain, Zap, Eye, Gem,
  Leaf, Layers, Crown, Star, Target, Flame, Swords, MessageCircle,
  Clapperboard, Video, ScanLine, BarChart3, ShoppingCart, Globe,
  Calendar, Scissors, Repeat, Flower2, Calculator, BookOpen,
  BadgeCheck, HeartHandshake, Radar, Wand2
} from "lucide-react";
import FashionGenerator from "@/components/fashion/FashionGenerator";
import FashionGallery from "@/components/fashion/FashionGallery";
import FashionMarketplace from "@/components/fashion/FashionMarketplace";
import FashionChallenges from "@/components/fashion/FashionChallenges";
import { VirtualTryOn } from "@/components/fashion/VirtualTryOn";
import { CapsuleWardrobe } from "@/components/fashion/CapsuleWardrobe";
import { OutfitRecommender } from "@/components/fashion/OutfitRecommender";
import { WardrobeManager } from "@/components/fashion/WardrobeManager";
import { ShoppingWishlist } from "@/components/fashion/ShoppingWishlist";
import AIStyleDNA from "@/components/fashion/AIStyleDNA";
import AITrendForecaster from "@/components/fashion/AITrendForecaster";
import AIColorHarmony from "@/components/fashion/AIColorHarmony";
import AIMoodBoard from "@/components/fashion/AIMoodBoard";
import AIBodyShapeAnalyzer from "@/components/fashion/AIBodyShapeAnalyzer";
import AISustainableFashion from "@/components/fashion/AISustainableFashion";
import AIFashionShowSimulator from "@/components/fashion/AIFashionShowSimulator";
import StyleBattleArena from "@/components/fashion/StyleBattleArena";
import AIOotd from "@/components/fashion/AIOotd";
import AIPersonalShopper from "@/components/fashion/AIPersonalShopper";
import FashionShowVideoGenerator from "@/components/fashion/FashionShowVideoGenerator";
import AIStyleScanner from "@/components/fashion/AIStyleScanner";
import SeasonStyleLeagues from "@/components/fashion/SeasonStyleLeagues";
import AIShoppingLinks from "@/components/fashion/AIShoppingLinks";
import WardrobeAnalytics from "@/components/fashion/WardrobeAnalytics";
import GlobalStreetStyleFeed from "@/components/fashion/GlobalStreetStyleFeed";
import AIFashionForecastCalendar from "@/components/fashion/AIFashionForecastCalendar";
import AIFabricAnalyzer from "@/components/fashion/AIFabricAnalyzer";
import AICelebrityStyleClone from "@/components/fashion/AICelebrityStyleClone";
import AIColorSeasonAnalysis from "@/components/fashion/AIColorSeasonAnalysis";
import AIOutfitRemixEngine from "@/components/fashion/AIOutfitRemixEngine";
import AIFashionMoodRing from "@/components/fashion/AIFashionMoodRing";
import AIOutfitCostCalculator from "@/components/fashion/AIOutfitCostCalculator";
import AIFashionHistoryExplorer from "@/components/fashion/AIFashionHistoryExplorer";
import AIDressCodeAdvisor from "@/components/fashion/AIDressCodeAdvisor";
import AIFashionCompatibility from "@/components/fashion/AIFashionCompatibility";
import AITrendAlertRadar from "@/components/fashion/AITrendAlertRadar";
import AIVirtualStylistSession from "@/components/fashion/AIVirtualStylistSession";
import { useAICredits } from "@/hooks/useAICredits";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroVideo from "@/assets/fashion-runway-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ActiveView =
  | "hub" | "generator" | "gallery" | "marketplace" | "challenges"
  | "try-on" | "capsule" | "recommender" | "wardrobe" | "wishlist"
  | "style-dna" | "trend-forecaster" | "color-harmony" | "mood-board"
  | "body-shape" | "sustainable" | "fashion-show" | "style-battle"
  | "ootd" | "personal-shopper" | "video-generator" | "style-scanner"
  | "season-leagues" | "shopping-links" | "wardrobe-analytics" | "street-style"
  | "forecast-calendar" | "fabric-analyzer" | "celebrity-clone" | "color-season" | "outfit-remix" | "mood-ring"
  | "outfit-cost" | "history-explorer" | "dress-code" | "fashion-compat" | "trend-radar" | "virtual-stylist";

const useFashionStats = () => {
  return useQuery({
    queryKey: ["fashion-live-stats"],
    queryFn: async () => {
      const [designs, items, challenges, battles] = await Promise.all([
        supabase.from("fashion_designs").select("id", { count: "exact", head: true }),
        supabase.from("wardrobe_items").select("id", { count: "exact", head: true }),
        supabase.from("fashion_challenges").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("fashion_style_battles").select("id", { count: "exact", head: true }).eq("status", "active"),
      ]);
      return {
        designs: designs.count || 0,
        wardrobeItems: items.count || 0,
        challenges: challenges.count || 0,
        battles: battles.count || 0,
      };
    },
    refetchInterval: 30000,
  });
};

export default function FashionStudio() {
  const navigate = useNavigate();
  const { credits, loading: creditsLoading } = useAICredits();
  const [activeView, setActiveView] = useState<ActiveView>("hub");
  const { data: stats } = useFashionStats();

  const tools = [
    // NEW AI Features
    { id: "fashion-show", title: "AI Fashion Show", desc: "Virtual runway show from your outfit concepts", cost: "15 Credits", icon: Clapperboard, gradient: "from-pink-500 to-rose-600", isNew: true },
    { id: "style-battle", title: "Style Battle Arena", desc: "P2P outfit competitions with community voting", cost: "5 Credits", icon: Swords, gradient: "from-red-500 to-orange-600", isNew: true },
    { id: "ootd", title: "AI Outfit of the Day", desc: "Daily AI scoring of your outfit", cost: "5 Credits", icon: Camera, gradient: "from-amber-500 to-orange-600", isNew: true },
    { id: "personal-shopper", title: "AI Personal Shopper", desc: "Chat with Luna, your AI fashion consultant", cost: "2 Credits/msg", icon: MessageCircle, gradient: "from-violet-500 to-purple-600", isNew: true },
    // Enhancement features
    { id: "video-generator", title: "Fashion Video Generator", desc: "Cinematic runway video storyboards with AI direction", cost: "25 Credits", icon: Video, gradient: "from-red-500 to-pink-600", isNew: true },
    { id: "style-scanner", title: "AI Style Scanner", desc: "Instant outfit recognition, scoring & brand detection", cost: "8 Credits", icon: ScanLine, gradient: "from-cyan-500 to-blue-600", isNew: true },
    { id: "season-leagues", title: "Season Style Leagues", desc: "Competitive seasonal rankings & leaderboards", cost: "10 Credits", icon: Crown, gradient: "from-purple-500 to-pink-600", isNew: true },
    { id: "shopping-links", title: "AI Shopping Links", desc: "Direct purchase recommendations for any outfit", cost: "6 Credits", icon: ShoppingCart, gradient: "from-emerald-500 to-teal-600", isNew: true },
    { id: "wardrobe-analytics", title: "Wardrobe Analytics", desc: "Usage stats, cost-per-wear & optimization", cost: "10 Credits", icon: BarChart3, gradient: "from-indigo-500 to-purple-600", isNew: true },
    { id: "street-style", title: "Global Street Style", desc: "Community feed with AI trend mapping", cost: "3 Credits/post", icon: Globe, gradient: "from-orange-500 to-red-600", isNew: true },
    { id: "forecast-calendar", title: "Fashion Forecast Calendar", desc: "7-day personalized style predictions", cost: "12 Credits", icon: Calendar, gradient: "from-amber-500 to-orange-600", isNew: true },
    { id: "fabric-analyzer", title: "AI Fabric Analyzer", desc: "Identify fabrics, quality & care from photos", cost: "10 Credits", icon: Scissors, gradient: "from-teal-500 to-cyan-600", isNew: true },
    { id: "celebrity-clone", title: "Celebrity Style Clone", desc: "Recreate iconic looks with budget alternatives", cost: "15 Credits", icon: Crown, gradient: "from-yellow-500 to-amber-600", isNew: true },
    { id: "color-season", title: "Color Season Analysis", desc: "Discover your Spring/Summer/Autumn/Winter palette", cost: "8 Credits", icon: Flower2, gradient: "from-rose-500 to-pink-600", isNew: true },
    { id: "outfit-remix", title: "Outfit Remix Engine", desc: "Transform 1 outfit into 10 different looks", cost: "10 Credits", icon: Repeat, gradient: "from-violet-500 to-fuchsia-600", isNew: true },
    { id: "mood-ring", title: "Fashion Mood Ring", desc: "AI reads your mood & suggests outfits", cost: "5 Credits", icon: Heart, gradient: "from-pink-500 to-purple-600", isNew: true },
    { id: "outfit-cost", title: "Outfit Cost Calculator", desc: "Detailed cost breakdown with budget alternatives", cost: "8 Credits", icon: Calculator, gradient: "from-emerald-500 to-green-600", isNew: true },
    { id: "history-explorer", title: "Fashion History Explorer", desc: "Discover historical eras & cultural influences", cost: "10 Credits", icon: BookOpen, gradient: "from-amber-500 to-yellow-600", isNew: true },
    { id: "dress-code", title: "AI Dress Code Advisor", desc: "Event-specific outfit guidance & etiquette", cost: "6 Credits", icon: BadgeCheck, gradient: "from-blue-500 to-indigo-600", isNew: true },
    { id: "fashion-compat", title: "Fashion Compatibility", desc: "Style compatibility analysis between outfits", cost: "8 Credits", icon: HeartHandshake, gradient: "from-pink-500 to-rose-600", isNew: true },
    { id: "trend-radar", title: "Trend Alert Radar", desc: "Real-time trend scanning with virality scores", cost: "12 Credits", icon: Radar, gradient: "from-cyan-500 to-teal-600", isNew: true },
    { id: "virtual-stylist", title: "Virtual Stylist Session", desc: "Premium AI styling consultation", cost: "15 Credits", icon: Wand2, gradient: "from-purple-500 to-violet-600", isNew: true },
    // Existing tools
    { id: "generator", title: "AI Design Generator", desc: "Create unique clothing designs with AI", cost: "50-400 Credits", icon: Sparkles, gradient: "from-fuchsia-500 to-pink-600" },
    { id: "gallery", title: "Design Gallery", desc: "Browse & discover community creations", cost: "Free", icon: Eye, gradient: "from-purple-500 to-violet-600" },
    { id: "marketplace", title: "Design Marketplace", desc: "Buy & sell unique fashion designs", cost: "€9.90-€19.90", icon: ShoppingBag, gradient: "from-emerald-500 to-teal-600" },
    { id: "challenges", title: "Fashion Challenges", desc: "Compete in themed fashion contests", cost: "Free", icon: Trophy, gradient: "from-amber-500 to-yellow-600" },
    { id: "try-on", title: "Virtual Try-On", desc: "See how clothes look on you with AI", cost: "10 Credits", icon: Shirt, gradient: "from-cyan-500 to-blue-600" },
    { id: "capsule", title: "Capsule Wardrobe", desc: "AI-curated minimal wardrobe plan", cost: "15 Credits", icon: Package, gradient: "from-indigo-500 to-purple-600" },
    { id: "recommender", title: "Outfit Recommender", desc: "AI outfit suggestions for any occasion", cost: "5 Credits", icon: Heart, gradient: "from-rose-500 to-pink-600" },
    { id: "wardrobe", title: "Wardrobe Manager", desc: "Organize & track your clothing collection", cost: "Free", icon: Layers, gradient: "from-slate-500 to-gray-600" },
    { id: "wishlist", title: "Shopping Wishlist", desc: "Track items you want to purchase", cost: "Free", icon: Star, gradient: "from-yellow-500 to-amber-600" },
    { id: "style-dna", title: "AI Style DNA", desc: "Discover your unique fashion personality", cost: "8 Credits", icon: Brain, gradient: "from-fuchsia-500 to-pink-600" },
    { id: "trend-forecaster", title: "AI Trend Forecaster", desc: "Predict upcoming fashion trends", cost: "10 Credits", icon: TrendingUp, gradient: "from-violet-500 to-indigo-600" },
    { id: "color-harmony", title: "AI Color Harmony", desc: "Perfect color palettes for your outfits", cost: "5 Credits", icon: Palette, gradient: "from-red-500 to-rose-600" },
    { id: "mood-board", title: "AI Fashion Mood Board", desc: "Generate visual inspiration boards", cost: "12 Credits", icon: Target, gradient: "from-sky-500 to-cyan-600" },
    { id: "body-shape", title: "Body Shape Analyzer", desc: "AI styling tips for your body type", cost: "8 Credits", icon: Gem, gradient: "from-lime-500 to-green-600" },
    { id: "sustainable", title: "Sustainable Fashion AI", desc: "Eco-friendly wardrobe plans", cost: "6 Credits", icon: Leaf, gradient: "from-green-500 to-emerald-600" },
  ];

  const renderView = () => {
    switch (activeView) {
      case "generator": return <FashionGenerator />;
      case "gallery": return <FashionGallery />;
      case "marketplace": return <FashionMarketplace />;
      case "challenges": return <FashionChallenges />;
      case "try-on": return <VirtualTryOn />;
      case "capsule": return <CapsuleWardrobe />;
      case "recommender": return <OutfitRecommender />;
      case "wardrobe": return <WardrobeManager />;
      case "wishlist": return <ShoppingWishlist />;
      case "style-dna": return <AIStyleDNA />;
      case "trend-forecaster": return <AITrendForecaster />;
      case "color-harmony": return <AIColorHarmony />;
      case "mood-board": return <AIMoodBoard />;
      case "body-shape": return <AIBodyShapeAnalyzer />;
      case "sustainable": return <AISustainableFashion />;
      case "fashion-show": return <AIFashionShowSimulator />;
      case "style-battle": return <StyleBattleArena />;
      case "ootd": return <AIOotd />;
      case "personal-shopper": return <AIPersonalShopper />;
      case "video-generator": return <FashionShowVideoGenerator />;
      case "style-scanner": return <AIStyleScanner />;
      case "season-leagues": return <SeasonStyleLeagues />;
      case "shopping-links": return <AIShoppingLinks />;
      case "wardrobe-analytics": return <WardrobeAnalytics />;
      case "street-style": return <GlobalStreetStyleFeed />;
      case "forecast-calendar": return <AIFashionForecastCalendar />;
      case "fabric-analyzer": return <AIFabricAnalyzer />;
      case "celebrity-clone": return <AICelebrityStyleClone />;
      case "color-season": return <AIColorSeasonAnalysis />;
      case "outfit-remix": return <AIOutfitRemixEngine />;
      case "mood-ring": return <AIFashionMoodRing />;
      case "outfit-cost": return <AIOutfitCostCalculator />;
      case "history-explorer": return <AIFashionHistoryExplorer />;
      case "dress-code": return <AIDressCodeAdvisor />;
      case "fashion-compat": return <AIFashionCompatibility />;
      case "trend-radar": return <AITrendAlertRadar />;
      case "virtual-stylist": return <AIVirtualStylistSession />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    const currentTool = tools.find(t => t.id === activeView);
    return (
      <div className="min-h-screen bg-background pt-16 sm:pt-0">
        <FloatingHowItWorks
          title="Fashion Studio"
          intro="Try on outfits, mix styles and get AI stylist advice."
          steps={[
            { title: "Upload your photo", desc: "Full-body preferred." },
          { title: "Try on outfits", desc: "AI dresses you in clothes from the catalog." },
          { title: "Get a stylist review", desc: "AI suggests better matches." },
          { title: "Shop the look", desc: "Direct links to retailers." },
          { title: "Save looks", desc: "Build a lookbook for outfits you love." }
          ]}
        />
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <Button variant="ghost" onClick={() => setActiveView("hub")} className="mb-4 gap-2 drop-shadow-md">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Button>
          <h2 className="text-2xl sm:text-3xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            {currentTool?.title}
          </h2>
          {renderView()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Video Hero */}
      <div className="relative overflow-hidden h-[360px] sm:h-[440px] pt-16 sm:pt-0">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.3]"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-black/50 to-black/20" />

        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-primary/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-primary/30 mb-3">
              <Crown className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-white">AI Fashion Design Studio</span>
            </div>

            <h1
              className="text-3xl sm:text-4xl md:text-5xl font-black mb-2"
              style={{
                background: "linear-gradient(135deg, #fff, #f0abfc, #e879f9, #d946ef)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                WebkitTextStroke: "1.5px rgba(0,0,0,0.3)",
                textShadow: "0 0 40px rgba(217,70,239,0.5), 0 0 80px rgba(217,70,239,0.3)",
              }}
            >
              Fashion Studio
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mb-4">
              Design, compete & shop — powered by AI fashion intelligence
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-2xl">
              {[
                { label: "Designs", value: stats?.designs, icon: Sparkles },
                { label: "Wardrobe", value: stats?.wardrobeItems, icon: Shirt },
                { label: "Challenges", value: stats?.challenges, icon: Trophy },
                { label: "Battles", value: stats?.battles, icon: Swords },
              ].map((stat) => (
                <div key={stat.label} className="bg-black/30 backdrop-blur-xl rounded-lg p-2 sm:p-3 border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-xs text-white/60 truncate">{stat.label}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-white">{stat.value ?? "—"}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Engagement Row */}
      <div className="container mx-auto px-3 sm:px-4 -mt-4 relative z-20">
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-primary/20 text-center">
              <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-black">{creditsLoading ? "..." : credits?.credits_remaining || 0}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">AI Credits</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-primary/20 text-center">
              <Gem className="h-5 w-5 sm:h-6 sm:w-6 text-accent mx-auto mb-1" />
              <p className="text-lg sm:text-xl font-black">37</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Tools</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card
              className="p-3 sm:p-4 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl border-primary/30 text-center cursor-pointer hover:scale-[1.02] active:scale-[0.97] transition-transform"
              onClick={() => navigate('/ai-credits-store')}
            >
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
              <p className="text-sm sm:text-base font-black">Buy Credits</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Get more AI power</p>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* NEW Features Banner */}
      <div className="container mx-auto px-3 sm:px-4 mt-6">
        <Card className="p-4 bg-gradient-to-r from-pink-500/10 via-primary/10 to-violet-500/10 border-primary/20 backdrop-blur-xl">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-2xl">🔥</span>
            <div className="flex-1 min-w-[180px]">
              <p className="font-bold text-sm">22 New AI Features!</p>
              <p className="text-xs text-muted-foreground">Virtual Stylist, Trend Radar, Dress Code Advisor, Fashion Compatibility, Cost Calculator, History Explorer & more</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setActiveView("fashion-show")} className="text-xs">
              Try Now
            </Button>
          </div>
        </Card>
      </div>

      {/* Tool Cards Grid */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Fashion Studio Arsenal
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
            >
              <Card
                className="group cursor-pointer p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-white/10 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_25px_rgba(217,70,239,0.2)] h-full relative overflow-hidden"
                onClick={() => setActiveView(tool.id as ActiveView)}
              >
                {"isNew" in tool && tool.isNew && (
                  <span className="absolute top-1.5 right-1.5 text-[8px] font-black bg-gradient-to-r from-pink-500 to-rose-500 text-white px-1.5 py-0.5 rounded-full">
                    NEW
                  </span>
                )}
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-2 group-hover:scale-110 group-hover:shadow-lg transition-all`}>
                  <tool.icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <h3 className="font-bold text-xs sm:text-sm mb-0.5 line-clamp-1">{tool.title}</h3>
                <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-2 mb-1.5">{tool.desc}</p>
                <span className="text-[9px] sm:text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {tool.cost}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-3 sm:px-4 pb-8">
        <div className="p-5 sm:p-8 rounded-2xl bg-gradient-to-br from-pink-950/60 to-purple-950/60 border border-primary/30">
          <h2 className="text-xl sm:text-2xl font-black text-white mb-5">How Fashion Studio Works</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { n: "1", t: "Design", d: "Create AI-powered fashion designs" },
              { n: "2", t: "Compete", d: "Enter battles & daily challenges" },
              { n: "3", t: "Score", d: "Get AI ratings on your outfits" },
              { n: "4", t: "Shop", d: "Buy, sell & trade in marketplace" },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 text-center"
              >
                <div className="text-2xl sm:text-3xl font-black bg-gradient-to-br from-pink-400 to-purple-500 bg-clip-text text-transparent mb-1">
                  {step.n}
                </div>
                <h3 className="font-semibold text-white text-xs sm:text-sm mb-0.5">{step.t}</h3>
                <p className="text-[10px] sm:text-xs text-white/60">{step.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
