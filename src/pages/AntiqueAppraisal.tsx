import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Search, Shield, BookOpen, TrendingUp, Wrench, Upload, 
  ArrowLeft, Flame, Trophy, Crown, Eye, Map, BarChart3, Package,
  ExternalLink, Coins, History as HistoryIcon, Layers, Users, Bell,
  Award, Camera, MessageSquare
} from "lucide-react";
import { useAntiqueCredits } from "@/hooks/useAntiqueCredits";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/Navbar";
import heroVideo from "@/assets/antique-hero.mp4.asset.json";
import { AntiqueAnalyze } from "@/components/antiques/AntiqueAnalyze";
import { AntiqueCollection } from "@/components/antiques/AntiqueCollection";
import { AntiqueCreditsShop } from "@/components/antiques/AntiqueCreditsShop";
import { ProvenanceTracker } from "@/components/antiques/ProvenanceTracker";
import { ForgeryDetection } from "@/components/antiques/ForgeryDetection";
import { MarketValueTrends } from "@/components/antiques/MarketValueTrends";
import { ARMuseumDisplay } from "@/components/antiques/ARMuseumDisplay";
import { AntiqueBatchAppraisal } from "@/components/antiques/AntiqueBatchAppraisal";
import { AntiqueSocialFeed } from "@/components/antiques/AntiqueSocialFeed";
import { AntiquePriceAlert } from "@/components/antiques/AntiquePriceAlert";
import { AntiqueCertificate } from "@/components/antiques/AntiqueCertificate";
import { AntiqueARTryInRoom } from "@/components/antiques/AntiqueARTryInRoom";
import { AntiqueExpertMarketplace } from "@/components/antiques/AntiqueExpertMarketplace";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ActiveView = "hub" | "analyze" | "collection" | "credits" | "provenance" | "forgery" | "market-trends" | "ar-museum" | "batch" | "social" | "price-alert" | "certificate" | "ar-room" | "expert-marketplace";

