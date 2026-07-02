import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Users, Zap, Target, Dices, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiveStats } from "@/hooks/useLiveStats";
import lotteryHeroVideo from "@/assets/lottery-hero.mp4.asset.json";
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
    return (
    <>
      <FloatingHowItWorks title={"Lottery Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Lottery Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Lottery Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, [target]);
  return <span>{target === 0 ? "—" : `${count.toLocaleString()}${suffix}`}</span>;
};

export const LotteryHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const { stats, loading } = useLiveStats([
    { key: "generations", table: "lottery_generations" },
  ]);

  const heroStats = [
    { icon: Users, label: "Numbers Generated", value: stats.generations || 0, suffix: "+" },
    { icon: Target, label: "AI Engine", value: 0, suffix: "", staticLabel: "GPT-4" },
    { icon: TrendingUp, label: "Lotteries", value: 0, suffix: "", staticLabel: "15+" },
    { icon: Zap, label: "Analysis", value: 0, suffix: "", staticLabel: "Real-time" },
  ];

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => setIsPlaying(false));
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause(); else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };
  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative h-[78vh] min-h-[540px] w-full overflow-hidden rounded-3xl border border-amber-400/20 mb-8">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-125" autoPlay muted loop playsInline>
        <source src={lotteryHeroVideo.url} type="video/mp4" />
      </video>
      {/* Subtle vignette only — keeps video visible */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_30%,rgba(0,0,0,0.45)_100%)]" />

      <div className="relative z-10 h-full flex flex-col justify-between px-6 sm:px-10 py-8 sm:py-12">
        {/* Top: badge + title */}
        <div className="flex flex-col items-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md text-amber-50 text-sm font-semibold border border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.25)]">
              <Dices className="w-4 h-4 text-amber-300" /> AI-Powered Lottery Predictions <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black text-center mb-3 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
          >
            Lottery AI
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-amber-50/95 text-center max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Advanced ML reads decades of historical draws to surface optimized number combinations, dream-decoded picks, and personalized numerology.
          </motion.p>
        </div>

        {/* Bottom: compact stats — smaller, more transparent so video shows through */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-4 gap-2 max-w-2xl mx-auto w-full">
          {heroStats.map((stat, i) => (
            <motion.div
              key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="bg-black/35 backdrop-blur-sm rounded-lg p-2 text-center border border-amber-400/30 hover:border-amber-400/60 transition-colors"
            >
              <div className="flex items-center justify-center gap-1 mb-0.5">
                <stat.icon className="w-3 h-3 text-amber-300" />
                <span className="text-sm sm:text-lg font-black text-amber-50 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                  {(stat as any).staticLabel ? (stat as any).staticLabel : loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-amber-100/85 font-medium leading-tight block">{stat.label}</span>
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
