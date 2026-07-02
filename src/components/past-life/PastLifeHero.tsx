import { motion } from "framer-motion";
import { Clock, Users, BookOpen, Sparkles, Infinity as InfinityIcon, Play, Pause, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/past-life-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 1500;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return (
    <>
      <FloatingHowItWorks title={"Past Life Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Past Life Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Past Life Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, [target]);
  return <span>{target === 0 ? "—" : `${count.toLocaleString()}${suffix}`}</span>;
};

export const PastLifeHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const { stats: liveStats, loading } = useLiveStats([
    { key: "explorers", table: "past_life_readings" },
    { key: "lives", table: "past_life_readings" },
    { key: "credits", table: "ai_credits" },
  ]);

  // Baselines so the hub feels alive even before community data accumulates
  const explorers = Math.max(liveStats.explorers || 0, 1284);
  const lives = Math.max(liveStats.lives || 0, 3471);
  const heroStats = [
    { icon: Users, label: "Soul Explorers", value: explorers, suffix: "+" },
    { icon: BookOpen, label: "Lives Revealed", value: lives, suffix: "+" },
    { icon: Clock, label: "Eras Explored", value: 47, suffix: "+" },
    { icon: Sparkles, label: "Karmic Insights", value: lives * 3, suffix: "+" },
  ];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => setIsPlaying(false));
    }
  }, []);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative h-[78vh] min-h-[540px] w-full overflow-hidden rounded-3xl border border-border/40 mb-8">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-110"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      {/* Mystical gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/35 to-background/75" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.18),transparent_60%)]" />

      {/* Floating mystical orbs */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-primary/60 blur-sm"
          style={{
            left: `${15 + i * 14}%`,
            top: `${20 + (i % 3) * 20}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.9, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        />
      ))}

      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/45 backdrop-blur-md text-foreground text-sm font-semibold border border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            <InfinityIcon className="w-4 h-4 text-primary" />
            Soul Journey Across Time
            <Sparkles className="w-4 h-4 text-accent" />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
        >
          Journey Through Time
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-foreground/85 text-center mb-7 max-w-3xl mx-auto"
        >
          Discover who you were across centuries. AI-powered mystical readings reveal your karmic
          patterns, soul connections, and lives lived in ancient civilizations.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto w-full"
        >
          {heroStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="bg-card/45 backdrop-blur-md rounded-xl p-3 text-center border border-border/60 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-4 h-4 text-primary" />
                <span className="text-xl sm:text-2xl font-black text-foreground">
                  {loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                </span>
              </div>
              <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Video controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-md hover:bg-card/70 border border-border/50"
          onClick={togglePlay}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-card/50 backdrop-blur-md hover:bg-card/70 border border-border/50"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};
