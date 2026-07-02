import { motion } from "framer-motion";
import { Shield, Heart, Users, Sparkles, Play, Pause, Volume2, VolumeX, AlertTriangle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import heroVideo from "@/assets/safety-hero-hands.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  mode: "safe" | "crisis";
  onModeChange: (m: "safe" | "crisis") => void;
}

export const SafetyHero = ({ mode, onModeChange }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => setIsPlaying(false));
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

  const stats = [
    { icon: Heart, label: "Lives Supported", value: "12,400+" },
    { icon: Users, label: "Stories Shared", value: "3,800+" },
    { icon: Shield, label: "Incidents Reported", value: "1,250+" },
    { icon: Sparkles, label: "AI Assists", value: "Daily" },
  ];

  return (
    <>
      <FloatingHowItWorks title={"Safety Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Safety Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Safety Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden rounded-3xl border border-border/40 mb-8">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover brightness-95 saturate-110"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src={(heroVideo as any).url} type="video/mp4" />
      </video>

      {/* Mode-aware overlay */}
      <div
        className={`absolute inset-0 transition-colors duration-700 ${
          mode === "crisis"
            ? "bg-gradient-to-b from-red-950/40 via-red-900/30 to-red-950/80"
            : "bg-gradient-to-b from-teal-950/30 via-background/40 to-background/80"
        }`}
      />

      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
        {/* Mode Toggle */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-center mb-6"
        >
          <div className="inline-flex p-1 rounded-full bg-card/40 backdrop-blur-xl border border-border/50">
            <button
              onClick={() => onModeChange("safe")}
              className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                mode === "safe"
                  ? "bg-teal-500 text-white shadow-lg shadow-teal-500/40"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <Heart className="w-4 h-4" /> Safe Mode
            </button>
            <button
              onClick={() => onModeChange("crisis")}
              className={`px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${
                mode === "crisis"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/50 animate-pulse"
                  : "text-foreground/70 hover:text-foreground"
              }`}
            >
              <AlertTriangle className="w-4 h-4" /> Crisis Mode
            </button>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/45 backdrop-blur-md text-foreground text-xs sm:text-sm font-semibold border border-border/60">
            <Shield className="w-4 h-4 text-teal-400" /> You Are Not Alone <Sparkles className="w-4 h-4 text-amber-400" />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-3 bg-gradient-to-r from-foreground via-teal-300 to-amber-300 bg-clip-text text-transparent"
        >
          Safety & Bullying Prevention
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-sm sm:text-base md:text-lg text-foreground/85 text-center mb-7 max-w-3xl mx-auto"
        >
          A global sanctuary for anyone facing bullying — AI-powered support, evidence builders, role-play coaching, and 24/7 crisis resources.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto w-full"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="bg-card/45 backdrop-blur-md rounded-xl p-3 text-center border border-border/60"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-4 h-4 text-teal-400" />
                <span className="text-lg sm:text-2xl font-black text-foreground">{stat.value}</span>
              </div>
              <span className="text-[11px] sm:text-xs text-muted-foreground font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

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
    </>
  );
};
