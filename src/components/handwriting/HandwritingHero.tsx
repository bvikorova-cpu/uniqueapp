import { motion } from "framer-motion";
import { PenTool, Users, Activity, Star, Zap, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { useLiveStats } from "@/hooks/useLiveStats";

const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) return;
    const duration = 1500; const steps = 40; const increment = target / steps; let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { setCount(target); clearInterval(timer); }
      else { setCount(Math.floor(current)); }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{target === 0 ? "—" : `${count.toLocaleString()}${suffix}`}</span>;
};

export const HandwritingHero = () => {
  const { stats, loading } = useLiveStats([
    { key: "users", table: "handwriting_credits" },
    { key: "analyses", table: "handwriting_analyses" },
  ]);

  const heroStats = [
    { icon: Users, label: "Active Users", value: stats.users || 0, suffix: "+" },
    { icon: FileText, label: "Analyses Done", value: stats.analyses || 0, suffix: "+" },
    { icon: Star, label: "AI Engine", value: 0, suffix: "", staticLabel: "GPT-4" },
    { icon: Zap, label: "Response", value: 0, suffix: "", staticLabel: "~8s" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
        <PenTool className="w-4 h-4" />
        <span className="font-medium">AI-Powered Graphology</span>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        Handwriting Analyzer
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto mb-8">
        Unlock personality insights, emotional patterns, and hidden traits through professional AI handwriting analysis
      </motion.p>
      <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25, duration: 0.6 }} className="mb-8 flex justify-center">
        <div className="relative w-32 h-32 sm:w-40 sm:h-40">
          <svg className="w-full h-full" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="6" opacity="0.3" />
            <motion.circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--primary))" strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }} animate={{ strokeDashoffset: 2 * Math.PI * 52 * 0.04 }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.5 }} transform="rotate(-90 60 60)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
              <PenTool className="w-8 h-8 sm:w-10 sm:h-10 text-primary mb-1" />
              <span className="text-[10px] sm:text-xs text-muted-foreground">Graphology AI</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
        {heroStats.map((stat, i) => (
          <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.05 }}
            className="relative group p-4 rounded-2xl bg-card/60 backdrop-blur-sm border border-border/50 hover:border-primary/30 transition-all">
            <stat.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-2xl sm:text-3xl font-black text-foreground">
              {(stat as any).staticLabel ? (stat as any).staticLabel : loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
