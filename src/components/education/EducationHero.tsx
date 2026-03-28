import { motion } from "framer-motion";
import { GraduationCap, Trophy, Flame, Zap, BookOpen } from "lucide-react";
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

export const EducationHero = () => {
  const { stats, loading } = useLiveStats([
    { key: "courses", table: "courses" },
    { key: "quizzes", table: "quiz_attempts" },
    { key: "students", table: "course_enrollments" },
  ]);

  const heroStats = [
    { icon: BookOpen, label: "Courses", value: stats.courses || 0, suffix: "+" },
    { icon: Zap, label: "Quiz Attempts", value: stats.quizzes || 0, suffix: "+" },
    { icon: Trophy, label: "Enrollments", value: stats.students || 0, suffix: "+" },
    { icon: Flame, label: "AI Tutor", value: 0, suffix: "", staticLabel: "24/7" },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8 sm:mb-12">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-4">
        <GraduationCap className="w-4 h-4" />
        <span className="font-medium">AI-Powered Learning Platform</span>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="text-3xl sm:text-5xl lg:text-6xl font-black mb-3 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        Education Hub
      </motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto mb-8">
        AI tutoring, quiz categories, daily challenges & learning streaks
      </motion.p>
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
