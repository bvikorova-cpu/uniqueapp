import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles, Heart, Crown, Eye, Infinity as InfinityIcon, Star, Globe, Shield,
  Play, Pause, Volume2, VolumeX, Flame, Trophy, Target, ArrowLeft,
  MapPin, BookOpen, Users, Timer, MessageSquare, Loader2,
  Headphones, Paintbrush, BarChart3, Link2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLiveStats } from "@/hooks/useLiveStats";
import { useSearchParams } from "react-router-dom";

import { PastLifeRegressionSection } from "@/components/reincarnation/PastLifeRegressionSection";
import { KarmicDebtTracker } from "@/components/reincarnation/KarmicDebtTracker";
import { SoulmateMatchingSection } from "@/components/reincarnation/SoulmateMatchingSection";
import { ReincarnationPlanSection } from "@/components/reincarnation/ReincarnationPlanSection";
import { SoulJourneyMap } from "@/components/reincarnation/SoulJourneyMap";
import { AkashicRecords } from "@/components/reincarnation/AkashicRecords";
import { PastLifeGallery } from "@/components/reincarnation/PastLifeGallery";
import { SpiritualCommunity } from "@/components/reincarnation/SpiritualCommunity";
import { LifeLessonJournal } from "@/components/reincarnation/LifeLessonJournal";
import { MeditationChamber } from "@/components/reincarnation/MeditationChamber";
import { PastLifeAudioStories } from "@/components/reincarnation/PastLifeAudioStories";
import { SoulArtGenerator } from "@/components/reincarnation/SoulArtGenerator";
import { KarmicAnalytics } from "@/components/reincarnation/KarmicAnalytics";
import { SoulGroupFinder } from "@/components/reincarnation/SoulGroupFinder";
import ReincarnationParityPack from "@/components/reincarnation/ReincarnationParityPack";
import heroPoster from "@/assets/reincarnation-hero-poster.jpg";
// @ts-ignore
import heroVideoAsset from "/public/videos/reincarnation-hero.mp4.asset.json";

type ToolView = "hub" | "regression" | "karma" | "soulmates" | "plan" |
  "journey-map" | "akashic" | "gallery" | "community" | "journal" | "meditation" |
  "audio-stories" | "soul-art" | "karmic-analytics" | "soul-groups";

const tools: { id: ToolView; label: string; icon: any; color: string; desc: string }[] = [
  { id: "regression", label: "Past Life Regression", icon: Eye, color: "from-violet-500 to-purple-600", desc: "AI-guided exploration of your previous incarnations" },
  { id: "karma", label: "Karmic Debt Tracker", icon: InfinityIcon, color: "from-amber-500 to-orange-600", desc: "Track and resolve your karmic balance across lifetimes" },
  { id: "soulmates", label: "Soulmate Matching", icon: Heart, color: "from-pink-500 to-rose-600", desc: "Find souls you've shared past lives with" },
  { id: "plan", label: "Reincarnation Plan", icon: Crown, color: "from-yellow-500 to-amber-600", desc: "Map your soul's destiny for the next incarnation" },
  { id: "journey-map", label: "Soul Journey Map", icon: MapPin, color: "from-emerald-500 to-teal-600", desc: "Visualize your soul's migration through lifetimes" },
  { id: "akashic", label: "Akashic Records", icon: BookOpen, color: "from-indigo-500 to-blue-600", desc: "Access the universal library of all souls" },
  { id: "gallery", label: "Past Life Gallery", icon: Star, color: "from-cyan-500 to-sky-600", desc: "Browse your collection of discovered past lives" },
  { id: "community", label: "Spiritual Community", icon: Users, color: "from-fuchsia-500 to-pink-600", desc: "Connect with fellow seekers on their spiritual journey" },
  { id: "journal", label: "Life Lesson Journal", icon: MessageSquare, color: "from-lime-500 to-green-600", desc: "Record insights and karmic lessons learned" },
  { id: "meditation", label: "Meditation Chamber", icon: Timer, color: "from-purple-500 to-violet-600", desc: "Guided spiritual meditations for soul awakening" },
  { id: "audio-stories", label: "Audio Stories", icon: Headphones, color: "from-rose-500 to-red-600", desc: "Listen to AI-narrated versions of your past life stories" },
  { id: "soul-art", label: "Soul Art Generator", icon: Paintbrush, color: "from-teal-500 to-emerald-600", desc: "Transform past lives into vivid artistic visions" },
  { id: "karmic-analytics", label: "Karmic Analytics", icon: BarChart3, color: "from-sky-500 to-blue-600", desc: "Deep data analysis of your spiritual journey patterns" },
  { id: "soul-groups", label: "Soul Group Finder", icon: Link2, color: "from-orange-500 to-amber-600", desc: "Discover souls who share past life connections with you" },
];

