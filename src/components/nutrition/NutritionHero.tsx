import { motion } from "framer-motion";
import { Apple, Sparkles, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/nutrition-hub-hero.mp4.asset.json";
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

export const NutritionHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) { videoRef.current.play().catch(() => setIsPlaying(false)); }
  }, []);

  const togglePlay = () => { if (!videoRef.current) return; if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); };
  const toggleMute = () => { if (!videoRef.current) return; videoRef.current.muted = !isMuted; setIsMuted(!isMuted); };

  return (
    <div className="relative h-[78vh] min-h-[540px] w-full overflow-hidden rounded-3xl border border-border/40 mb-8">
      {/* Black fallback + video */}
      <div className="absolute inset-0 bg-black" />
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover brightness-[1.15] saturate-[1.1]" autoPlay muted loop playsInline>
        <source src={heroVideo.url} type="video/mp4" />
      </video>
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/60" />

      <div className="relative z-10 h-full flex flex-col justify-end pb-10 px-6 sm:px-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-white text-sm font-semibold border border-white/20 drop-shadow-md">
            <Apple className="w-4 h-4 text-green-400" /> AI Nutrition Hub <Sparkles className="w-4 h-4 text-yellow-400" />
          </span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-3 text-white drop-shadow-lg"
          style={{ WebkitTextStroke: '1.5px rgba(0,0,0,0.4)', textShadow: '0 0 40px rgba(34,197,94,0.4), 0 4px 20px rgba(0,0,0,0.5)' }}>
          Your Complete Nutrition Platform
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-white/90 text-center mb-7 max-w-3xl mx-auto drop-shadow-md">
          AI-powered meal planning, food scanning, hydration coaching, and body composition predictions.
        </motion.p>

      </div>

      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button variant="ghost" size="icon" className="bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/20 text-white" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="bg-black/40 backdrop-blur-md hover:bg-black/60 border border-white/20 text-white" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
