import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Palette, ShoppingBag, BookOpen, Search, Paintbrush, Crown, ImageIcon, ArrowLeft, Flame, Trophy, TrendingUp } from "lucide-react";
import { VirtualMakeup } from "@/components/beauty/VirtualMakeup";
import { HairStyleGenerator } from "@/components/beauty/HairStyleGenerator";
import { ProductRecommender } from "@/components/beauty/ProductRecommender";
import { MakeupTutorials } from "@/components/beauty/MakeupTutorials";
import { SkinAnalysis } from "@/components/beauty/SkinAnalysis";
import { NailArtDesigner } from "@/components/beauty/NailArtDesigner";
import { CelebrityLookMatch } from "@/components/beauty/CelebrityLookMatch";
import { BeautyGallery } from "@/components/beauty/BeautyGallery";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import heroVideo from "@/assets/beauty-studio-hero.mp4.asset.json";
import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const BEAUTY_HOW_IT_WORKS = [
  { title: "Pick a tool", desc: "Choose from AI Virtual Makeup, Hair Styler, Skin Analysis, Nail Art, Celebrity Match, Product Advisor, Tutorials or the community Gallery." },
  { title: "Upload your photo", desc: "Most tools ask for a clear selfie or reference photo. Your images stay private to your account." },
  { title: "Spend credits", desc: "Each tool costs 2–10 credits (shown on the tile). You get 10 free credits monthly; buy more anytime in the Credits Store." },
  { title: "Save & share", desc: "Save transformations to your gallery, publish before/after to the community, and track your streaks and achievements." },
  { title: "Learn as you go", desc: "Follow step-by-step Tutorials to master looks, then apply them with Virtual Makeup or Hair Styler." },
];

type ActiveView = "hub" | "makeup" | "hair" | "products" | "tutorials" | "skin-analysis" | "nail-art" | "celebrity-match" | "gallery";

