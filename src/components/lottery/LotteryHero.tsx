import { motion } from "framer-motion";
import { Sparkles, TrendingUp, Users, Zap, Target, Dices } from "lucide-react";
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

const floatingEmojis = ["🎰", "🍀", "💰", "🎲", "⭐", "🔮", "💎", "🎯"];

export const LotteryHero = () => {
  const { stats, loading } = useLiveStats([
    { key: "generations", table: "lottery_generations" },
  ]);

  const heroStats = [
    { icon: Users, label: "Numbers Generated", value: stats.generations || 0, suffix: "+" },
    { icon: Target, label: "AI Engine", value: 0, suffix: "", staticLabel: "GPT-4" },
    { icon: TrendingUp, label: "Lotteries", value: 0, suffix: "", staticLabel: "15+" },
    { icon: Zap, label: "Analysis", value: 0, suffix: "", staticLabel: "Real-time" },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 via-primary to-accent p-6 sm:p-10 mb-8">
      {floatingEmojis.map((emoji, i) => (
        <motion.div key={i} className="absolute text-xl md:text-3xl opacity-20 select-none pointer-events-none"
          style={{ left: `${(i * 12) + 5}%`, top: `${(i % 3) * 30 + 10}%` }}
          animate={{ y: [0, -15, 0], rotate: [0, i % 2 === 0 ? 12 : -12, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 3 + (i * 0.3), repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}>
          {emoji}
        </motion.div>
      ))}
      <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-400/20 rounded-full blur-3xl" />
      <div className="relative z-10">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-4">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-sm font-semibold border border-white/30">
            <Dices className="w-4 h-4" /> AI-Powered Predictions <Sparkles className="w-4 h-4" />
          </span>
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="text-3xl md:text-5xl font-black text-center text-white mb-3">
          Lottery AI 🎰
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-base md:text-lg text-white/80 text-center mb-6 max-w-2xl mx-auto">
          Advanced ML analyzes historical data to generate optimized number combinations
        </motion.p>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {heroStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center border border-white/20">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <stat.icon className="w-4 h-4 text-white/80" />
                <span className="text-xl font-black text-white">
                  {(stat as any).staticLabel ? (stat as any).staticLabel : loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                </span>
              </div>
              <span className="text-xs text-white/70 font-medium">{stat.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
