import { motion } from "framer-motion";
import { Scan, Users, Zap, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { useLiveStats } from "@/hooks/useLiveStats";
import analyzerHeroAsset from "@/assets/analyzer-hero.mp4.asset.json";

interface AnalyzerHeroProps {
  credits: number;
  tier: string;
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
    return () => clearInterval(timer);
  }, [target]);
  return <span>{target === 0 ? "—" : `${count.toLocaleString()}${suffix}`}</span>;
};

export const AnalyzerHero = ({ credits, tier }: AnalyzerHeroProps) => {
  const { stats, loading } = useLiveStats([
    { key: "analyses", table: "vision_analyses" },
    { key: "users", table: "analyzer_credits" },
    { key: "collections", table: "analyzer_collections" },
  ]);

  const heroStats = [
    { icon: Scan, label: "Total Scans", value: stats.analyses || 0, suffix: "+" },
    { icon: Users, label: "Active Users", value: stats.users || 0, suffix: "+" },
    { icon: Eye, label: "Collections", value: stats.collections || 0, suffix: "+" },
    { icon: Zap, label: "Speed", value: 0, suffix: "", staticLabel: "~3s" },
  ];

  return (
    <div className="mb-8 space-y-3">
      <div className="relative w-full h-[280px] sm:h-[380px] rounded-2xl overflow-hidden">
        <video
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(1.3) saturate(1.2)" }}
          src={analyzerHeroAsset.url}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-cyan-900/20 to-transparent" />
        
        <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div className="inline-block max-w-[85%] sm:max-w-xl border border-cyan-400/30 bg-black/40 backdrop-blur-lg rounded-2xl px-5 py-4 sm:px-6 sm:py-5 shadow-[0_0_40px_rgba(0,255,255,0.15)]">
              <h1 className="text-3xl leading-none sm:text-5xl font-black text-white drop-shadow-lg">
                Universal Vision{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Analyzer
                </span>
              </h1>
              <p className="text-white/90 text-sm sm:text-lg font-semibold mt-2 max-w-md drop-shadow">
                AI-powered image analysis for everything around you
              </p>
              <div className="flex items-center gap-3 mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-300 bg-cyan-500/20 px-3 py-1 rounded-full border border-cyan-500/30">
                  <Zap className="w-3 h-3" />
                  {credits} Credits
                </span>
                <span className="inline-flex items-center text-xs font-bold text-blue-300 bg-blue-500/20 px-3 py-1 rounded-full border border-blue-500/30 capitalize">
                  {tier} Tier
                </span>
              </div>
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
            className="bg-card/80 backdrop-blur-xl border border-cyan-500/20 rounded-xl p-3 sm:p-4 text-center hover:border-cyan-400/40 transition-all"
          >
            <stat.icon className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
            <div className="text-xl sm:text-2xl font-black">
              {(stat as any).staticLabel
                ? (stat as any).staticLabel
                : loading
                ? "..."
                : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
