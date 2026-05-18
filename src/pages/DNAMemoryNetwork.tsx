import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dna, Users, Heart, Baby, Sparkles, Shield, Award, Play, Pause,
  Volume2, VolumeX, Flame, Trophy, Target, ArrowLeft,
  Clock, GitBranch, Palette, Mic, Activity, MessageSquare
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLiveStats } from "@/hooks/useLiveStats";
import { DNAUploadSection } from "@/components/dna/DNAUploadSection";
import { AncestralMemoryViewer } from "@/components/dna/AncestralMemoryViewer";
import { GeneticDatingSection } from "@/components/dna/GeneticDatingSection";
import { DigitalOffspringChat } from "@/components/dna/DigitalOffspringChat";
import { HeritageTimeline } from "@/components/dna/HeritageTimeline";
import { DNAArtGenerator } from "@/components/dna/DNAArtGenerator";
import { AncestralVoiceSynth } from "@/components/dna/AncestralVoiceSynth";
import { GeneticHealthInsights } from "@/components/dna/GeneticHealthInsights";
import { FamilyTreeBuilder } from "@/components/dna/FamilyTreeBuilder";
import { DNACommunityForum } from "@/components/dna/DNACommunityForum";
import DnaParityPack from "@/components/dna/DnaParityPack";
import dnaHeroPoster from "@/assets/dna-hero-poster.jpg";
// @ts-ignore
import dnaHeroVideoAsset from "/public/videos/dna-hero.mp4.asset.json";

type ToolView = "hub" | "analysis" | "memories" | "dating" | "offspring" |
  "timeline" | "art" | "voice" | "health" | "family-tree" | "community";


const tools: { id: ToolView; label: string; icon: any; color: string; desc: string }[] = [
  { id: "analysis", label: "DNA Analysis", icon: Dna, color: "from-cyan-500 to-blue-600", desc: "Complete genetic sequencing & AI analysis" },
  { id: "memories", label: "Ancestral Memories", icon: Sparkles, color: "from-purple-500 to-violet-600", desc: "AI-reconstructed stories from your ancestors" },
  { id: "dating", label: "Genetic Dating", icon: Heart, color: "from-pink-500 to-rose-600", desc: "Find your DNA-compatible partner" },
  { id: "offspring", label: "Digital Offspring", icon: Baby, color: "from-amber-500 to-orange-600", desc: "Create an AI clone with your traits" },
  { id: "timeline", label: "Heritage Timeline", icon: Clock, color: "from-emerald-500 to-teal-600", desc: "Interactive timeline of your ancestral migrations" },
  { id: "art", label: "DNA Art Generator", icon: Palette, color: "from-fuchsia-500 to-pink-600", desc: "Transform your genetic profile into art" },
  { id: "voice", label: "Ancestral Voice", icon: Mic, color: "from-indigo-500 to-blue-600", desc: "Hear AI-synthesized voices of ancestors" },
  { id: "health", label: "Health Insights", icon: Activity, color: "from-green-500 to-emerald-600", desc: "AI-powered genetic health analysis" },
  { id: "family-tree", label: "Family Tree", icon: GitBranch, color: "from-lime-500 to-green-600", desc: "Build & visualize your family tree" },
  { id: "community", label: "DNA Community", icon: MessageSquare, color: "from-sky-500 to-cyan-600", desc: "Connect with genetic relatives worldwide" },
];

