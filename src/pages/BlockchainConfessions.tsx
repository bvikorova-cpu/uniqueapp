import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scale, Users, TrendingUp, Flame, Shield, Lock, Award, Loader2,
  Play, Pause, Volume2, VolumeX, Trophy, Target, ArrowLeft,
  MessageSquare, Send, BarChart3, Brain, BookOpen, Eye, Heart,
  Gavel, ScrollText, Sparkles, UserCheck, PenLine, Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLiveStats } from "@/hooks/useLiveStats";
import { useSearchParams } from "react-router-dom";

import { ConfessionWall } from "@/components/confessions/ConfessionWall";
import { PostConfession } from "@/components/confessions/PostConfession";
import { RedemptionDashboard } from "@/components/confessions/RedemptionDashboard";
import { ConfessionAnalytics } from "@/components/confessions/ConfessionAnalytics";
import { AISpiritualAdvisor } from "@/components/confessions/AISpiritualAdvisor";
import { CommunityLeaderboard } from "@/components/confessions/CommunityLeaderboard";
import { ConfessionJournal } from "@/components/confessions/ConfessionJournal";
import { AbsolutionCeremony } from "@/components/confessions/AbsolutionCeremony";
import { SinPatternAnalyzer } from "@/components/confessions/SinPatternAnalyzer";
import { VoiceConfessions } from "@/components/confessions/VoiceConfessions";
import { KarmaScoreSystem } from "@/components/confessions/KarmaScoreSystem";
import { SinHeatmap } from "@/components/confessions/SinHeatmap";
import { ConfessionRooms } from "@/components/confessions/ConfessionRooms";
import heroPoster from "@/assets/confessions-hero-poster.jpg";
// @ts-ignore
import heroVideoAsset from "/public/videos/confessions-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type ToolView = "hub" | "wall" | "post" | "redemption" | "analytics" |
  "advisor" | "leaderboard" | "journal" | "ceremony" | "sin-patterns" |
  "voice" | "karma" | "heatmap" | "rooms";

const tools: { id: ToolView; label: string; icon: any; color: string; desc: string }[] = [
  { id: "wall", label: "Confession Wall", icon: ScrollText, color: "from-slate-500 to-gray-600", desc: "Browse and vote on anonymous community confessions" },
  { id: "post", label: "Post Confession", icon: PenLine, color: "from-violet-500 to-purple-600", desc: "Share your confession anonymously with AI analysis" },
  { id: "voice", label: "Voice Confessions", icon: Send, color: "from-pink-500 to-rose-600", desc: "Record voice confessions with AI emotional analysis" },
  { id: "rooms", label: "Confession Rooms", icon: MessageSquare, color: "from-teal-500 to-cyan-600", desc: "Anonymous real-time chat rooms for group confessions" },
  { id: "redemption", label: "Redemption Path", icon: TrendingUp, color: "from-emerald-500 to-green-600", desc: "Track your redemption progress with AI coaching" },
  { id: "analytics", label: "Confession Analytics", icon: BarChart3, color: "from-cyan-500 to-blue-600", desc: "Deep data analysis of community confession patterns" },
  { id: "heatmap", label: "Sin Heatmap", icon: Flame, color: "from-orange-500 to-red-600", desc: "Community-wide sin category visualization and trends" },
  { id: "karma", label: "Karma Score", icon: Zap, color: "from-amber-500 to-yellow-600", desc: "XP, levels, badges and gamified spiritual progress" },
  { id: "advisor", label: "AI Spiritual Advisor", icon: Brain, color: "from-amber-500 to-orange-600", desc: "AI-powered spiritual guidance and counseling chat" },
  { id: "leaderboard", label: "Community Leaderboard", icon: Trophy, color: "from-yellow-500 to-amber-600", desc: "Top contributors and most active community members" },
  { id: "journal", label: "Confession Journal", icon: BookOpen, color: "from-pink-500 to-rose-600", desc: "Private journal for spiritual reflections and growth" },
  { id: "ceremony", label: "Absolution Ceremony", icon: Sparkles, color: "from-indigo-500 to-violet-600", desc: "Guided absolution rituals for spiritual cleansing" },
  { id: "sin-patterns", label: "Sin Pattern Analyzer", icon: Eye, color: "from-red-500 to-rose-600", desc: "AI analysis of recurring patterns and root causes" },
];

