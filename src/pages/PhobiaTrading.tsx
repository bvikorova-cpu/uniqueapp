import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
  Brain, ShoppingCart, HeartPulse, TrendingUp, Shield, Zap, ArrowLeft,
  Flame, Trophy, Check, BarChart3, BookOpen, Users, Eye, Activity,
  Bot, MessageCircle, Star, Play, Pause, Volume2, VolumeX, ArrowRightLeft, CreditCard,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import PhobiaDetector from "@/components/phobia/PhobiaDetector";
import PhobiaMarketplace from "@/components/phobia/PhobiaMarketplace";
import PhobiaCureDashboard from "@/components/phobia/PhobiaCureDashboard";
import MyPhobias from "@/components/phobia/MyPhobias";

import { FearJournal } from "@/components/phobia/FearJournal";
import { FearAnalytics } from "@/components/phobia/FearAnalytics";
import { AITherapistChat } from "@/components/phobia/AITherapistChat";
import { ExposureSimulator } from "@/components/phobia/ExposureSimulator";
import { PhobiaCommunity } from "@/components/phobia/PhobiaCommunity";
import { AnxietyTracker } from "@/components/phobia/AnxietyTracker";
import { PhobiaPricing } from "@/components/phobia/PhobiaPricing";

import phobiaPoster from "@/assets/phobia-hero-poster.jpg";
import { toast } from "sonner";

type ToolView = "hub" | "detect" | "my-phobias" | "marketplace" | "cure" | "journal" | "analytics" | "therapist" | "exposure" | "community" | "anxiety" | "pricing";

const tools = [
  { id: "detect" as ToolView, title: "AI Phobia Detector", description: "Identify your specific fears with AI analysis", icon: Brain, badge: "AI", gradient: "bg-gradient-to-r from-cyan-500 to-blue-500", features: ["Behavioral analysis", "Clinical accuracy", "Trigger identification"] },
  { id: "my-phobias" as ToolView, title: "My Phobias", description: "View and manage your fear collection", icon: Star, badge: "Collection", gradient: "bg-gradient-to-r from-blue-500 to-purple-500", features: ["Track severity", "List for trade", "Progress insights"] },
  { id: "marketplace" as ToolView, title: "Fear Marketplace", description: "Trade phobias with the global community", icon: ShoppingCart, badge: "Trading", gradient: "bg-gradient-to-r from-purple-500 to-pink-500", features: ["Buy & sell fears", "AI pricing", "Secure transactions"] },
  { id: "cure" as ToolView, title: "Cure Dashboard", description: "AI-powered personalized treatment plans", icon: HeartPulse, badge: "Premium", gradient: "bg-gradient-to-r from-pink-500 to-red-500", features: ["Personalized plans", "Session tracking", "Evidence-based"] },
  { id: "therapist" as ToolView, title: "AI Fear Therapist", description: "Chat with an AI specialized in phobias", icon: Bot, badge: "AI Chat", gradient: "bg-gradient-to-r from-cyan-500 to-teal-500", features: ["CBT techniques", "24/7 support", "Coping strategies"] },
  { id: "exposure" as ToolView, title: "Exposure Simulator", description: "Guided exposure therapy sessions", icon: Eye, badge: "Therapy", gradient: "bg-gradient-to-r from-teal-500 to-green-500", features: ["5-level system", "6 scenarios", "Safe environment"] },
  { id: "journal" as ToolView, title: "Fear Journal", description: "Track your fear encounters and progress", icon: BookOpen, badge: "Tracking", gradient: "bg-gradient-to-r from-green-500 to-cyan-500", features: ["Log triggers", "Track intensity", "Coping review"] },
  { id: "analytics" as ToolView, title: "Fear Analytics", description: "Visualize your fear patterns and trends", icon: BarChart3, badge: "Insights", gradient: "bg-gradient-to-r from-indigo-500 to-blue-500", features: ["Trend charts", "Phobia distribution", "Activity stats"] },
  { id: "community" as ToolView, title: "Support Community", description: "Connect with others facing similar fears", icon: Users, badge: "Social", gradient: "bg-gradient-to-r from-amber-500 to-orange-500", features: ["Share stories", "Ask questions", "Offer support"] },
  { id: "anxiety" as ToolView, title: "Anxiety Tracker", description: "Log anxiety episodes and grounding exercises", icon: Activity, badge: "Wellness", gradient: "bg-gradient-to-r from-red-500 to-pink-500", features: ["Symptom logging", "5-4-3-2-1 grounding", "Episode history"] },
  { id: "pricing" as ToolView, title: "Credits & Premium", description: "Purchase credits or subscribe for unlimited access", icon: CreditCard, badge: "Pricing", gradient: "bg-gradient-to-r from-emerald-500 to-teal-500", features: ["Credit packages", "Monthly subscription", "Unlimited tools"] },
];