const DNAMemoryNetwork = () => {
  const { toast } = useToast();
  const [activeView, setActiveView] = useState<ToolView>("hub");
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const stats = useLiveStats([
    { key: "analyses", table: "dna_analyses" },
    { key: "memories", table: "ancestral_memories" },
    { key: "users", table: "profiles" },
  ]);

  // Streak (simple 7-day display)
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date().getDay();
  const streakDays = days.map((d, i) => ({ day: d, active: i <= (today === 0 ? 6 : today - 1) }));

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const renderToolView = () => {
    switch (activeView) {
      case "analysis": return <DNAUploadSection />;
      case "memories": return <AncestralMemoryViewer />;
      case "dating": return <GeneticDatingSection />;
      case "offspring": return <DigitalOffspringChat />;
      case "timeline": return <HeritageTimeline />;
      case "art": return <DNAArtGenerator />;
      case "voice": return <AncestralVoiceSynth />;
      case "health": return <GeneticHealthInsights />;
      case "family-tree": return <FamilyTreeBuilder />;
      case "community": return <DNACommunityForum />;
      default: return null;
    }
  };

  if (activeView !== "hub") {
    const tool = tools.find(t => t.id === activeView);
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-6 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Button variant="ghost" size="sm" onClick={() => setActiveView("hub")} className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" /> Back to DNA Hub
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

  return (
    <div className="min-h-screen bg-background">
      {/* Cinematic Video Hero */}
      <section className="relative overflow-hidden">
        <div className="relative w-full h-[50vh] sm:h-[55vh] min-h-[400px]">
          <video
            ref={videoRef}
            autoPlay
            muted
            loop
            playsInline
            poster={dnaHeroPoster}
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src={dnaHeroVideoAsset.url} type="video/mp4" />
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
                <Badge className="bg-primary/20 text-primary border-primary/30 mb-4 backdrop-blur-sm">
                  <Shield className="w-3 h-3 mr-1" /> Powered by Advanced AI & Genetics
                </Badge>
                <h1 className="text-3xl sm:text-5xl md:text-6xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-primary to-accent">
                  DNA Social Memory Network
                </h1>
                <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl mb-6">
                  Unlock the secrets encoded in your DNA. Connect with your ancestral past,
                  find genetically compatible partners, and create your digital legacy.
                </p>
                {/* Glassmorphic Stats */}
                <div className="flex flex-wrap gap-3">
                  {[
                    { label: "Analyses", value: stats["analyses"], icon: Dna },
                    { label: "Memories", value: stats["memories"], icon: Sparkles },
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
        {/* 3-Column Engagement Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Streak */}
          <Card className="p-4 bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <span className="font-black text-sm">Daily Streak</span>
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
              <span className="font-black text-sm">Discovery Progress</span>
            </div>
            <div className="space-y-2">
              {[
                { label: "Heritage Map", pct: 45 },
                { label: "Health Profile", pct: 20 },
                { label: "Family Tree", pct: 10 },
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
              {[Dna, Clock, Heart, Palette, GitBranch, Sparkles, Mic, Baby].map((Icon, i) => (
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
          <h2 className="text-xl font-black mb-3 text-primary">What is DNA Social Memory Network?</h2>
          <p className="text-sm text-muted-foreground mb-4">
            A revolutionary AI-powered platform combining cutting-edge genetic analysis with artificial intelligence
            to discover your ancestral heritage, find genetically compatible partners, and create a lasting digital legacy.
            Our advanced algorithms reconstruct ancestral memories and provide deep insights into your genetic makeup.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-muted-foreground">
            {["Complete genetic sequencing", "AI ancestral memories", "Photo restoration", "Voice synthesis", "Genetic matching", "Bank-level security"].map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span>{f}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mt-4 italic">
            Disclaimer: DNA Social Memory Network provides entertainment and educational insights based on genetic data analysis.
            Results are AI-generated interpretations and should not be used for medical decisions.
          </p>
        </Card>

        {/* 10-Tool Grid */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Explore Your DNA Tools
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

        {/* AI Parity Pack */}
        <DnaParityPack />

        {/* Pricing Section */}
        <div>
          <h2 className="text-xl sm:text-2xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Premium DNA Services
          </h2>
          <PricingCards />
        </div>
      </div>
    </div>
  );
};

// Separated pricing component
const PricingCards = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);

  const services = [
    { id: "dna_analysis",           title: "DNA Analysis",        price: "€99",  type: "one-time", icon: Dna,       features: ["Complete genetic sequencing", "AI ancestral memories", "Heritage insights", "Interactive family tree"], highlighted: false },
    { id: "dna_ancestral_memories", title: "Ancestral Memories",  price: "€12",  type: "/month",   icon: Sparkles,  features: ["Monthly story updates", "Photo restoration", "Voice synthesis", "Historical context"], highlighted: true },
    { id: "dna_genetic_dating",     title: "Genetic Dating",      price: "€15",  type: "/month",   icon: Heart,     features: ["DNA compatibility matching", "Health trait analysis", "Personality alignment", "Offspring predictions"], highlighted: true },
    { id: "dna_digital_offspring",  title: "Digital Offspring",   price: "€149", type: "one-time", icon: Baby,      features: ["Interactive AI personality", "Genetic trait inheritance", "Voice & appearance", "Lifetime access"], highlighted: false },
  ];

  const handlePurchase = async (productKey: string) => {
    try {
      setLoading(productKey);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({ title: "Authentication Required", description: "Please sign in to purchase", variant: "destructive" });
        return;
      }
      // Route through universal create-checkout with the per-service product key
      // so each tier is billed at its correct €/mode (one-time vs subscription).
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { product: productKey, module: 'dna_memory' },
      });
      if (error) throw error;
      if (data?.url) {
        const w = window.open(data.url, "_blank", "noopener,noreferrer");
        if (!w) window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error('DNA checkout error:', error);
      toast({ title: "Error", description: "Failed to process purchase", variant: "destructive" });
    } finally {
      setLoading(null);
    }
  };

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

export default DNAMemoryNetwork;
