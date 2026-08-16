import { motion } from "framer-motion";
import { Plane, Sparkles, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/vacationer-hero.mp4.asset.json";
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

export const VacationerHero = () => {
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
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover brightness-125 saturate-[1.7] contrast-125 sepia-[0.15]" autoPlay muted loop playsInline>
        <source src={heroVideo.url} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-gold/30 via-gold/40 to-background/80" />
      <div className="absolute inset-0 bg-gradient-to-tr from-gold/25 via-transparent to-gold/15" />
      <div className="absolute inset-0 bg-gold/10 mix-blend-overlay" />
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/45 backdrop-blur-md text-foreground text-sm font-semibold border border-border/60">
            <Plane className="w-4 h-4 text-gold" /> Travel & Adventure Platform <Sparkles className="w-4 h-4 text-gold" />
          </span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-3"
          style={ {
            WebkitTextStroke: "1.5px rgba(0,0,0,0.45)",
            textShadow: "0 0 40px hsl(var(--gold) / 0.85), 0 0 80px hsl(var(--gold) / 0.65), 0 0 120px hsl(var(--gold) / 0.45), 0 0 180px hsl(var(--gold) / 0.25), 0 2px 6px rgba(0,0,0,0.6)",
            background: "var(--gradient-gold)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent" }}>
          Vacationer
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-center mb-7 max-w-3xl mx-auto font-semibold"
          style={{ textShadow: "0 1px 10px rgba(0,0,0,0.7), 0 0 30px hsl(var(--gold) / 0.5)", color: "hsl(var(--gold))" }}>
          Discover breathtaking destinations, share travel stories, and plan your dream adventures with AI-powered tools.
        </motion.p>
      </div>
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button variant="ghost" size="icon" className="bg-card/30 backdrop-blur-sm hover:bg-card/50 text-foreground" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="bg-card/30 backdrop-blur-sm hover:bg-card/50 text-foreground" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
