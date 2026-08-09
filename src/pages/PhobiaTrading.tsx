import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Shield, Zap, ArrowLeft, Check, Users, Eye,
  Bot, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

import PhobiaDetector from "@/components/phobia/PhobiaDetector";

import { AITherapistChat } from "@/components/phobia/AITherapistChat";
import { ExposureSimulator } from "@/components/phobia/ExposureSimulator";

import phobiaPoster from "@/assets/phobia-hero-poster.jpg";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type ToolView = "hub" | "detect" | "therapist" | "exposure";

const tools = [
  { id: "detect" as ToolView, title: "AI Phobia Detector", description: "Identify your specific fears with AI analysis", icon: Brain, badge: "AI", credits: 3, gradient: "bg-gradient-to-r from-cyan-500 to-blue-500", features: ["Behavioral analysis", "Clinical accuracy", "Trigger identification"] },
  { id: "therapist" as ToolView, title: "AI Fear Therapist", description: "Chat with an AI specialized in phobias", icon: Bot, badge: "AI Chat", credits: 3, gradient: "bg-gradient-to-r from-cyan-500 to-teal-500", features: ["CBT techniques", "24/7 support", "Coping strategies"] },
  { id: "exposure" as ToolView, title: "Exposure Simulator", description: "Guided exposure therapy sessions", icon: Eye, badge: "Therapy", credits: 2, gradient: "bg-gradient-to-r from-teal-500 to-green-500", features: ["5-level system", "6 scenarios", "Safe environment"] },
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
        (supabase as any).from("profiles_public").select("*", { count: "exact", head: true }),
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
    if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const renderToolView = () => {
    switch (activeView) {
      case "detect": return <PhobiaDetector onPhobiaDetected={() => showToast({ title: "Phobia Detected", description: "Saved to your profile" })} />;
      case "therapist": return <AITherapistChat />;
      case "exposure": return <ExposureSimulator />;
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
    <>
      <FloatingHowItWorks title="How Phobia Network works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
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
              style={ {
                WebkitTextStroke: "1px rgba(6, 182, 212, 0.6)",
                textShadow: "0 0 30px rgba(6, 182, 212, 0.5), 0 0 60px rgba(6, 182, 212, 0.3), 0 2px 4px rgba(0,0,0,0.8)" }}
            >
              Phobia Network
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="text-sm sm:text-lg text-cyan-100/80 max-w-2xl mx-auto mb-6"
              style={{ textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}>
              AI-powered fear management: detect your phobia, talk it through with an AI fear therapist, and face it safely in guided exposure.
            </motion.p>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="flex flex-wrap justify-center gap-4">
              {[
                { icon: Brain, label: "Phobias Tracked", value: stats.phobias },
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


            <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
              <h2 className="text-xl font-black mb-3 text-primary">What is Phobia Network?</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Phobia Network is an AI-powered platform for detecting, understanding and overcoming your fears.
                Using advanced AI analysis and evidence-based therapeutic techniques, we help you identify your phobias,
                talk them through with an AI fear therapist, and face them step by step in a safe guided exposure simulator.
              </p>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                  { step: "1", title: "Detect", desc: "AI identifies your fears" },
                  { step: "2", title: "Talk", desc: "AI fear therapist sessions" },
                  { step: "3", title: "Overcome", desc: "Guided exposure simulator" },
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
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant="secondary" className="text-[10px]">{tool.badge}</Badge>
                            {tool.credits > 0 ? (
                              <Badge className="bg-primary/15 text-primary border border-primary/30 text-[10px] font-bold gap-1">
                                <Zap className="h-2.5 w-2.5" />{tool.credits} cr
                              </Badge>
                            ) : tool.credits === 0 ? (
                              <Badge variant="outline" className="text-[10px] font-bold border-green-500/40 text-green-600">Free</Badge>
                            ) : null}
                          </div>
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

          </div>
        )}
      </div>
    </div>
    </>
    );
};

export default PhobiaTrading;
