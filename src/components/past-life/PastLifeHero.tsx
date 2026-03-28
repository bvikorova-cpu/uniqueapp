import { motion } from "framer-motion";
import { Clock, Users, BookOpen, Star } from "lucide-react";
import { useLiveStats } from "@/hooks/useLiveStats";

export const PastLifeHero = () => {
  const { stats: liveStats, loading } = useLiveStats([
    { key: "explorers", table: "past_life_readings" },
    { key: "lives", table: "past_life_readings" },
    { key: "credits", table: "ai_credits" },
  ]);

  const stats = [
    { icon: Users, label: "Explorers", value: liveStats.explorers },
    { icon: BookOpen, label: "Lives Discovered", value: liveStats.lives },
    { icon: Clock, label: "Eras Explored", value: liveStats.credits },
    { icon: Star, label: "Karmic Insights", value: liveStats.lives },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl p-6 sm:p-10">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
      
      <div className="relative flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
              <Clock className="h-3 w-3" />
              Past Life Explorer
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
              Journey Through Time
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg leading-relaxed">
              Discover who you were in previous lifetimes through AI-powered mystical analysis. 
              Uncover karmic patterns and soul connections across centuries.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center space-y-1">
                <stat.icon className="h-4 w-4 mx-auto text-primary/60" />
                <div className="text-lg sm:text-xl font-bold">
                  {loading ? "—" : (stat.value || 0) > 0 ? stat.value!.toLocaleString() : "—"}
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0"
        >
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <linearGradient id="pastLifeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
            <motion.circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#pastLifeGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 52 * 0.06 }}
              transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
              transform="rotate(-90 60 60)"
            />
            <motion.circle
              cx="60" cy="60" r="40"
              fill="none"
              stroke="hsl(var(--primary) / 0.2)"
              strokeWidth="2"
              strokeDasharray="8 4"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "60px 60px" }}
            />
            <text x="60" y="55" textAnchor="middle" className="fill-foreground text-lg font-bold" fontSize="18">♾️</text>
            <text x="60" y="72" textAnchor="middle" className="fill-muted-foreground" fontSize="8">SOUL JOURNEY</text>
          </svg>
        </motion.div>
      </div>
    </div>
  );
};
