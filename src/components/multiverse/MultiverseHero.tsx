import { motion } from "framer-motion";
import { Infinity as InfinityIcon, Sparkles, Play, Pause, Volume2, VolumeX, Globe, Crown, Layers, Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/multiverse-hero.mp4.asset.json";
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

// Floating particle component
const CosmicParticle = ({ delay, size, x, y, duration }: { delay: number; size: number; x: string; y: string; duration: number }) => (
  <motion.div
    className="absolute rounded-full bg-violet-400/30"
    style={{ width: size, height: size, left: x, top: y }}
    initial={{ opacity: 0, scale: 0 }}
    animate={{ opacity: [0, 0.8, 0], scale: [0, 1.5, 0], y: [-20, -80] }}
    transition={{ delay, duration, repeat: Infinity, repeatDelay: duration * 0.5 }}
  />
);

export const MultiverseHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const { stats, loading } = useLiveStats([
    { key: "universes", table: "user_universes" },
    { key: "jumps", table: "reality_jumps" },
    { key: "merges", table: "timeline_merges" },
  ]);

  const heroStats = [
    { icon: Globe, label: "Universes Created", value: stats.universes || 0, suffix: "+" },
    { icon: InfinityIcon, label: "Reality Jumps", value: stats.jumps || 0, suffix: "+" },
    { icon: Layers, label: "Timeline Merges", value: stats.merges || 0, suffix: "+" },
    { icon: Crown, label: "Starting From", value: 0, suffix: "", staticLabel: "€49" },
  ] as const;

  useEffect(() => {
    if (videoRef.current) { videoRef.current.play().catch(() => setIsPlaying(false)); }
  }, []);

  const togglePlay = () => { if (!videoRef.current) return; if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); };
  const toggleMute = () => { if (!videoRef.current) return; videoRef.current.muted = !isMuted; setIsMuted(!isMuted); };

  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: i * 0.4,
    size: Math.random() * 4 + 2,
    x: `${Math.random() * 100}%`,
    y: `${Math.random() * 100}%`,
    duration: Math.random() * 3 + 2,
  }));

  return (
    <div className="relative h-[78vh] min-h-[540px] w-full overflow-hidden rounded-3xl mb-8">
      {/* Pulsating border */}
      <div className="absolute inset-0 rounded-3xl border-2 border-violet-500/40 z-10 animate-pulse" />
      <div className="absolute inset-[-1px] rounded-3xl bg-gradient-to-r from-violet-600/20 via-transparent to-cyan-500/20 z-0" />
      
      {/* Video */}
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover brightness-75 saturate-125 contrast-110" autoPlay muted loop playsInline>
        <source src={heroVideo.url} type="video/mp4" />
      </video>
      
      {/* Deep space overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-violet-950/30 to-black/80" />
      
      {/* Cosmic particles */}
      {particles.map((p, i) => <CosmicParticle key={i} {...p} />)}
      
      {/* Matrix-like rain effect */}
      <div className="absolute inset-0 opacity-10">
        {Array.from({ length: 8 }, (_, i) => (
          <motion.div
            key={i}
            className="absolute w-px bg-gradient-to-b from-transparent via-cyan-400 to-transparent"
            style={{ left: `${10 + i * 12}%`, height: '40%' }}
            initial={{ top: '-40%' }}
            animate={{ top: '140%' }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: i * 0.7, ease: "linear" }}
          />
        ))}
      </div>
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
        {/* Badge */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
          <motion.span 
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-violet-950/60 backdrop-blur-xl text-violet-200 text-sm font-semibold border border-violet-500/40"
            animate={{ boxShadow: ["0 0 15px rgba(139,92,246,0.2)", "0 0 30px rgba(139,92,246,0.4)", "0 0 15px rgba(139,92,246,0.2)"] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Zap className="w-4 h-4 text-cyan-400" /> 
            Infinite Realities · Deep Space Exploration 
            <Sparkles className="w-4 h-4 text-violet-400" />
          </motion.span>
        </motion.div>
        
        {/* Title with cosmic glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring", damping: 15 }}
          className="mx-auto mb-4 px-6 py-3 rounded-2xl border-2 border-violet-500/50 bg-black/40 backdrop-blur-xl"
          style={{ boxShadow: '0 0 40px rgba(139,92,246,0.3), inset 0 0 20px rgba(139,92,246,0.1)' }}
        >
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl font-black text-center"
            style={{
              background: 'linear-gradient(135deg, #c084fc, #22d3ee, #a78bfa, #67e8f9)',
              backgroundSize: '200% 200%',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 40px rgba(139,92,246,0.5)',
            }}
            animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
            transition={{ duration: 5, repeat: Infinity }}
          >
            Multiverse Network
          </motion.h1>
        </motion.div>
        
        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-violet-100/80 text-center mb-7 max-w-3xl mx-auto px-4 py-2 rounded-xl bg-black/30 backdrop-blur-sm"
        >
          One user, infinite versions across parallel dimensions. Explore alternate realities, clash with your other selves, and discover your ultimate destiny.
        </motion.p>
        
        {/* Stats grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto w-full">
          {heroStats.map((stat, i) => (
            <motion.div 
              key={stat.label} 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.08, type: "spring", damping: 12 }}
              whileHover={{ scale: 1.05, borderColor: 'rgba(139,92,246,0.6)' }}
              className="bg-black/50 backdrop-blur-xl rounded-xl p-3 text-center border border-violet-500/30 hover:border-violet-400/60 transition-all group"
              style={{ boxShadow: '0 0 15px rgba(139,92,246,0.1)' }}
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-4 h-4 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
                <span className="text-xl sm:text-2xl font-black text-violet-100">
                  {(stat as any).staticLabel ? (stat as any).staticLabel : loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                </span>
              </div>
              <span className="text-xs text-violet-300/70 font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
      
      {/* Video controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-md hover:bg-violet-950/70 border border-violet-500/30" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4 text-violet-200" /> : <Play className="h-4 w-4 text-violet-200" />}
        </Button>
        <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-md hover:bg-violet-950/70 border border-violet-500/30" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4 text-violet-200" /> : <Volume2 className="h-4 w-4 text-violet-200" />}
        </Button>
      </div>
    </div>
  );
};
