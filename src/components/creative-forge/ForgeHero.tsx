import { motion } from "framer-motion";
import { Feather, Sparkles, Users, FileText, Star, Play, Pause, Volume2, VolumeX, BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import heroVideo from "@/assets/creative-forge-hero.mp4.asset.json";
import { useLiveStats } from "@/hooks/useLiveStats";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) { setCount(0); return; }
    const duration = 1600; const steps = 50; const inc = target / steps; let cur = 0;
    const t = setInterval(() => {
      cur += inc;
      if (cur >= target) { setCount(target); clearInterval(t); }
      else setCount(Math.floor(cur));
    }, duration / steps);
    return (
    <>
      <FloatingHowItWorks title={"Forge Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the Forge Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Forge Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(t);
  }, [target]);
  return <span>{target === 0 ? "—" : `${count.toLocaleString()}${suffix}`}</span>;
};

interface ForgeHeroProps {
  credits: number;
  creditsLoading: boolean;
  onStartCreating?: () => void;
  onOpenCowriter?: () => void;
}

export function ForgeHero({ credits, creditsLoading, onStartCreating, onOpenCowriter }: ForgeHeroProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const { stats, loading } = useLiveStats([
    { key: "writers", table: "creative_forge_credits" },
    { key: "projects", table: "creative_forge_projects" },
    { key: "content", table: "ai_generated_content" },
  ]);

  useEffect(() => {
    if (videoRef.current) videoRef.current.play().catch(() => setIsPlaying(false));
  }, []);

  const togglePlay = () => { if (!videoRef.current) return; if (isPlaying) videoRef.current.pause(); else videoRef.current.play(); setIsPlaying(!isPlaying); };
  const toggleMute = () => { if (!videoRef.current) return; videoRef.current.muted = !isMuted; setIsMuted(!isMuted); };

  const heroStats = [
    { icon: Users, label: "Writers", value: stats.writers || 0, suffix: "+" },
    { icon: FileText, label: "Projects", value: stats.projects || 0, suffix: "+" },
    { icon: Star, label: "AI Drafts", value: stats.content || 0, suffix: "+" },
  ];

  return (
    <div className="relative h-[78vh] min-h-[560px] w-full overflow-hidden rounded-3xl border border-amber-700/30 mb-8 shadow-[0_0_80px_-20px_rgba(180,83,9,0.5)]">
      {/* Black fallback + video */}
      <div className="absolute inset-0 bg-black" />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover brightness-[1.05] saturate-[1.2]"
        autoPlay muted loop playsInline
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      {/* Premium literary gradient overlay - top transparent so video visible, bottom dark for text */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black/85" />
      <div className="absolute inset-0 bg-gradient-to-r from-amber-950/15 via-transparent to-rose-950/20" />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end pb-10 px-6 sm:px-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-black/55 backdrop-blur-xl text-white text-sm font-semibold border border-amber-400/40 shadow-[0_0_30px_rgba(251,191,36,0.3)]">
            <Feather className="w-4 h-4 text-amber-300" />
            <span style={{ color: "#fde68a" }}>Premium Writing Studio</span>
            <Sparkles className="w-4 h-4 text-rose-300" />
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-black text-center mb-4 drop-shadow-lg"
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            WebkitTextStroke: "1.5px rgba(0,0,0,0.4)",
            textShadow: "0 0 60px rgba(251,191,36,0.45), 0 0 120px rgba(190,18,60,0.3), 0 4px 20px rgba(0,0,0,0.6)",
          }}
        >
          <span className="bg-gradient-to-r from-amber-200 via-rose-200 to-amber-200 bg-clip-text text-transparent italic">
            Where Words
          </span>
          <br />
          <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-400 bg-clip-text text-transparent">
            Become Legacy.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-base sm:text-lg md:text-xl text-white/90 text-center mb-6 max-w-3xl mx-auto drop-shadow-md font-light"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Lyrics, screenplays, novels, poetry — crafted with an AI co-author trained on the world's greatest literary voices.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="flex justify-center gap-3 flex-wrap mb-7"
        >
          <Button
            size="lg"
            onClick={onStartCreating}
            className="bg-gradient-to-r from-amber-600 via-rose-600 to-amber-700 hover:from-amber-700 hover:via-rose-700 hover:to-amber-800 text-white font-bold border-0 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
          >
            <BookOpen className="mr-2 h-4 w-4" /> Start Writing
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={onOpenCowriter}
            className="bg-black/40 backdrop-blur-xl border-amber-400/40 text-white hover:bg-black/60 hover:border-amber-400/60"
          >
            <Sparkles className="mr-2 h-4 w-4" /> AI Co-Writer
          </Button>
        </motion.div>

        {/* Credits badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }}
          className="flex justify-center mb-5"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 backdrop-blur-xl text-amber-100 text-xs font-medium border border-amber-400/30">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            {creditsLoading ? "..." : credits} credits available
          </span>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-3 max-w-3xl mx-auto w-full"
        >
          {heroStats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.05 }}
              className="bg-black/55 backdrop-blur-xl rounded-2xl p-3 sm:p-4 text-center border border-amber-400/25 hover:border-amber-400/45 transition-all hover:scale-105"
            >
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-4 h-4 text-amber-300" />
                <span className="text-lg sm:text-2xl font-black text-white">
                  {loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                </span>
              </div>
              <span className="text-[10px] sm:text-xs text-amber-100/70 font-medium uppercase tracking-wider">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Video controls */}
      <div className="absolute bottom-4 right-4 flex gap-2 z-20">
        <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-xl hover:bg-black/70 border border-amber-400/30 text-white" onClick={togglePlay}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <Button variant="ghost" size="icon" className="bg-black/50 backdrop-blur-xl hover:bg-black/70 border border-amber-400/30 text-white" onClick={toggleMute}>
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