const PhobiaTrading = () => {
  const { toast: showToast } = useToast();
  const [activeView, setActiveView] = useState<ToolView>("hub");
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const [stats, setStats] = useState({ phobias: 0, trades: 0, members: 0 });

  useEffect(() => {
    checkAuth();
    loadStats();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      if (!session) window.location.href = "/auth";
    } catch (e) { console.error(e); }
    finally { setCheckingAuth(false); }
  };

  const loadStats = async () => {
    try {
      const [{ count: c1 }, { count: c2 }] = await Promise.all([
        supabase.from("ai_generated_content").select("*", { count: "exact", head: true }).like("title", "fear_journal_%"),
        supabase.from("profiles_public" as any).select("*", { count: "exact", head: true }),
      ]);
      setStats({ phobias: c1 || 0, trades: 0, members: c2 || 0 });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId && searchParams.get("payment") === "success") {
      supabase.functions.invoke("verify-phobia-payment", { body: { sessionId } }).then(({ data }) => {
        if (data?.success) {
          showToast({ title: "Payment Successful", description: `Access to ${data.serviceType} activated!` });
          window.history.replaceState({}, "", "/phobia-trading");
        }
      });
    }
  }, [searchParams]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    isPlaying ? videoRef.current.pause() : videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const renderToolView = () => {
    switch (activeView) {
      case "detect": return <PhobiaDetector onPhobiaDetected={() => showToast({ title: "Phobia Detected", description: "Saved to your profile" })} />;
      case "my-phobias": return <MyPhobias onPhobiaListed={() => showToast({ title: "Phobia Listed", description: "Check the Marketplace" })} />;
      case "marketplace": return <PhobiaMarketplace />;
      case "cure": return <PhobiaCureDashboard />;
      case "journal": return <FearJournal />;
      case "analytics": return <FearAnalytics />;
      case "therapist": return <AITherapistChat />;
      case "exposure": return <ExposureSimulator />;
      case "community": return <PhobiaCommunity />;
      case "anxiety": return <AnxietyTracker />;
      case "pricing": return <PhobiaPricing />;
      default: return null;
    }
  };

  if (checkingAuth || !user) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Brain className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const days = ["M", "T", "W", "T", "F", "S", "S"];
  const activeDays = [true, true, false, true, true, true, false];
  const currentStreak = 5;

  const badges = [
    { icon: "🧠", label: "First Detection", unlocked: true },
    { icon: "💪", label: "Fear Fighter", unlocked: true },
    { icon: "🌟", label: "5-Star Therapist", unlocked: false },
    { icon: "🏆", label: "Fear Conqueror", unlocked: false },
    { icon: "🤝", label: "Community Hero", unlocked: true },
    { icon: "📊", label: "Data Master", unlocked: false },
  ];

  return (
    <div className="min-h-screen bg-background">
      <section className="relative h-[60vh] sm:h-[70vh] overflow-hidden">
        <video
          ref={videoRef}
          autoPlay muted loop playsInline
          poster={phobiaPoster}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/__l5e/assets-v1/d34ed69c-5f7a-4d9f-9d37-df69a26b2878/phobia-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />

        <div className="absolute top-4 right-4 flex gap-2 z-20">
          <Button size="icon" variant="ghost" onClick={togglePlay} className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white h-8 w-8">
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button size="icon" variant="ghost" onClick={() => { if (videoRef.current) { videoRef.current.muted = !isMuted; setIsMuted(!isMuted); } }} className="bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white h-8 w-8">
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </Button>
        </div>

        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="text-center px-4 max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Badge className="mb-4 bg-cyan-500/20 text-cyan-300 border-cyan-500/30 backdrop-blur-sm">
                <Shield className="h-3 w-3 mr-1" /> AI-Powered Fear Management Platform
              </Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 text-cyan-100"
              style={{
                WebkitTextStroke: "1px rgba(6, 182, 212, 0.6)",
                textShadow: "0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3), 0 2px 4px rgba(0,0,0,0.8)",
              }}
            >
              Phobia Trading Network
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-sm sm:text-lg text-cyan-100/80 max-w-2xl mx-auto mb-6"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
              The world's first AI-powered phobia detection and trading platform. Exchange fears, discover cures, and connect with others.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Brain, label: "Phobias Tracked", value: stats.phobias },
                { icon: ArrowRightLeft, label: "Trades Made", value: stats.trades },
                { icon: Users, label: "Members", value: stats.members },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-950/40 backdrop-blur-sm border border-cyan-500/20">
                  <s.icon className="h-4 w-4 text-cyan-400" />
                  <span className="text-lg font-black text-cyan-100">{s.value}</span>
                  <span className="text-xs text-cyan-300/70">{s.label}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {activeView !== "hub" ? (
          <div className="space-y-4">
            <Button variant="ghost" size="sm" onClick={() => setActiveView("hub")} className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Hub
            </Button>
            {renderToolView()}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="h-5 w-5 text-orange-500" />
                  <h3 className="font-bold text-sm">Fear Fighting Streak</h3>
                  <span className="ml-auto text-lg font-black text-primary">{currentStreak}</span>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {days.map((day, i) => (
                    <div key={i} className="text-center">
                      <span className="text-[10px] text-muted-foreground">{day}</span>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center mt-1 text-xs font-medium ${
                        activeDays[i] ? "bg-primary/20 text-primary border border-primary/30" : "bg-muted/30 text-muted-foreground"
                      }`}>
                        {activeDays[i] ? "✓" : "·"}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-sm">Recovery Progress</h3>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Fears Faced", current: 8, max: 20, color: "bg-primary" },
                    { label: "Sessions Done", current: 12, max: 30, color: "bg-accent" },
                    { label: "Coping Skills", current: 5, max: 15, color: "bg-chart-3" },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-medium">{m.current}/{m.max}</span>
                      </div>
                      <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
                        <div className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                          style={{ width: `${(m.current / m.max) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h3 className="font-bold text-sm">Achievements</h3>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {badges.filter(b => b.unlocked).length}/{badges.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {badges.map(badge => (
                    <motion.div key={badge.label} whileHover={{ scale: 1.1 }}
                      className={`flex flex-col items-center p-2 rounded-lg text-center ${
                        badge.unlocked ? "bg-primary/10 border border-primary/20" : "bg-muted/20 opacity-40"
                      }`}>
                      <span className="text-lg">{badge.icon}</span>
                      <span className="text-[9px] mt-1 text-muted-foreground leading-tight">{badge.label}</span>
                    </motion.div>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
              <h2 className="text-xl font-black mb-3 text-primary">What is Phobia Trading Network?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Phobia Trading Network is the world's first AI-powered platform for detecting, understanding, trading, and overcoming your fears.
                Using advanced machine learning algorithms and evidence-based therapeutic techniques, we help you identify your phobias,
                connect with others facing similar challenges, and provide personalized paths to recovery through AI therapy, exposure simulation, and community support.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { step: "1", title: "Detect", desc: "AI identifies your fears" },
                  { step: "2", title: "Understand", desc: "Analyze patterns & triggers" },
                  { step: "3", title: "Trade & Connect", desc: "Exchange in the marketplace" },
                  { step: "4", title: "Overcome", desc: "AI therapy & exposure" },
                ].map(s => (
                  <div key={s.step} className="text-center p-3 rounded-lg bg-muted/20 border border-border/30">
                    <div className="w-8 h-8 rounded-full bg-primary/20 text-primary font-black text-sm flex items-center justify-center mx-auto mb-2">{s.step}</div>
                    <p className="text-xs font-bold">{s.title}</p>
                    <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 rounded-lg bg-muted/10 border border-border/30">
                <p className="text-[10px] text-muted-foreground">
                  <strong>Disclaimer:</strong> This platform is for entertainment and self-improvement. It does not replace professional psychological treatment.
                  For severe anxiety or phobias, please consult a qualified mental health professional.
                </p>
              </div>
            </Card>

            <div>
              <h2 className="text-xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                Your Fear Management Tools
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {tools.map((tool, index) => (
                  <motion.div key={tool.id}
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06, duration: 0.4 }}>
                    <Card className="group relative overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 bg-card/80 backdrop-blur-xl border-border/50"
                      onClick={() => setActiveView(tool.id)}>
                      <div className={`h-1 ${tool.gradient}`} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <tool.icon className="h-5 w-5 text-primary" />
                          </div>
                          <Badge variant="secondary" className="text-[10px]">{tool.badge}</Badge>
                        </div>
                        <h3 className="font-bold text-sm mb-1">{tool.title}</h3>
                        <p className="text-xs text-muted-foreground mb-3">{tool.description}</p>
                        <ul className="space-y-1.5">
                          {tool.features.map(f => (
                            <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Check className="h-3 w-3 text-primary flex-shrink-0" />{f}
                            </li>
                          ))}
                        </ul>
                        <Button size="sm" className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => { window.location.href = `/phobia-trading?tool=${encodeURIComponent(tool.title)}`; }}>Open</Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>

            <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
              <h2 className="text-xl font-black mb-4 text-primary">💡 Tips for Future Enhancements</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { title: "🎮 VR Fear Worlds", desc: "Immersive 3D environments for exposure therapy using WebXR — walk through virtual scenarios that gradually increase in intensity." },
                  { title: "🧬 Fear DNA Analysis", desc: "Upload genetic data to discover inherited phobia predispositions and get personalized prevention strategies based on your genetics." },
                  { title: "📹 Video Fear Diary", desc: "Record video entries during anxiety episodes for AI emotion analysis — track facial expressions, voice tone, and body language over time." },
                  { title: "🏅 Fear Fighter Tournaments", desc: "Competitive exposure challenges where users earn points for facing fears — monthly leaderboards with rewards for the bravest participants." },
                  { title: "🤖 AI Dream Analyzer", desc: "Log your nightmares and recurring dreams for AI analysis — discover hidden fear patterns and subconscious anxiety triggers." },
                  { title: "👥 Live Group Therapy", desc: "Real-time video group sessions with AI moderation — connect with others facing similar phobias for mutual support and accountability." },
                ].map(tip => (
                  <div key={tip.title} className="p-4 rounded-lg bg-muted/10 border border-border/30">
                    <h4 className="font-bold text-sm mb-1">{tip.title}</h4>
                    <p className="text-xs text-muted-foreground">{tip.desc}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhobiaTrading;
