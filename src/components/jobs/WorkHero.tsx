import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Globe2, Sparkles, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";

const HERO_VIDEO = "/__l5e/assets-v1/59bb5139-4b05-46eb-9e8b-f051228b2c1c/work-hero-v1.mp4";

export function WorkHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    videoRef.current?.play().catch(() => setPlaying(false));
  }, []);

  const toggle = () => {
    const v = videoRef.current;
    if (!v) return;
    if (playing) v.pause();
    else v.play().catch(() => {});
    setPlaying(!playing);
  };

  return (
    <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden rounded-3xl border border-border/40 mb-8 shadow-2xl shadow-primary/10">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      >
        <source src={HERO_VIDEO} type="video/mp4" />
      </video>

      {/* cinematic overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/35 to-background/85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,hsl(var(--primary)/0.28),transparent_55%),radial-gradient(circle_at_85%_75%,hsl(var(--accent)/0.25),transparent_55%)]" />
      <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-background to-transparent" />

      <div className="relative z-10 h-full flex flex-col items-center justify-center px-5 sm:px-10 text-center">
        <motion.span
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 mb-5 rounded-full bg-card/40 backdrop-blur-xl border border-border/60 text-xs sm:text-sm font-semibold"
        >
          <Globe2 className="h-4 w-4 text-primary" />
          Global career tools, powered by AI
          <Sparkles className="h-4 w-4 text-accent" />
        </motion.span>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl lg:text-7xl font-black tracking-tight bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
        >
          Workplace
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="mt-4 max-w-2xl text-sm sm:text-lg text-foreground/85"
        >
          Post jobs worldwide, craft flawless resumes, and let AI do the heavy lifting — all with AI credits.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="mt-7 flex flex-wrap items-center justify-center gap-2 sm:gap-3"
        >
          {["Job posting", "AI JD Writer", "Resume Optimizer", "CV Generator"].map((t) => (
            <span
              key={t}
              className="px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium bg-card/40 backdrop-blur-xl border border-border/50"
            >
              {t}
            </span>
          ))}
        </motion.div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={toggle}
        aria-label={playing ? "Pause hero video" : "Play hero video"}
        className="absolute bottom-4 right-4 z-20 bg-card/50 backdrop-blur-md hover:bg-card/70 border border-border/50"
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
    </div>
  );
}
