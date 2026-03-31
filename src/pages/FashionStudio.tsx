import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import {
  Palette, Sparkles, ShoppingBag, Trophy, Camera, Package, Heart,
  Shirt, ArrowLeft, TrendingUp, Scissors, Brain, Zap, Eye, Gem,
  Leaf, Layers, Crown, Star, Target, Flame
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
import { useAICredits } from "@/hooks/useAICredits";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroVideo from "@/assets/fashion-studio-hero.mp4.asset.json";

type ActiveView =
  | "hub" | "generator" | "gallery" | "marketplace" | "challenges"
  | "try-on" | "capsule" | "recommender" | "wardrobe" | "wishlist"
  | "style-dna" | "trend-forecaster" | "color-harmony" | "mood-board"
  | "body-shape" | "sustainable";

const useFashionStats = () => {
  return useQuery({
    queryKey: ["fashion-live-stats"],
    queryFn: async () => {
      const [designs, items, challenges, recommendations] = await Promise.all([
        supabase.from("fashion_designs").select("id", { count: "exact", head: true }),
        supabase.from("wardrobe_items").select("id", { count: "exact", head: true }),
        supabase.from("fashion_challenges").select("id", { count: "exact", head: true }).eq("is_active", true),
        supabase.from("outfit_recommendations").select("id", { count: "exact", head: true }),
      ]);
      return {
        designs: designs.count || 0,
        wardrobeItems: items.count || 0,
        challenges: challenges.count || 0,
        recommendations: recommendations.count || 0,
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
    { id: "generator", title: "AI Design Generator", desc: "Create unique clothing designs with AI", cost: "50-400 Credits", icon: Sparkles, gradient: "from-pink-500 to-rose-600" },
    { id: "gallery", title: "Design Gallery", desc: "Browse & discover community creations", cost: "Free", icon: Eye, gradient: "from-purple-500 to-violet-600" },
    { id: "marketplace", title: "Design Marketplace", desc: "Buy & sell unique fashion designs", cost: "€9.90-€19.90", icon: ShoppingBag, gradient: "from-emerald-500 to-teal-600" },
    { id: "challenges", title: "Fashion Challenges", desc: "Compete in themed fashion contests", cost: "Free", icon: Trophy, gradient: "from-amber-500 to-orange-600" },
    { id: "try-on", title: "Virtual Try-On", desc: "See how clothes look on you with AI", cost: "10 Credits", icon: Camera, gradient: "from-cyan-500 to-blue-600" },
    { id: "capsule", title: "Capsule Wardrobe", desc: "AI-curated minimal wardrobe plan", cost: "15 Credits", icon: Package, gradient: "from-indigo-500 to-purple-600" },
    { id: "recommender", title: "Outfit Recommender", desc: "AI outfit suggestions for any occasion", cost: "5 Credits", icon: Heart, gradient: "from-rose-500 to-pink-600" },
    { id: "wardrobe", title: "Wardrobe Manager", desc: "Organize & track your clothing collection", cost: "Free", icon: Shirt, gradient: "from-slate-500 to-gray-600" },
    { id: "wishlist", title: "Shopping Wishlist", desc: "Track items you want to purchase", cost: "Free", icon: Star, gradient: "from-yellow-500 to-amber-600" },
    { id: "style-dna", title: "AI Style DNA", desc: "Discover your unique fashion personality", cost: "8 Credits", icon: Brain, gradient: "from-fuchsia-500 to-pink-600" },
    { id: "trend-forecaster", title: "AI Trend Forecaster", desc: "Predict upcoming fashion trends", cost: "10 Credits", icon: TrendingUp, gradient: "from-violet-500 to-indigo-600" },
    { id: "color-harmony", title: "AI Color Harmony", desc: "Perfect color palettes for your outfits", cost: "5 Credits", icon: Palette, gradient: "from-red-500 to-rose-600" },
    { id: "mood-board", title: "AI Fashion Mood Board", desc: "Generate visual inspiration boards", cost: "12 Credits", icon: Layers, gradient: "from-sky-500 to-cyan-600" },
    { id: "body-shape", title: "Body Shape Analyzer", desc: "AI styling tips for your body type", cost: "8 Credits", icon: Target, gradient: "from-lime-500 to-green-600" },
    { id: "sustainable", title: "Sustainable Fashion AI", desc: "Eco-friendly wardrobe recommendations", cost: "6 Credits", icon: Leaf, gradient: "from-green-500 to-emerald-600" },
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
      default: return null;
    }
  };

  if (activeView !== "hub") {
    const currentTool = tools.find(t => t.id === activeView);
    return (
      <div className="min-h-screen bg-background pt-16 sm:pt-0">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <Button
            variant="ghost"
            onClick={() => setActiveView("hub")}
            className="mb-4 gap-2 drop-shadow-md"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
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
      <div className="relative overflow-hidden h-[340px] sm:h-[420px] pt-16 sm:pt-0">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[1.1] saturate-[1.2]"
          src={heroVideo.url}
        />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
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
              Create Your Fashion Vision
            </h1>
            <p className="text-sm sm:text-base text-white/80 max-w-xl mb-4">
              Design clothing with AI — from haute couture to streetwear
            </p>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-2xl">
              {[
                { label: "Designs", value: stats?.designs, icon: Sparkles },
                { label: "Wardrobe", value: stats?.wardrobeItems, icon: Shirt },
                { label: "Challenges", value: stats?.challenges, icon: Trophy },
                { label: "Outfits", value: stats?.recommendations, icon: Heart },
              ].map((stat) => (
                <div key={stat.label} className="bg-black/30 backdrop-blur-xl rounded-lg p-2 sm:p-3 border border-white/10">
                  <div className="flex items-center gap-1.5">
                    <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-primary" />
                    <span className="text-xs text-white/60 truncate">{stat.label}</span>
                  </div>
                  <p className="text-lg sm:text-xl font-black text-white">
                    {stat.value || "—"}
                  </p>
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
              <p className="text-lg sm:text-xl font-black">15</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Tools</p>
            </Card>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card
              className="p-3 sm:p-4 bg-gradient-to-r from-primary/20 to-accent/20 backdrop-blur-xl border-primary/30 text-center cursor-pointer hover:scale-[1.02] transition-transform"
              onClick={() => navigate('/ai-credits-store')}
            >
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary mx-auto mb-1" />
              <p className="text-sm sm:text-base font-black">Buy Credits</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">Get more AI power</p>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Tool Cards Grid */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Fashion Studio Tools
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-3">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card
                className="group cursor-pointer p-3 sm:p-4 bg-card/80 backdrop-blur-xl border-white/10 hover:border-primary/40 transition-all duration-300 hover:shadow-[0_0_20px_rgba(217,70,239,0.15)] active:scale-[0.97] h-full"
                onClick={() => setActiveView(tool.id as ActiveView)}
              >
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}>
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
    </div>
  );
}
