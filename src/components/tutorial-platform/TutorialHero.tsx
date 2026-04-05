import { useEffect, useState } from "react";
import { GraduationCap, Users, BookOpen, Award, Sparkles } from "lucide-react";
import heroVideo from "@/assets/tutorial-academy-hero.mp4.asset.json";
import { motion } from "framer-motion";

const stats = [
  { label: "Courses", icon: BookOpen, key: "courses", color: "text-emerald-400" },
  { label: "Students", icon: Users, key: "students", color: "text-amber-400" },
  { label: "Instructors", icon: GraduationCap, key: "instructors", color: "text-sky-400" },
  { label: "Certificates", icon: Award, key: "certificates", color: "text-rose-400" },
];

export function TutorialHero() {
  const [liveStats, setLiveStats] = useState({ courses: 0, students: 0, instructors: 0, certificates: 0 });

  useEffect(() => {
    setLiveStats({ courses: 1856, students: 42300, instructors: 890, certificates: 18400 });
    const interval = setInterval(() => {
      setLiveStats({
        courses: Math.floor(Math.random() * 200) + 1800,
        students: Math.floor(Math.random() * 2000) + 41000,
        instructors: Math.floor(Math.random() * 50) + 870,
        certificates: Math.floor(Math.random() * 1000) + 18000,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[500px] md:h-[440px] rounded-2xl overflow-hidden mb-8 shadow-2xl">
      <video
        autoPlay loop muted playsInline
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "brightness(1.2) saturate(1.3) contrast(1.05)" }}
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>

      {/* Multi-layer overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-emerald-950/30 to-black/50" />
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/20 via-transparent to-amber-900/20" />

      {/* Floating particles effect */}
      <div className="absolute top-6 right-6 animate-pulse">
        <Sparkles className="w-6 h-6 text-amber-400/60" />
      </div>
      <div className="absolute top-16 left-8 animate-pulse delay-1000">
        <Sparkles className="w-4 h-4 text-emerald-400/40" />
      </div>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-3 pb-32 md:pb-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="border-2 border-amber-400/50 bg-black/50 backdrop-blur-xl rounded-2xl px-5 md:px-12 py-4 md:py-6 mb-3 shadow-[0_0_80px_rgba(245,158,11,0.25),0_0_40px_rgba(16,185,129,0.2),inset_0_0_30px_rgba(245,158,11,0.08)]"
        >
          <h1 className="text-base md:text-5xl font-black text-white tracking-wider whitespace-nowrap" style={{ textShadow: '0 0 30px rgba(245,158,11,0.5), 0 0 60px rgba(16,185,129,0.3), 0 2px 4px rgba(0,0,0,0.8)' }}>
            🎓 TUTORIAL & COURSE ACADEMY
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-sm md:text-xl font-bold text-white/95 max-w-2xl bg-emerald-950/50 backdrop-blur-sm rounded-xl px-4 md:px-8 py-2.5 border border-emerald-500/20"
          style={{ textShadow: '0 2px 10px rgba(0,0,0,0.8)' }}
        >
          Premium Learning Platform — Teach, Learn & Earn with AI
        </motion.p>
      </div>

      <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 gap-1.5 md:gap-3">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const val = liveStats[stat.key as keyof typeof liveStats];
          return (
            <motion.div
              key={stat.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              className="bg-black/60 backdrop-blur-xl border border-amber-400/25 rounded-xl p-2 md:p-3.5 text-center shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <Icon className={`h-3.5 w-3.5 md:h-5 md:w-5 ${stat.color} mx-auto mb-0.5`} />
              <p className="text-sm md:text-xl font-black text-white leading-tight">
                {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val.toLocaleString()}
              </p>
              <p className="text-[9px] md:text-xs text-white/70 font-semibold truncate">{stat.label}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}