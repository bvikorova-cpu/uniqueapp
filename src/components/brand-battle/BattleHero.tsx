import { motion, useMotionValue, useTransform } from "framer-motion";
import { Trophy, Swords, Flame, Zap, Star, Crown, Target, Shield, TrendingUp, Play, Volume2, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/brand-battle-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BattleHeroProps {
  totalVotes?: number;
  totalSponsors?: number;
}

const floatingIcons = [
  { icon: Trophy, x: "8%", y: "15%", delay: 0, size: 32 },
  { icon: Swords, x: "88%", y: "12%", delay: 0.5, size: 28 },
  { icon: Flame, x: "12%", y: "75%", delay: 1, size: 26 },
  { icon: Crown, x: "92%", y: "70%", delay: 1.5, size: 30 },
  { icon: Star, x: "45%", y: "8%", delay: 0.3, size: 24 },
  { icon: Shield, x: "78%", y: "82%", delay: 0.8, size: 26 },
  { icon: Zap, x: "25%", y: "85%", delay: 1.2, size: 28 },
  { icon: Target, x: "65%", y: "78%", delay: 0.6, size: 24 },
];

function AnimatedCounter({ value, duration = 2 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (value === 0) return;
    let start = 0;
    const step = Math.max(1, Math.floor(value / (duration * 60)));
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(start);
      }
    }, 1000 / 60);
    return (
    <>
      <FloatingHowItWorks title={"Battle Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Battle Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Battle Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
}

export const BattleHero = ({ totalVotes = 0, totalSponsors = 0 }: BattleHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-primary/20 mb-10 min-h-[420px] md:min-h-[480px]">
      {/* Video Background */}
      <video
        ref={videoRef}
        src={heroVideo.url}
        autoPlay
        loop
        muted={isMuted}
        playsInline
        onLoadedData={() => setVideoLoaded(true)}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-accent/10" />

      {/* Scan lines effect */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)" }}
      />

      {/* Floating icons */}
      {floatingIcons.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={i}
            className="absolute text-primary/20 pointer-events-none"
            style={{ left: item.x, top: item.y }}
            animate={{ y: [0, -16, 0], rotate: [0, 10, -10, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          >
            <Icon size={item.size} />
          </motion.div>
        );
      })}

      {/* Large VS watermark */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.07, 0.03] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[14rem] font-black text-primary/10 select-none leading-none tracking-tighter">VS</span>
      </motion.div>

      {/* Mute toggle */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 z-20 backdrop-blur-md bg-background/30 hover:bg-background/50 rounded-full"
        onClick={() => setIsMuted(!isMuted)}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>

      {/* Content */}
      <div className="relative z-10 text-center px-6 py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge className="bg-primary/15 text-primary border-primary/30 mb-5 text-sm px-5 py-2 backdrop-blur-md shadow-lg shadow-primary/5">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse mr-2" />
            <Swords className="h-4 w-4 mr-1.5" />
            Live Brand Battle
          </Badge>
        </motion.div>

        <motion.h1
          className="text-5xl md:text-7xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent drop-shadow-2xl"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Brand Battle Arena
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Vote for your favorite brands, compete in head-to-head matchups, and earn rewards.
        </motion.p>

        <motion.p
          className="text-sm text-primary/80 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          🏆 Top brands get premium placement • Daily prizes • Real-time leaderboard
        </motion.p>

        {/* Live stats with animated counters */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { value: totalVotes, label: "Total Votes", icon: TrendingUp, suffix: "" },
            { value: totalSponsors, label: "Active Brands", icon: Crown, suffix: "" },
            { value: 10, label: "Prize Pool", icon: Trophy, prefix: "€", suffix: "K" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              className="text-center px-6 py-4 rounded-2xl backdrop-blur-md bg-background/30 border border-primary/15 shadow-xl shadow-black/5 min-w-[120px]"
              whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary) / 0.4)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <div className="text-3xl md:text-4xl font-black text-primary">
                {stat.prefix}{stat.value === 10 ? "10" : <AnimatedCounter value={stat.value} />}{stat.suffix}
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Pulse ring indicator */}
        <motion.div
          className="flex items-center justify-center gap-2 mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="relative">
            <div className="h-3 w-3 rounded-full bg-green-500" />
            <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-500 animate-ping" />
          </div>
          <span className="text-xs text-muted-foreground">Live voting in progress</span>
        </motion.div>
      </div>
    </div>
  );
};