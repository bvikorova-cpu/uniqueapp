import { motion } from "framer-motion";
import { GraduationCap, Users, Star, Zap, MessageSquare, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { useLiveStats } from "@/hooks/useLiveStats";
import { Badge } from "@/components/ui/badge";
import heroVideo from "@/assets/mentor-hero.mp4.asset.json";
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

const statColors = [
  "from-blue-500 to-cyan-600",
  "from-purple-500 to-violet-600",
  "from-amber-500 to-orange-600",
  "from-emerald-500 to-teal-600",
];

export const MentorHero = () => {
  const { stats, loading } = useLiveStats([
    { key: "users", table: "mentor_subscriptions" },
    { key: "sessions", table: "mentor_sessions" },
    { key: "checkins", table: "mentor_checkins" },
    { key: "goals", table: "mentor_goals" },
  ]);

  const heroStats = [
    { icon: Users, label: "Active Users", value: stats.users || 0, suffix: "+" },
    { icon: MessageSquare, label: "Sessions", value: stats.sessions || 0, suffix: "+" },
    { icon: Star, label: "Check-ins", value: stats.checkins || 0, suffix: "+" },
    { icon: Zap, label: "Goals Set", value: stats.goals || 0, suffix: "+" },
  ];

  return (
    <div className="space-y-4 mb-8">
      {/* Badge */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center">
        <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-blue-700 px-4 py-1.5 text-sm font-semibold shadow-lg">
          <Sparkles className="w-3.5 h-3.5 mr-1.5" />
          AI-Powered Personal Coaching
        </Badge>
      </motion.div>

      {/* Title */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center">
        <h1 className="text-3xl md:text-5xl font-black bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
          Your Personal Mentor
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
          Personalized guidance, daily check-ins & long-term progress tracking across career, fitness, mindset & relationships
        </p>
      </motion.div>

      {/* Video Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className="relative w-full aspect-video max-h-[340px] rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10"
      >
        <video
          autoPlay loop muted playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ filter: "brightness(1.1) saturate(1.2)" }}
        >
          <source src={heroVideo.url} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/15 via-transparent to-purple-900/15" />

        {/* Floating accents */}
        <div className="absolute top-4 right-4 animate-pulse">
          <Sparkles className="w-5 h-5 text-amber-400/70" />
        </div>
        <div className="absolute bottom-4 left-4">
          <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-white/90 font-medium">AI Coaches Online</span>
          </div>
        </div>
        <div className="absolute bottom-4 right-4">
          <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-white/90 font-medium">4 Mentor Areas</span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {heroStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
            >
              <div className="bg-card border rounded-xl p-3 md:p-4 text-center hover:shadow-lg hover:border-blue-500/20 transition-all group">
                <div className={`w-9 h-9 mx-auto mb-2 rounded-lg bg-gradient-to-br ${statColors[i]} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <p className="text-lg md:text-2xl font-black">
                  {loading ? "..." : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
