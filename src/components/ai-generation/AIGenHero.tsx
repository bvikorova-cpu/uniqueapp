import { motion } from "framer-motion";
import { Palette, Users, Image, Zap } from "lucide-react";
import { useState, useEffect } from "react";
import { useLiveStats } from "@/hooks/useLiveStats";
import heroAsset from "@/assets/ai-image-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface AIGenHeroProps {
  credits: number;
}

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 1500; const steps = 40; const increment = target / steps; let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return (
    <>
      <FloatingHowItWorks title={"A I Gen Hero - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Gen Hero section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Gen Hero.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(timer);
  }, [target]);
  return <span>{target === 0 ? "—" : `${count.toLocaleString()}${suffix}`}</span>;
};

export const AIGenHero = ({ credits }: AIGenHeroProps) => {
  const { stats, loading } = useLiveStats([
    { key: "images", table: "ai_usage_history" },
    { key: "users", table: "ai_credits" },
    { key: "designs", table: "ai_studio_transformations" },
  ]);

  const heroStats = [
    { icon: Image, label: "Images Created", value: stats.images || 0, suffix: "+" },
    { icon: Users, label: "Active Artists", value: stats.users || 0, suffix: "+" },
    { icon: Palette, label: "Styles Available", value: 0, suffix: "", staticLabel: "12+" },
    { icon: Zap, label: "Generation Speed", value: 0, suffix: "", staticLabel: "~5s" },
  ];

  return (
    <div className="mb-8 space-y-3">
      <div className="relative w-full h-[300px] sm:h-[400px] rounded-2xl overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 h-full w-full object-cover"
          style={{ filter: "brightness(1.15) saturate(1.1)" }}
          src={heroAsset.url}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background/40 via-background/15 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background/30 via-transparent to-transparent" />

        <div className="relative z-10 flex h-full flex-col justify-between p-4 sm:p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-[60%] sm:max-w-lg space-y-3"
          >
            <span className="inline-flex items-center rounded-full border border-border/60 bg-background/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-foreground backdrop-blur-sm">
              AI-Powered Creative Studio
            </span>
            <div className="inline-block rounded-2xl border-2 border-primary/40 bg-background/30 px-4 py-4 backdrop-blur-sm sm:px-5 shadow-lg">
              <h1 className="text-3xl font-black leading-none text-foreground sm:text-5xl">
                AI Image <span className="text-primary">Generator</span>
              </h1>
              <p className="mt-3 max-w-sm text-sm font-semibold text-foreground/85 sm:text-lg">
                Create stunning images from text descriptions using advanced AI
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.8 }}
          >
            <div className="inline-flex flex-wrap items-center gap-3 rounded-2xl border border-border/50 bg-background/35 px-4 py-3 backdrop-blur-sm shadow-xl">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                <Zap className="w-3 h-3" />
                {credits} Credits
              </span>
              <span className="inline-flex items-center rounded-full border border-border/60 bg-background/45 px-3 py-1 text-xs font-bold text-foreground/80">
                5 per generation
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {heroStats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="bg-card/80 backdrop-blur-xl border border-border rounded-xl p-3 sm:p-4 text-center hover:border-primary/40 transition-all"
          >
            <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-xl sm:text-2xl font-black">
              {(stat as any).staticLabel
                ? (stat as any).staticLabel
                : loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
