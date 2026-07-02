import { motion } from "framer-motion";
import { Bot, Users, MessageCircle, Sparkles, Play, Pause, Volume2, VolumeX, Brain, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/ai-clone-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 1500; const steps = 40; const increment = target / steps; let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{target === 0 ? "—" : `${count.toLocaleString()}${suffix}`}</span>;
};

export const CloneHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const { stats, loading } = useLiveStats([
    { key: "clones", table: "personality_clones", filter: { column: "is_active", value: "true" } },
    { key: "conversations", table: "clone_conversations" },
    { key: "sessions", table: "clone_dating_sessions" },
  ]);

  const heroStats = [
    { icon: Bot, label: "Active Clones", value: stats.clones || 0, suffix: "+" },
    { icon: MessageCircle, label: "Conversations", value: stats.conversations || 0, suffix: "+" },
    { icon: Users, label: "Dating Sessions", value: stats.sessions || 0, suffix: "+" },
    { icon: Zap, label: "AI Accuracy", value: 0, suffix: "", staticLabel: "97%" },
  ];

  useEffect(() => {
    if (videoRef.current) { videoRef.current.play().catch(() => setIsPlaying(false)); }
  }, []);

  const togglePlay = () => { if (!videoRef.current) return; if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); };
  const toggleMute = () => { if (!videoRef.current) return; videoRef.current.muted = !isMuted; setIsMuted(!isMuted); };

  return (
    <div className="relative h-[78vh] min-h-[540px] w-full overflow-hidden rounded-3xl border border-border/40 mb-8">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110" autoPlay muted loop playsInline>
        <source src={heroVideo.url} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/80" />
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/45 backdrop-blur-md text-foreground text-sm font-semibold border border-border/60">
            <Brain className="w-4 h-4 text-primary" /> AI Personality Clone Network <Sparkles className="w-4 h-4 text-accent" />
          </span>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="mx-auto mb-4 px-6 py-3 rounded-2xl border-2 border-primary/60 bg-card/40 backdrop-blur-lg shadow-[0_0_30px_rgba(var(--primary),0.15)]">
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-center bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            AI Personality Clone
          </h1>
        </motion.div>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg font-semibold text-center mb-7 max-w-3xl mx-auto px-4 py-2 rounded-xl bg-card/50 backdrop-blur-md text-foreground border border-border/40">
          Create a digital copy of your personality that communicates 24/7 while you sleep or work
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto w-full">
          {heroStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="bg-card/45 backdrop-blur-md rounded-xl p-3 text-center border border-border/60">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  {(stat as any).staticLabel ? (stat as any).staticLabel : loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button variant="ghost" size="icon" className="bg-card/50 backdrop-blur-md hover:bg-card/70 border border-border/50" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="bg-card/50 backdrop-blur-md hover:bg-card/70 border border-border/50" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