const BeautyStudio = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<ActiveView>("hub");
  const [stats, setStats] = useState({ transformations: 0, styles: 0, analyses: 0, designs: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [t, s, a, n] = await Promise.all([
        supabase.from("beauty_transformations").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        (supabase as any).from("beauty_celebrity_matches").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        (supabase as any).from("beauty_skin_analyses").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        (supabase as any).from("beauty_nail_designs").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setStats({
        transformations: t.count || 0,
        styles: s.count || 0,
        analyses: a.count || 0,
        designs: n.count || 0,
      });
    };
    loadStats();
  }, []);

  const tools = [
    { id: "makeup" as ActiveView, icon: Sparkles, title: "Virtual Makeup", desc: "AI makeup try-on", cost: "5 Credits", color: "text-pink-500" },
    { id: "hair" as ActiveView, icon: Palette, title: "Hair Styler", desc: "Try new hairstyles", cost: "5 Credits", color: "text-purple-500" },
    { id: "skin-analysis" as ActiveView, icon: Search, title: "Skin Analysis", desc: "AI skincare routine", cost: "8 Credits", color: "text-blue-500" },
    { id: "nail-art" as ActiveView, icon: Paintbrush, title: "Nail Art Designer", desc: "Custom nail designs", cost: "5 Credits", color: "text-rose-500" },
    { id: "celebrity-match" as ActiveView, icon: Crown, title: "Celebrity Match", desc: "Find your twin", cost: "10 Credits", color: "text-yellow-500" },
    { id: "products" as ActiveView, icon: ShoppingBag, title: "Product Advisor", desc: "Personalized picks", cost: "3 Credits", color: "text-green-500" },
    { id: "tutorials" as ActiveView, icon: BookOpen, title: "Tutorials", desc: "Step-by-step guides", cost: "2 Credits", color: "text-indigo-500" },
    { id: "gallery" as ActiveView, icon: ImageIcon, title: "Before/After", desc: "Community gallery", cost: "Free", color: "text-orange-500" },
  ];

  const statItems = [
    { label: "Transformations", value: stats.transformations, icon: Sparkles },
    { label: "Matches", value: stats.styles, icon: Crown },
    { label: "Analyses", value: stats.analyses, icon: Search },
    { label: "Designs", value: stats.designs, icon: Paintbrush },
  ];

  if (activeView === "makeup") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><VirtualMakeup /><Button variant="ghost" onClick={() => setActiveView("hub")} className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button></div></div>;
  if (activeView === "hair") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><HairStyleGenerator /><Button variant="ghost" onClick={() => setActiveView("hub")} className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button></div></div>;
  if (activeView === "products") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><ProductRecommender /><Button variant="ghost" onClick={() => setActiveView("hub")} className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button></div></div>;
  if (activeView === "tutorials") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><MakeupTutorials /><Button variant="ghost" onClick={() => setActiveView("hub")} className="mt-4 gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button></div></div>;
  if (activeView === "skin-analysis") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><SkinAnalysis onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "nail-art") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><NailArtDesigner onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "celebrity-match") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><CelebrityLookMatch onBack={() => setActiveView("hub")} /></div></div>;
  if (activeView === "gallery") return <div className="min-h-screen bg-background"><Navbar /><div className="container mx-auto px-3 pt-20 pb-8"><BeautyGallery onBack={() => setActiveView("hub")} /></div></div>;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Cinematic Video Hero */}
      <div className="relative w-full h-[50vh] sm:h-[60vh] overflow-hidden bg-black">
        <video
          src={heroVideo.url}
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover brightness-[1.3] saturate-[1.2]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }}>
            <p className="text-xs sm:text-sm text-pink-400 font-semibold tracking-wider uppercase drop-shadow-md">
              ✨ AI-Powered Beauty Hub
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mt-1 drop-shadow-lg"
              style={{ 
                textShadow: "0 0 80px rgba(236,72,153,0.6), 0 4px 30px rgba(0,0,0,0.9), 0 0 120px rgba(236,72,153,0.3)",
                WebkitTextStroke: "2px rgba(236,72,153,0.6)"
              }}>
              <span className="bg-gradient-to-r from-pink-300 via-purple-400 to-rose-500 bg-clip-text text-transparent">
                Beauty Studio
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-white/80 mt-2 max-w-xl drop-shadow-md">
              AI makeup, skincare analysis, nail art & celebrity look matching
            </p>
          </motion.div>

          {/* Stats Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, type: "spring" }}
            className="grid grid-cols-4 gap-2 sm:gap-4 mt-4 max-w-2xl"
          >
            {statItems.map((s, i) => (
              <motion.div key={i} initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.4 + i * 0.1, type: "spring" }}
                className="bg-black/40 backdrop-blur-xl rounded-xl p-2 sm:p-3 border border-white/10 text-center">
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-pink-400 mx-auto mb-1" />
                <p className="text-lg sm:text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-white/60">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10">
        {/* Engagement Row */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-3 sm:gap-4 mb-8">
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl text-center border-pink-500/20">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-xl sm:text-2xl font-black">7</p>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl text-center border-purple-500/20">
            <TrendingUp className="h-6 w-6 text-primary mx-auto mb-1" />
            <p className="text-xl sm:text-2xl font-black">{stats.transformations + stats.analyses}</p>
            <p className="text-xs text-muted-foreground">Total Uses</p>
          </Card>
          <Card className="p-3 sm:p-4 bg-card/80 backdrop-blur-xl text-center border-yellow-500/20">
            <Trophy className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xl sm:text-2xl font-black">3</p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </Card>
        </motion.div>

        {/* Tools Grid */}
        <h2 className="text-2xl sm:text-3xl font-black mb-4"
          style={{ 
            textShadow: "0 0 40px rgba(236,72,153,0.4), 0 2px 15px rgba(0,0,0,0.6)",
            WebkitTextStroke: "1.5px rgba(236,72,153,0.5)"
          }}>
          <span className="bg-gradient-to-r from-pink-400 via-purple-500 to-rose-500 bg-clip-text text-transparent">
            Beauty Tools
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {tools.map((tool, i) => (
            <motion.div key={tool.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05, type: "spring" }}
              whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}>
              <Card
                className="p-4 sm:p-5 cursor-pointer bg-card/80 backdrop-blur-xl hover:border-pink-500/40 transition-all h-full"
                onClick={() => setActiveView(tool.id)}
              >
                <tool.icon className={`h-7 w-7 sm:h-8 sm:w-8 ${tool.color} mb-2`} />
                <h3 className="font-bold text-sm sm:text-base">{tool.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{tool.desc}</p>
                <span className="text-[10px] sm:text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full mt-2 inline-block">
                  {tool.cost}
                </span>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BeautyStudio;