const AntiqueAppraisal = () => {
  const [activeView, setActiveView] = useState<ActiveView>("hub");
  const [stats, setStats] = useState({ appraisals: 0, collections: 0, authenticity: 0, value: 0 });
  const { credits } = useAntiqueCredits();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');
    if (paymentStatus === 'success' && sessionId) {
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke('verify-payment', {
            body: { session_id: sessionId, product_type: 'antique_credits' },
          });
          if (error) throw error;
          if (data?.paid) {
            toast.success("Payment successful! Your credits have been added.");
          } else {
            toast.error("Payment verification pending. Please refresh in a moment.");
          }
        } catch (e: any) {
          toast.error("Could not verify payment: " + (e?.message ?? "unknown error"));
        } finally {
          window.history.replaceState({}, '', '/antique-appraisal');
        }
      })();
    } else if (paymentStatus === 'canceled') {
      toast.error("Payment was canceled.");
      window.history.replaceState({}, '', '/antique-appraisal');
    }
  }, []);

  useEffect(() => {
    const loadStats = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const [a, c] = await Promise.all([
        supabase.from("antiques").select("id", { count: "exact", head: true }).eq("user_id", user.id),
        (supabase as any).from("antique_collections").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      setStats({
        appraisals: a.count || 0,
        collections: c.count || 0,
        authenticity: Math.floor((a.count || 0) * 0.85),
        value: (a.count || 0) * 125,
      });
    };
    loadStats();
  }, []);

  const tools = [
    { id: "analyze" as ActiveView, icon: Search, title: "Basic Identification", desc: "Item, period & style", cost: "3 Credits", color: "text-blue-500" },
    { id: "analyze" as ActiveView, icon: TrendingUp, title: "Market Valuation", desc: "Current market value", cost: "10 Credits", color: "text-green-500" },
    { id: "analyze" as ActiveView, icon: Sparkles, title: "Expert Report", desc: "Full analysis & history", cost: "15 Credits", color: "text-purple-500" },
    { id: "analyze" as ActiveView, icon: Shield, title: "Authenticity Check", desc: "Verify & detect fakes", cost: "20 Credits", color: "text-red-500" },
    { id: "analyze" as ActiveView, icon: BookOpen, title: "Historical Story", desc: "AI historical narrative", cost: "3 Credits", color: "text-amber-500" },
    { id: "analyze" as ActiveView, icon: Wrench, title: "Restoration Advice", desc: "Care recommendations", cost: "3 Credits", color: "text-cyan-500" },
    { id: "provenance" as ActiveView, icon: Map, title: "Provenance Tracker", desc: "Trace ownership history", cost: "8 Credits", color: "text-emerald-500" },
    { id: "forgery" as ActiveView, icon: Eye, title: "Forgery Detection", desc: "AI deep fake analysis", cost: "10 Credits", color: "text-rose-500" },
    { id: "market-trends" as ActiveView, icon: BarChart3, title: "Market Trends", desc: "Price charts & data", cost: "5 Credits", color: "text-indigo-500" },
    { id: "ar-museum" as ActiveView, icon: Crown, title: "AR Museum Display", desc: "Virtual museum view", cost: "6 Credits", color: "text-yellow-500" },
    { id: "batch" as ActiveView, icon: Layers, title: "Batch Appraisal", desc: "Analyze multiple items", cost: "12 Credits", color: "text-teal-500" },
    { id: "social" as ActiveView, icon: MessageSquare, title: "Social Feed", desc: "Community rare finds", cost: "Free", color: "text-pink-500" },
    { id: "price-alert" as ActiveView, icon: Bell, title: "Price Alert", desc: "Market monitoring AI", cost: "5 Credits", color: "text-orange-500" },
    { id: "certificate" as ActiveView, icon: Award, title: "AI Certificate", desc: "Digital authenticity cert", cost: "15 Credits", color: "text-sky-500" },
    { id: "ar-room" as ActiveView, icon: Camera, title: "AR Try-In-Room", desc: "Visualize in your space", cost: "8 Credits", color: "text-violet-500" },
    { id: "expert-marketplace" as ActiveView, icon: Users, title: "Expert Marketplace", desc: "Connect with dealers", cost: "10 Credits", color: "text-lime-500" },
  ];

  const statItems = [
    { label: "Appraisals", value: stats.appraisals, icon: Search },
    { label: "Collections", value: stats.collections, icon: Package },
    { label: "Verified", value: stats.authenticity, icon: Shield },
    { label: "Est. Value", value: `€${stats.value}`, icon: TrendingUp },
  ];

  const viewLabels: Record<string, string> = {
    analyze: "New Analysis", collection: "My Collection", credits: "Buy Credits",
    provenance: "Provenance Tracker", forgery: "Forgery Detection",
    "market-trends": "Market Trends", "ar-museum": "AR Museum Display",
    batch: "Batch Appraisal", social: "Social Feed", "price-alert": "Price Alert",
    certificate: "AI Certificate", "ar-room": "AR Try-In-Room",
    "expert-marketplace": "Expert Marketplace",
  };

  if (activeView !== "hub") {
    return (
      <>
        <FloatingHowItWorks title="How Antique Appraisal works" steps={[
          { title: 'Explore', desc: 'Browse the learning content or tool.' },
          { title: 'Start / generate', desc: 'Take a course, quiz or AI action (2-5 credits where applicable).' },
          { title: 'Track progress', desc: 'Your XP, badges and completion are saved.' },
          { title: 'Level up', desc: 'Unlock next lessons, leaderboards and rewards.' },
        ]} />
        <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-3 sm:px-4 pt-20 pb-8 max-w-6xl">
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => setActiveView("hub")} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
              <Badge variant="outline" className="text-xs">{viewLabels[activeView]}</Badge>
            </div>
            {activeView === "analyze" && <AntiqueAnalyze />}
            {activeView === "collection" && <AntiqueCollection />}
            {activeView === "credits" && <AntiqueCreditsShop />}
            {activeView === "provenance" && <ProvenanceTracker />}
            {activeView === "forgery" && <ForgeryDetection />}
            {activeView === "market-trends" && <MarketValueTrends />}
            {activeView === "ar-museum" && <ARMuseumDisplay />}
            {activeView === "batch" && <AntiqueBatchAppraisal />}
            {activeView === "social" && <AntiqueSocialFeed />}
            {activeView === "price-alert" && <AntiquePriceAlert />}
            {activeView === "certificate" && <AntiqueCertificate />}
            {activeView === "ar-room" && <AntiqueARTryInRoom />}
            {activeView === "expert-marketplace" && <AntiqueExpertMarketplace />}
          </motion.div>
        </div>
      </div>
      </>
      );
  }

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
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: "spring" }}>
            <p className="text-xs sm:text-sm font-semibold tracking-wider uppercase text-cyan-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              🏺 AI-Powered Antique Hub
            </p>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mt-1">
              <span className="bg-gradient-to-r from-cyan-200 via-teal-300 to-emerald-300 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]">
                Antique Appraisal
              </span>
            </h1>
            <p className="text-sm sm:text-lg text-white mt-2 max-w-xl drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              AI identification, valuation, authenticity & provenance tracking
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
                <s.icon className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400 mx-auto mb-1" />
                <p className="text-lg sm:text-2xl font-black text-white">{s.value}</p>
                <p className="text-[10px] sm:text-xs text-white/60">{s.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-10 max-w-6xl">
        {/* Engagement Row — single Credits balance card (other stats live in hero overlay) */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="flex justify-center mb-8">
          <Card className="p-4 bg-card/80 backdrop-blur-xl text-center border-cyan-500/20 min-w-[200px]">
            <Flame className="h-6 w-6 text-orange-500 mx-auto mb-1" />
            <p className="text-2xl font-black">{credits?.credits_remaining || 0}</p>
            <p className="text-xs text-muted-foreground">Credits Available</p>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
          className="flex justify-center gap-3 flex-wrap mb-8">
          <Button variant="outline" className="gap-2 bg-card/60 backdrop-blur-sm border-border/50 hover:border-cyan-500/30"
            onClick={() => setActiveView("credits")}>
            <Coins className="w-4 h-4 text-cyan-500" /> Buy Credits
          </Button>
          <Button variant="outline" className="gap-2 bg-card/60 backdrop-blur-sm border-border/50 hover:border-cyan-500/30"
            onClick={() => setActiveView("collection")}>
            <HistoryIcon className="w-4 h-4 text-cyan-500" /> My Collection
          </Button>
        </motion.div>

        {/* Tools Grid */}
        <h2 className="text-2xl sm:text-3xl font-black mb-4">
          <span className="bg-gradient-to-r from-cyan-400 via-teal-500 to-emerald-500 bg-clip-text text-transparent">
            Appraisal Tools
          </span>
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {tools.map((tool, i) => (
            <motion.div key={`${tool.id}-${i}`} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 + i * 0.05, type: "spring" }}
              whileHover={{ scale: 1.04, y: -4 }} whileTap={{ scale: 0.97 }}>
              <Card
                className="p-4 sm:p-5 cursor-pointer bg-card/80 backdrop-blur-xl hover:border-cyan-500/40 transition-all h-full"
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

export default AntiqueAppraisal;
