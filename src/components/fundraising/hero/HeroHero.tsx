import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Users, Award, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";

const floatingEmojis = [
  { emoji: "🚒", x: "8%", y: "18%", delay: 0, duration: 6 },
  { emoji: "🚑", x: "88%", y: "12%", delay: 1.2, duration: 7 },
  { emoji: "👨‍🏫", x: "78%", y: "68%", delay: 0.6, duration: 5 },
  { emoji: "🤝", x: "12%", y: "72%", delay: 2, duration: 8 },
  { emoji: "🦸", x: "50%", y: "8%", delay: 1.5, duration: 6 },
  { emoji: "⭐", x: "92%", y: "42%", delay: 2.5, duration: 7 },
  { emoji: "🏅", x: "5%", y: "48%", delay: 3, duration: 5 },
];

const stats = [
  { icon: Shield, label: "Heroes Supported", value: "—" },
  { icon: Award, label: "Orgs Verified", value: "—" },
  { icon: TrendingUp, label: "Platform Fee", value: "5%" },
];

export const HeroHero = () => {
  const navigate = useNavigate();

  return (
    <div className="relative overflow-hidden py-16 md:py-24">
      {floatingEmojis.map((item, i) => (
        <motion.div
          key={i}
          className="absolute text-3xl md:text-4xl pointer-events-none select-none"
          style={{ left: item.x, top: item.y }}
          animate={{
            y: [0, -18, 0, 18, 0],
            x: [0, 8, -8, 4, 0],
            rotate: [0, 8, -8, 4, 0],
            scale: [1, 1.1, 0.9, 1.05, 1],
          }}
          transition={{ duration: item.duration, delay: item.delay, repeat: Infinity, ease: "easeInOut" }}
        >
          {item.emoji}
        </motion.div>
      ))}

      <div className="relative z-10 text-center max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
        >
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-primary">Lowest Fee — Only 5%</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black mb-6 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent leading-tight"
        >
          Community Hero Fund
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
        >
          Honor and support local heroes — firefighters, paramedics, teachers, and volunteers making a difference.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Button
            size="lg"
            onClick={() => navigate("/fundraising/hero/create")}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white shadow-lg text-lg px-8"
          >
            <Shield className="mr-2 h-5 w-5" />
            Nominate a Hero
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => document.getElementById("hero-campaigns")?.scrollIntoView({ behavior: "smooth" })}
          >
            Explore Projects
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
        >
          {stats.map((stat, i) => (
            <div key={i} className="backdrop-blur-md bg-card/60 border border-border/50 rounded-2xl p-4 text-center">
              <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-xl font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
};