const BlockchainConfessions = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ToolView>("hub");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [searchParams] = useSearchParams();
  const videoRef = useRef<HTMLVideoElement>(null);

  const stats = useLiveStats([
    { key: "confessions", table: "confessions" },
    { key: "votes", table: "absolution_votes" },
    { key: "users", table: "profiles" },
  ]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const streakDays = days.map((d, i) => ({ day: d, active: i <= (today === 0 ? 6 : today - 1) }));

  useEffect(() => {
    const payment = searchParams.get("payment");
    const sessionId = searchParams.get("session_id");
    const view = searchParams.get("view") as ToolView | null;
    if (view && tools.some(t => t.id === view)) setActiveView(view);
    if (payment === "success" && sessionId) verifyPayment(sessionId);
    else if (payment === "canceled") toast({ title: "Payment Canceled", description: "No charges were made.", variant: "destructive" });
  }, [searchParams]);


  const verifyPayment = async (sessionId: string) => {
    setVerifyingPayment(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data, error } = await supabase.functions.invoke("verify-confession-payment", { body: { sessionId } });
      if (error) throw error;
      if (data.success) {
        toast({ title: "Payment Successful!", description: `${data.serviceType} activated.` });
        setTimeout(() => window.history.replaceState({}, '', '/blockchain-confessions'), 2000);
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
      const { data, error } = await supabase.functions.invoke('create-confession-checkout', { body: { serviceType } });
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
      case "wall": return <ConfessionWall />;
      case "post": return <PostConfession />;
      case "redemption": return <RedemptionDashboard />;
      case "analytics": return <ConfessionAnalytics />;
      case "advisor": return <AISpiritualAdvisor />;
      case "leaderboard": return <CommunityLeaderboard />;
      case "journal": return <ConfessionJournal />;
      case "ceremony": return <AbsolutionCeremony />;
      case "sin-patterns": return <SinPatternAnalyzer />;
      case "voice": return <VoiceConfessions />;
      case "karma": return <KarmaScoreSystem />;
      case "heatmap": return <SinHeatmap />;
      case "rooms": return <ConfessionRooms />;
      default: return null;
    }
  };

  if (verifyingPayment) {
    return (
      
    <>
      <FloatingHowItWorks title="Blockchain Confessions" steps={[{ title: "Write a confession", desc: "Anonymous, immutable, time-stamped on-chain." }, { title: "Choose absolution", desc: "Community rituals or AI spiritual advisor respond." }, { title: "Watch redemption", desc: "Track your Redemption Dashboard score." }, { title: "Stay anonymous", desc: "No one sees your identity \u2014 only the confession." }]} />
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md p-12 text-center border-primary/30 bg-card/80 backdrop-blur-xl">
          <Scale className="h-16 w-16 mx-auto text-primary animate-pulse" />
          <h2 className="text-2xl font-black mt-4">Verifying Payment...</h2>
          <p className="text-muted-foreground mt-2">Activating your services</p>
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary mt-4" />
        </Card>
      </div>
    </>
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
              <ArrowLeft className="h-4 w-4" /> Back to Confessions Hub
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
                <Badge className="bg-purple-900/60 text-purple-100 border-purple-400/30 mb-4 backdrop-blur-sm">
                  <Shield className="w-3 h-3 mr-1" /> Anonymous Confession Platform
                </Badge>
                <h1 
                  className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 text-purple-200"
                  style={{ 
                    WebkitTextStroke: '1.5px rgba(88, 28, 135, 0.9)',
                    textShadow: '0 0 20px rgba(139, 92, 246, 0.8), 0 0 40px rgba(139, 92, 246, 0.4), 0 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  Blockchain Confessions
                </h1>
                <p className="text-sm sm:text-lg text-purple-100 max-w-2xl mb-6 drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]">
                  The world's first anonymous confession and redemption platform.
                  Share your burdens, seek community absolution, and track your spiritual journey.
                </p>

                {/* Glassmorphic Stats */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Confessions", value: stats["confessions"], icon: ScrollText },
                    { label: "Votes Cast", value: stats["votes"], icon: Gavel },
                    { label: "Members", value: stats["users"], icon: Users },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900/40 backdrop-blur-xl border border-purple-400/30">
                      <s.icon className="w-4 h-4 text-purple-300" />
                      <span className="font-black text-sm text-white">{s.value || "—"}</span>
                      <span className="text-xs text-purple-200">{s.label}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-5xl space-y-8 py-8">
        {/* 3-Column Engagement Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Streak */}
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-black text-sm">Confession Streak</span>
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
              <span className="font-black text-sm">Redemption Progress</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Confessions Made", pct: 40 },
                { label: "Karma Balance", pct: 60 },
                { label: "Community Trust", pct: 25 },
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
              {[Scale, Award, Heart, Shield, BookOpen, Eye, UserCheck, Sparkles].map((Icon, i) => (
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
          <h2 className="text-xl font-black mb-3 text-primary">What is Blockchain Confessions?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Blockchain Confessions is a revolutionary anonymous confession and redemption platform.
            Share your burdens anonymously, receive community absolution through voting, and track your
            spiritual journey with AI-powered guidance. All confessions are securely stored with complete privacy.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            {["Anonymous confessions", "Community voting", "AI sin analysis", "Redemption tracking", "Spiritual counseling", "Absolution ceremonies"].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 italic">
            Disclaimer: This platform is for entertainment and community support purposes only.
            It does not replace professional psychological, religious, or spiritual counseling services.
          </p>
        </Card>

        {/* 9-Tool Grid */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Explore Confession Tools
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
            Premium Confession Services
          </h2>
          <PricingCards handlePurchase={handlePurchase} loading={loading} />
        </div>
      </div>
    </div>
  );
};

const PricingCards = ({ handlePurchase, loading }: { handlePurchase: (id: string) => void; loading: string | null }) => {
  const services = [
    { id: "absolution_tokens", title: "Absolution Tokens", price: "€5", type: "token pack", icon: Award, features: ["10 Absolution Tokens", "Community voting rights", "Instant forgiveness validation", "Blockchain-verified redemption"], highlighted: false },
    { id: "sin_collection", title: "Sin Collection Premium", price: "€24", type: "/month", icon: Scale, features: ["Unlimited confession storage", "AI severity assessment", "Sin categorization system", "Advanced analytics dashboard"], highlighted: true },
    { id: "redemption_path", title: "Redemption Path", price: "€49", type: "one-time", icon: TrendingUp, features: ["Custom redemption roadmap", "AI spiritual counseling", "Community support group", "Certificate of redemption"], highlighted: false },
    { id: "purgatory_mode", title: "Purgatory Mode", price: "€39", type: "/month", icon: Flame, features: ["Real-time judgment system", "Accelerated absolution path", "Public confession display", "Redemption multiplier boost"], highlighted: true },
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

export default BlockchainConfessions;
