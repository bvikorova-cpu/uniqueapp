import { motion } from "framer-motion";
import { Shield, Sparkles, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import legalHeroVideo from "@/assets/legal-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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
    <>
      <FloatingHowItWorks title={"Legal Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Legal Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Legal Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative min-h-[420px] sm:min-h-[480px] md:h-[60vh] w-full overflow-hidden rounded-3xl border border-amber-400/20 mb-8">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline>
        <source src={legalHeroVideo.url} type="video/mp4" />
      </video>
      {/* Light overlay – video visible, text readable via text-shadow */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/20 to-black/55" />

      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-10 py-12 sm:py-14 min-h-[420px] sm:min-h-[480px] md:min-h-[60vh]">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/70 backdrop-blur-md text-amber-50 text-xs sm:text-sm font-semibold border border-amber-400/60 shadow-[0_0_30px_rgba(251,191,36,0.35)]">
            <Shield className="w-4 h-4 text-amber-300" /> {badge} <Sparkles className="w-4 h-4 text-amber-300" />
          </span>
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-4 bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 bg-clip-text text-transparent drop-shadow-[0_4px_20px_rgba(0,0,0,0.9)]"
          style={{ WebkitTextStroke: "1px rgba(0,0,0,0.3)" }}
        >
          {title}
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-white max-w-3xl mx-auto font-medium"
          style={{ textShadow: "0 2px 12px rgba(0,0,0,0.95), 0 0 30px rgba(0,0,0,0.7)" }}>
          {subtitle}
        </motion.p>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          className="mt-3 text-xs sm:text-sm text-amber-200 font-semibold"
          style={{ textShadow: "0 2px 8px rgba(0,0,0,0.9)" }}>
          Effective Date: {effectiveDate}
        </motion.p>
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
    </>
  );
};
