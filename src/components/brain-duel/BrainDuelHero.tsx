import { motion } from "framer-motion";
import { Brain, Zap, Flame, Trophy, Swords, Shield, Target, Star, Crown, Volume2, VolumeX } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import heroVideo from "@/assets/brain-duel-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BrainDuelHeroProps {
  onlineCount: number;
  userId: string | null;
  totalMatches?: number;
}

const floatingIcons = [
  { icon: Brain, x: "8%", y: "18%", delay: 0, size: 30 },
  { icon: Zap, x: "88%", y: "12%", delay: 0.5, size: 26 },
  { icon: Trophy, x: "12%", y: "72%", delay: 1, size: 24 },
  { icon: Swords, x: "85%", y: "68%", delay: 1.5, size: 28 },
  { icon: Shield, x: "50%", y: "8%", delay: 0.3, size: 22 },
  { icon: Target, x: "75%", y: "78%", delay: 0.8, size: 20 },
  { icon: Star, x: "25%", y: "80%", delay: 1.2, size: 22 },
  { icon: Crown, x: "65%", y: "15%", delay: 0.6, size: 24 },
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
    return () => clearInterval(timer);
  }, [value, duration]);
  return <>{count.toLocaleString()}</>;
}

export const BrainDuelHero = ({ onlineCount, userId, totalMatches = 0 }: BrainDuelHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

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
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay gradients */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/90" />
      <div className="absolute inset-0 bg-gradient-to-r from-violet-600/15 via-transparent to-cyan-500/15" />

      {/* Scan lines */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)" }}
      />

      {/* Animated neon border glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl pointer-events-none"
        style={{ boxShadow: "inset 0 0 60px hsl(var(--primary) / 0.1), 0 0 30px hsl(var(--primary) / 0.05)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating icons */}
      {floatingIcons.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={i}
            className="absolute text-primary/20 pointer-events-none"
            style={{ left: item.x, top: item.y }}
            animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4 + i * 0.3, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          >
            <Icon size={item.size} />
          </motion.div>
        );
      })}

      {/* Electric pulse rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="absolute inset-0 rounded-full border border-primary/10"
            style={{ width: 200 + i * 100, height: 200 + i * 100, marginLeft: -(100 + i * 50), marginTop: -(100 + i * 50) }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0, 0.1] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 1, ease: "easeOut" }}
          />
        ))}
      </div>

      {/* Mute toggle */}
      <Button
        size="icon"
        variant="ghost"
        className="absolute top-4 right-4 z-20 backdrop-blur-md bg-background/30 hover:bg-background/50 rounded-full"
        onClick={() => setIsMuted(!isMuted)}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </Button>

      <div className="relative z-10 p-8 md:p-12 text-center">
        {/* Status badges */}
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="bg-green-500/15 text-green-500 border-green-500/30 animate-pulse">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2 inline-block" />
            Live Now
          </Badge>
          <Badge variant="outline" className="backdrop-blur-sm border-primary/30">
            <Flame className="w-3 h-3 mr-1 text-orange-500" />
            {onlineCount} {onlineCount === 1 ? 'player' : 'players'} online
          </Badge>
          {totalMatches > 0 && (
            <Badge variant="outline" className="backdrop-blur-sm border-primary/30">
              <Swords className="w-3 h-3 mr-1 text-primary" />
              {totalMatches.toLocaleString()} matches played
            </Badge>
          )}
        </motion.div>

        {/* Animated Brain icon */}
        <motion.div
          className="relative inline-block mb-4"
          animate={{ rotate: [0, 3, -3, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 blur-xl bg-primary/20 rounded-full"
          />
          <Brain className="w-16 h-16 md:w-20 md:h-20 text-primary relative z-10" />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <span className="bg-gradient-to-r from-violet-400 via-primary to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            BrainDuel
          </span>
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Knowledge Battle Arena • Test Your Brain Power
        </motion.p>

        {/* Live stats with animated counters */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 md:gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {[
            { value: 10, label: "Categories", icon: Brain, display: "10+" },
            { value: 4, label: "Leagues", icon: Trophy, display: "4" },
            { value: onlineCount, label: "Online Now", icon: Flame, display: null },
            { value: 0, label: "Questions", icon: Zap, display: "∞" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              className="text-center px-5 py-3 rounded-2xl backdrop-blur-md bg-background/30 border border-primary/15 shadow-xl shadow-black/5 min-w-[100px]"
              whileHover={{ scale: 1.05, borderColor: "hsl(var(--primary) / 0.4)" }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-1.5" />
              <div className="text-2xl md:text-3xl font-black text-primary">
                {stat.display ?? <AnimatedCounter value={stat.value} />}
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
          <span className="text-xs text-muted-foreground">Live matchmaking active</span>
        </motion.div>
      </div>
    </div>
  );
};
