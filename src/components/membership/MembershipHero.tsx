import { motion } from "framer-motion";
import { Crown, Users, TrendingUp, DollarSign, Sparkles, Heart, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiveStats } from "@/hooks/useLiveStats";

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

export const MembershipHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const { stats, loading } = useLiveStats([
    { key: "creators", table: "creator_profiles" },
    { key: "memberships", table: "creator_memberships" },
    { key: "content", table: "creator_exclusive_posts" },
  ]);

  const heroStats = [
    { icon: Users, label: "Active Creators", value: stats.creators || 0, suffix: "+" },
    { icon: Heart, label: "Memberships", value: stats.memberships || 0, suffix: "+" },
    { icon: TrendingUp, label: "Exclusive Posts", value: stats.content || 0, suffix: "+" },
    { icon: DollarSign, label: "Platform Fee", value: 0, suffix: "", staticLabel: "15%" },
  ];

  useEffect(() => {
    if (videoRef.current) { videoRef.current.play().catch(() => setIsPlaying(false)); }
  }, []);

  const togglePlay = () => { if (!videoRef.current) return; if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); };
  const toggleMute = () => { if (!videoRef.current) return; videoRef.current.muted = !isMuted; setIsMuted(!isMuted); };

  return (
    <div className="relative h-[78vh] min-h-[540px] w-full overflow-hidden rounded-3xl border border-border/40 mb-8">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110" autoPlay muted loop playsInline>
        <source src="/__l5e/assets-v1/f17c6c1b-77a2-41bf-b6be-baffa50439ac/membership-community-hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/30 to-background/70" />
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/45 backdrop-blur-md text-foreground text-sm font-semibold border border-border/60">
            <Crown className="w-4 h-4 text-primary" /> SFW Community-First Creator Platform <Sparkles className="w-4 h-4 text-accent" />
          </span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Membership Community
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-foreground/85 text-center mb-7 max-w-3xl mx-auto">
          Build your exclusive community, monetize your content, and connect with your most dedicated fans.
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
