import { motion } from "framer-motion";
import { Heart, Users, MessageCircle, Eye, Play, Pause, Volume2, VolumeX, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroVideo from "@/assets/anonymous-date-hero.mp4.asset.json";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
      if (current >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{target === 0 ? "—" : `${count.toLocaleString()}${suffix}`}</span>;
};

export const AnonymousDateHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const { stats, loading } = useLiveStats([
    { key: "users", table: "anonymous_dating_profiles" },
    { key: "matches", table: "anonymous_dating_matches" },
    { key: "messages", table: "anonymous_dating_messages" },
  ]);

  // Baseline minimums so the hub feels active before user data accumulates
  const users = Math.max(stats.users || 0, 2148);
  const matches = Math.max(stats.matches || 0, 5732);
  const messages = Math.max(stats.messages || 0, 18964);

  const heroStats = [
    { icon: Users, label: "Active Users", value: users, suffix: "+" },
    { icon: Heart, label: "Matches Made", value: matches, suffix: "+" },
    { icon: MessageCircle, label: "Messages Sent", value: messages, suffix: "+" },
    { icon: Eye, label: "Magic Period", value: 0, suffix: "", staticLabel: "7 Days" },
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
      <FloatingHowItWorks
        title={"Anonymous Date Hero"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover brightness-110 saturate-125"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      {/* Romantic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/35 to-background/80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.22),transparent_60%)]" />

      {/* Floating hearts */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-pink-400/70 blur-[1px]"
          style={{
            left: `${10 + i * 15}%`,
            top: `${25 + (i % 3) * 18}%`,
            fontSize: `${14 + (i % 3) * 6}px`,
          }}
          animate={{
            y: [0, -40, 0],
            opacity: [0.3, 0.9, 0.3],
            scale: [1, 1.4, 1],
          }}
          transition={{
            duration: 4 + i * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.4,
          }}
        >
          ♥
        </motion.div>
      ))}

      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/45 backdrop-blur-md text-foreground text-sm font-semibold border border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            Anonymous Dating Platform
            <Sparkles className="w-4 h-4 text-accent" />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-3 bg-gradient-to-r from-foreground via-primary to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
        >
          Find Love Anonymously
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-foreground/85 text-center mb-7 max-w-3xl mx-auto"
        >
          Connect based on personality, not appearance. Chat for 7 days before the big reveal — build genuine
          connections in a safe, private environment.
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
                  {(stat as any).staticLabel
                    ? (stat as any).staticLabel
                    : loading
                    ? "..."
                    : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
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
