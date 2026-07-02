import { motion } from "framer-motion";
import { Heart, Users, Star, Zap, Activity, Waves } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { BreathingCircleHero } from "./BreathingCircleHero";
import { useLiveStats } from "@/hooks/useLiveStats";
import oceanVideoMeta from "@/assets/wellness-ocean-hero.mp4.asset.json";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

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

export const WellnessHero = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stats, loading } = useLiveStats([
    { key: "users", table: "wellness_usage_stats" },
    { key: "meditations", table: "wellness_meditation_sessions" },
    { key: "journals", table: "wellness_journal_entries" },
  ]);

  useEffect(() => {
    videoRef.current?.play().catch(() => {});
  }, []);

  const heroStats = [
    { icon: Users, label: "Active Users", value: stats.users || 0, suffix: "+" },
    { icon: Activity, label: "Meditations", value: stats.meditations || 0, suffix: "+" },
    { icon: Star, label: "Journal Entries", value: stats.journals || 0, suffix: "+" },
    { icon: Zap, label: "AI Coaching", value: 0, suffix: "", staticLabel: "24/7" },
  ];

  return (
    <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 mb-10 sm:mb-14 overflow-hidden rounded-b-3xl">
      {/* Cinematic ocean video */}
      <video
        ref={videoRef}
        src={oceanVideoMeta.url}
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover scale-110"
      />
      {/* Gradient overlays for cinematic depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/55 to-background" />
      <div className="absolute inset-0 bg-gradient-to-tr from-teal-950/40 via-transparent to-amber-900/20" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_hsl(var(--background)/0.6)_75%)]" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="relative px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 pb-8 sm:pb-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 text-sm text-white mb-5 shadow-lg">
          <Waves className="w-4 h-4 text-teal-300" />
          <span className="font-semibold tracking-wide drop-shadow">AI-Powered Wellness Sanctuary</span>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black mb-4 tracking-tight leading-[1.05]">
          <span className="text-white drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]">Your </span>
          <span className="bg-gradient-to-br from-teal-200 via-cyan-100 to-amber-100 bg-clip-text text-transparent drop-shadow-[0_2px_24px_rgba(0,200,200,0.4)]">
            Wellness Sanctuary
          </span>
        </motion.h1>

        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-white/85 text-sm sm:text-lg max-w-2xl mx-auto mb-8 drop-shadow-[0_1px_8px_rgba(0,0,0,0.4)]">
          Cinematic breathwork, AI-personalized meditations, dream interpretation, mood mirror & narrated sleep stories — all in one peaceful sanctuary
        </motion.p>

        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25, duration: 0.6 }} className="mb-10">
          <BreathingCircleHero />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-3xl mx-auto">
          {heroStats.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35 + i * 0.05 }}
              className="relative group p-4 rounded-2xl bg-white/8 backdrop-blur-xl border border-white/15 hover:border-teal-300/40 hover:bg-white/12 transition-all shadow-xl">
              <stat.icon className="w-5 h-5 text-teal-200 mx-auto mb-2 drop-shadow" />
              <div className="text-2xl sm:text-3xl font-black text-white drop-shadow">
                {(stat as any).staticLabel ? (stat as any).staticLabel : loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
              </div>
              <p className="text-[11px] text-white/75 mt-1 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};