const ReincarnationSocial = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ToolView>("hub");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [searchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);

  const stats = useLiveStats([
    { key: "readings", table: "past_life_readings" },
    { key: "purchases", table: "reincarnation_purchases" },
    { key: "users", table: "profiles" },
  ]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const streakDays = days.map((d, i) => ({ day: d, active: i <= (today === 0 ? 6 : today - 1) }));

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    if (payment === "success" && sessionId) verifyPayment(sessionId);
    else if (payment === "canceled") toast({ title: "Payment Canceled", description: "No charges were made.", variant: "destructive" });
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    setVerifyingPayment(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("verify-reincarnation-payment", { body: { sessionId } });
      if (error) throw error;
      if (data.success) {
        toast({ title: "Payment Successful!", description: `Access to ${data.service_type.replace(/_/g, " ")} activated.` });
        setTimeout(() => window.history.replaceState({}, '', '/reincarnation-social'), 2000);
      }
    } catch (error: any) {
      toast({ title: "Verification Error", description: error.message, variant: "destructive" });
    } finally {
      setVerifyingPayment(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handlePurchase = async (serviceType: string) => {
    try {
      setLoading(serviceType);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast({ title: "Authentication Required", variant: "destructive" }); return; }
      const { data, error } = await supabase.functions.invoke('create-reincarnation-checkout', { body: { serviceType } });
      if (error) throw error;
      if (data?.url) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) { const __w = window.open(data.url, "_blank", "noopener,noreferrer"); if (!__w) window.location.href = data.url; } }
    } catch (error) {
      toast({ title: "Error", description: "Failed to process purchase.", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

  const renderToolView = () => {
    switch (activeView) {
      case "regression": return <PastLifeRegressionSection />;
      case "karma": return <KarmicDebtTracker />;
      case "soulmates": return <SoulmateMatchingSection />;
      case "plan": return <ReincarnationPlanSection />;
      case "journey-map": return <SoulJourneyMap />;
      case "akashic": return <AkashicRecords />;
      case "gallery": return <PastLifeGallery />;
      case "community": return <SpiritualCommunity />;
      case "journal": return <LifeLessonJournal />;
      case "meditation": return <MeditationChamber />;
      case "audio-stories": return <PastLifeAudioStories />;
      case "soul-art": return <SoulArtGenerator />;
      case "karmic-analytics": return <KarmicAnalytics />;
      case "soul-groups": return <SoulGroupFinder />;
      default: return null;
    }
  };

  if (verifyingPayment) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md p-12 text-center border-primary/30 bg-card/80 backdrop-blur-xl">
          <Sparkles className="h-16 w-16 mx-auto text-primary animate-pulse" />
          <h2 className="text-2xl font-black mt-4">Verifying Payment...</h2>
          <p className="text-muted-foreground mt-2">Activating your services</p>
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mt-4" />
        </Card>
      </div>
    );
  }

  // Tool subpage view
  if (activeView !== "hub") {
    const tool = tools.find(t => t.id === activeView);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="ghost" size="sm" onClick={() => setActiveView("hub")} className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to Reincarnation Hub
            </Button>
            <div className="flex items-center gap-3 mb-6">
              {tool && <tool.icon className="h-7 w-7 text-primary" />}
              <h2 className="text-2xl sm:text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                {tool?.label}
              </h2>
            </div>
            {renderToolView()}
          </motion.div>
        </div>
      </div>
    );
  }

  // Hub view
  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Video Hero */}
      <section className="relative overflow-hidden">
        <div className="relative w-full h-[50vh] sm:h-[55vh] min-h-[400px]">
          <video
            ref={videoRef}
            autoPlay muted loop playsInline
            poster={heroPoster}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={heroVideoAsset.url} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

          {/* Video Controls */}
          <div className="absolute top-4 right-4 flex gap-2 z-20">
            <Button size="icon" variant="ghost" onClick={togglePlay}
              className="bg-black/30 backdrop-blur-md text-white hover:bg-black/50 h-9 w-9">
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button size="icon" variant="ghost" onClick={toggleMute}
              className="bg-black/30 backdrop-blur-md text-white hover:bg-black/50 h-9 w-9">
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>

          {/* Hero Content */}
          <div className="absolute inset-0 flex items-end z-10">
            <div className="container mx-auto px-4 pb-8 max-w-5xl">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Badge className="bg-black/40 text-white border-white/20 mb-4 backdrop-blur-sm">
                  <Shield className="w-3 h-3 mr-1" /> AI-Powered Spiritual Intelligence
                </Badge>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white via-amber-200 to-yellow-300">
                  Reincarnation Social
                </h1>
                <p className="text-sm sm:text-lg text-white/80 max-w-2xl mb-6">
                  Journey through lifetimes. Discover your past lives, balance your karma,
                  and reconnect with souls through AI-powered spiritual intelligence.
                </p>

                {/* Glassmorphic Stats */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Readings", value: stats["readings"], icon: Eye },
                    { label: "Active Users", value: stats["purchases"], icon: Sparkles },
                    { label: "Members", value: stats["users"], icon: Users },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/30 backdrop-blur-xl border border-border/30">
                      <s.icon className="w-4 h-4 text-primary" />
                      <span className="font-black text-sm">{s.value || "—"}</span>
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl space-y-8 py-8">
        {/* AI Parity Pack */}
        <ReincarnationParityPack />

        {/* 3-Column Engagement Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Streak */}
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-black text-sm">Spiritual Streak</span>
            </div>
            <div className="flex gap-1.5">
              {streakDays.map((d, i) => (
                <div key={i} className="flex-1 text-center">
                  <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all
                    ${d.active ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30" : "bg-muted/30 text-muted-foreground"}`}>
                    {d.active ? "✓" : d.day[0]}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Progress */}
          <Card className="p-4 bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-purple-500" />
              <span className="font-black text-sm">Soul Progress</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Lives Discovered", pct: 30 },
                { label: "Karmic Balance", pct: 55 },
                { label: "Soul Connections", pct: 15 },
              ].map((p, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] mb-0.5">
                    <span className="text-muted-foreground">{p.label}</span>
                    <span className="font-bold">{p.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-purple-500 to-violet-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${p.pct}%` }}
                      transition={{ delay: 0.5 + i * 0.2, duration: 0.8 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-4 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border-amber-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="font-black text-sm">Achievements</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[Eye, InfinityIcon, Heart, Crown, MapPin, BookOpen, Star, Timer].map((Icon, i) => (
                <div key={i} className={`aspect-square rounded-lg flex items-center justify-center transition-all
                  ${i < 3 ? "bg-amber-500/20 shadow-inner" : "bg-muted/20 opacity-40"}`}>
                  <Icon className={`w-4 h-4 ${i < 3 ? "text-amber-500" : "text-muted-foreground"}`} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Description Card */}
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
          <h2 className="text-xl font-black mb-3 text-primary">What is Reincarnation Social?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Reincarnation Social is an AI-powered spiritual platform that helps you explore your past lives,
            understand your karmic patterns, find soulmate connections, and plan your spiritual journey.
            Using advanced AI analysis, we provide deep insights into your soul's journey across multiple lifetimes.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            {["AI past life regression", "Karmic debt tracking", "Soulmate matching", "Akashic Records access", "Guided meditations", "Community forum"].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 italic">
            Disclaimer: This service is for entertainment and spiritual exploration purposes only.
            Past life readings are AI-generated interpretations and should not replace professional advice.
          </p>
        </Card>

        {/* 10-Tool Grid */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Explore Your Spiritual Tools
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <Card
                  className="p-4 cursor-pointer bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10 transition-all group h-full"
                  onClick={() => setActiveView(tool.id)}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
                    <tool.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-bold text-xs sm:text-sm mb-1">{tool.label}</h3>
                  <p className="text-[10px] text-muted-foreground line-clamp-2">{tool.desc}</p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Pricing Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Premium Spiritual Services
          </h2>
          <PricingCards handlePurchase={handlePurchase} loading={loading} />
        </div>
      </div>
    </div>
  );
};

const PricingCards = ({ handlePurchase, loading }: { handlePurchase: (id: string) => void; loading: string | null }) => {
  const services = [
    { id: "past_life_regression", title: "Past Life Regression", price: "€79", type: "one-time", icon: Eye, features: ["AI-guided past life exploration", "Detailed regression reports", "Historical context", "Soul pattern recognition"], highlighted: false },
    { id: "karmic_debt_calculator", title: "Karmic Debt Calculator", price: "€19", type: "/month", icon: InfinityIcon, features: ["Real-time karma tracking", "Debt resolution guidance", "Daily karmic insights", "Spiritual balance reports"], highlighted: true },
    { id: "soulmate_matching", title: "Soulmate Matching", price: "€29", type: "/month", icon: Heart, features: ["Cross-lifetime soul matching", "Past relationship detection", "Soul contract insights", "Reunion probability"], highlighted: true },
    { id: "reincarnation_guarantee", title: "Reincarnation Guarantee™", price: "€199", type: "one-time", icon: Crown, features: ["Personalized reincarnation plan", "Soul preservation protocol", "Next life destiny mapping", "Lifetime spiritual support"], highlighted: false },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {services.map((s) => (
        <Card key={s.id} className={`p-5 bg-card/80 backdrop-blur-xl border-border/50 hover:shadow-xl transition-all relative ${s.highlighted ? "border-primary/40 shadow-lg shadow-primary/10" : ""}`}>
          {s.highlighted && (
            <Badge className="absolute -top-2 right-3 bg-primary text-primary-foreground text-[10px]">POPULAR</Badge>
          )}
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
            <s.icon className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-black text-lg mb-1">{s.title}</h3>
          <div className="flex items-baseline gap-1 mb-3">
            <span className="text-2xl font-black text-primary">{s.price}</span>
            <span className="text-xs text-muted-foreground">{s.type}</span>
          </div>
          <ul className="space-y-1.5 mb-4">
            {s.features.map((f, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
                <div className="w-1 h-1 rounded-full bg-primary" /> {f}
              </li>
            ))}
          </ul>
          <Button
            onClick={() => handlePurchase(s.id)}
            disabled={loading === s.id}
            className="w-full"
            variant={s.highlighted ? "default" : "outline"}
            size="sm"
          >
            {loading === s.id ? "Processing..." : "Get Started"}
          </Button>
        </Card>
      ))}
    </div>
  );
};

export default ReincarnationSocial;
