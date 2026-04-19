import { motion } from "framer-motion";
import { Shield, Sparkles, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import legalHeroVideo from "@/assets/legal-hero.mp4.asset.json";

interface LegalHeroProps {
  badge: string;
  title: string;
  subtitle: string;
  effectiveDate: string;
  stats?: { label: string; value: string; icon: ReactNode }[];
}

export const LegalHero = ({ badge, title, subtitle, effectiveDate, stats = [] }: LegalHeroProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

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
    <div className="relative h-[68vh] min-h-[480px] w-full overflow-hidden rounded-3xl border border-amber-400/20 mb-8">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover brightness-110" autoPlay muted loop playsInline>
        <source src={legalHeroVideo.url} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/65" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,transparent_25%,rgba(0,0,0,0.5)_100%)]" />

      <div className="relative z-10 h-full flex flex-col justify-between px-6 sm:px-10 py-8 sm:py-12">
        <div className="flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-md text-amber-50 text-xs sm:text-sm font-semibold border border-amber-400/50 shadow-[0_0_30px_rgba(251,191,36,0.25)]">
              <Shield className="w-4 h-4 text-amber-300" /> {badge} <Sparkles className="w-4 h-4 text-amber-300" />
            </span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-3 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.7)]"
          >
            {title}
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="text-sm sm:text-base md:text-lg text-amber-50/95 max-w-3xl mx-auto drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
            {subtitle}
          </motion.p>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
            className="mt-2 text-xs sm:text-sm text-amber-200/80 font-medium">
            Effective Date: {effectiveDate}
          </motion.p>
        </div>

        {stats.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-2xl mx-auto w-full">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="bg-black/40 backdrop-blur-sm rounded-lg p-2 text-center border border-amber-400/30 hover:border-amber-400/60 transition-colors"
              >
                <div className="flex items-center justify-center gap-1 mb-0.5 text-amber-300">{stat.icon}
                  <span className="text-sm sm:text-base font-black text-amber-50 drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">{stat.value}</span>
                </div>
                <span className="text-[10px] sm:text-xs text-amber-100/85 font-medium leading-tight block">{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
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
