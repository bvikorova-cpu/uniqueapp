import { motion } from "framer-motion";
import { Heart, Users, MessageCircle, Shield } from "lucide-react";
import { useEffect, useState } from "react";

const AnimatedCounter = ({ end, duration = 2 }: { end: number; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{count.toLocaleString()}</span>;
};

export const AnonymousDateHero = () => {
  const stats = [
    { icon: Users, label: "Active Users", value: 12450 },
    { icon: Heart, label: "Matches Made", value: 8320 },
    { icon: MessageCircle, label: "Messages Sent", value: 94500 },
    { icon: Shield, label: "Safe Reveals", value: 5100 },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl p-6 sm:p-10">
      <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-accent/5" />

      <div className="relative flex flex-col lg:flex-row items-center gap-8">
        <div className="flex-1 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 text-pink-500 text-xs font-medium mb-4">
              <Heart className="h-3 w-3" />
              Anonymous Date
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-pink-500 to-accent bg-clip-text text-transparent">
              Find Love Anonymously
            </h1>
            <p className="text-muted-foreground mt-3 max-w-lg leading-relaxed">
              Connect based on personality, not appearance. Chat for 7 days before the big reveal.
              Build genuine connections in a safe, verified environment.
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
                <stat.icon className="h-4 w-4 mx-auto text-pink-500/60" />
                <div className="text-lg sm:text-xl font-bold">
                  <AnimatedCounter end={stat.value} />
                </div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Animated Heart Ring */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0"
        >
          <svg viewBox="0 0 120 120" className="w-full h-full">
            <defs>
              <linearGradient id="anonDateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--chart-1))" />
                <stop offset="100%" stopColor="hsl(var(--accent))" />
              </linearGradient>
            </defs>
            <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
            <motion.circle
              cx="60" cy="60" r="52"
              fill="none"
              stroke="url(#anonDateGrad)"
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
              stroke="hsl(var(--chart-1) / 0.2)"
              strokeWidth="2"
              strokeDasharray="8 4"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ transformOrigin: "60px 60px" }}
            />
            <text x="60" y="55" textAnchor="middle" className="fill-foreground text-lg font-bold" fontSize="20">💕</text>
            <text x="60" y="72" textAnchor="middle" className="fill-muted-foreground" fontSize="8">CONNECTIONS</text>
          </svg>
        </motion.div>
      </div>
    </div>
  );
};
