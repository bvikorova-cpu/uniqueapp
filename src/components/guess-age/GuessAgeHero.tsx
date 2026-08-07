import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Cake, Target, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import guessAgeHeroVideo from "@/assets/guess-age-hero.mp4.asset.json";

export const GuessAgeHero = () => {
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
    <div className="relative h-[46vh] min-h-[280px] sm:h-[56vh] sm:min-h-[360px] w-full overflow-hidden rounded-3xl border border-accent/20 mb-6">
      <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" autoPlay muted loop playsInline>
        <source src={guessAgeHeroVideo.url} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 text-center">
        <motion.span
          initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/50 backdrop-blur-md text-foreground text-xs sm:text-sm font-semibold border border-accent/40 mb-3"
        >
          <Cake className="w-4 h-4 text-accent" /> 1 credit per guess <Target className="w-4 h-4 text-primary" />
        </motion.span>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl sm:text-5xl font-black bg-gradient-to-r from-accent via-primary to-accent bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
        >
          Guess My Age
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="mt-2 max-w-2xl text-sm sm:text-base text-foreground/90 font-medium"
        >
          Real players, real ages. Guess within ±2 years to score 10 points — a miss still gives you 2.
        </motion.p>
      </div>

      <div className="absolute bottom-3 right-3 flex gap-2 z-20">
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
