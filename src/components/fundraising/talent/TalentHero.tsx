import { motion } from "framer-motion";
import { Star, Sparkles, TrendingUp, Users, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const floatingIcons = [
  { emoji: "🎵", left: 5, top: 13 },
  { emoji: "⚽", left: 92, top: 8 },
  { emoji: "🎨", left: 4, top: 66 },
  { emoji: "💃", left: 90, top: 61 },
  { emoji: "⭐", left: 3, top: 39 },
  { emoji: "🏆", left: 95, top: 35 },
  { emoji: "🎭", left: 49, top: 5 },
];

const stats = [
  { icon: Star, label: "Talents Supported", value: "—" },
  { icon: Users, label: "Total Sponsors", value: "—" },
  { icon: TrendingUp, label: "Funds Raised", value: "—" },
];

export function TalentHero() {
  const navigate = useNavigate();

  return (
    <section className="relative py-16 text-center overflow-hidden">
      {floatingIcons.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none opacity-30"
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
          animate={{ y: [0, -16, 0], rotate: [0, i % 2 === 0 ? 12 : -12, 0] }}
          transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        >
          {item.emoji}
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-accent via-primary to-accent flex items-center justify-center shadow-2xl shadow-accent/30"
        >
          <span className="text-4xl">🎭</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black mb-3">
          <span className="bg-gradient-to-r from-foreground via-accent to-primary bg-clip-text text-transparent">
            Talent Sponsorship Hub
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
          Discover and sponsor the next generation of artists, athletes, and creators
        </p>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 text-sm text-muted-foreground mb-6"
        >
          <Award className="w-4 h-4 text-accent" />
          Premium talents get featured placement & priority visibility
        </motion.div>

        <div className="flex gap-3 justify-center flex-wrap mb-8">
          <Button size="lg" onClick={() => navigate("/fundraising/talent/create")}>
            <Star className="mr-2 h-4 w-4" /> Showcase Your Talent
          </Button>
          <Button size="lg" variant="outline" onClick={() => document.getElementById("campaigns")?.scrollIntoView({ behavior: "smooth" })}>
            <Sparkles className="mr-2 h-4 w-4" /> Explore Talents
          </Button>
        </div>

        <div className="flex justify-center gap-6 flex-wrap">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/30"
            >
              <stat.icon className="w-4 h-4 text-accent" />
              <div className="text-left">
                <div className="text-sm font-bold text-foreground">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
