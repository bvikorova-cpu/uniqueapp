import { motion } from "framer-motion";
import { Heart, Sparkles, TrendingUp, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FundraisingHeroProps {
  onMyCampaigns: () => void;
  onExplore: () => void;
}

const floatingIcons = [
  { emoji: "❤️", left: 5, top: 15 },
  { emoji: "🐾", left: 90, top: 10 },
  { emoji: "🎓", left: 8, top: 70 },
  { emoji: "🆘", left: 88, top: 65 },
  { emoji: "🌍", left: 3, top: 42 },
  { emoji: "💊", left: 94, top: 40 },
];

const stats = [
  { icon: Heart, label: "Campaigns", value: "—" },
  { icon: Users, label: "Donors", value: "—" },
  { icon: TrendingUp, label: "Raised", value: "—" },
];

export function FundraisingHero({ onMyCampaigns, onExplore }: FundraisingHeroProps) {
  return (
    <section className="relative py-16 px-4 text-center overflow-hidden">
      {/* Floating emojis */}
      {floatingIcons.map((item, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none opacity-40"
          style={{ left: `${item.left}%`, top: `${item.top}%` }}
          animate={{ y: [0, -14, 0], rotate: [0, i % 2 === 0 ? 10 : -10, 0] }}
          transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.25 }}
        >
          {item.emoji}
        </motion.span>
      ))}

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Mascot */}
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-5 w-20 h-20 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-2xl shadow-primary/30"
        >
          <span className="text-4xl">💝</span>
        </motion.div>

        <h1 className="text-4xl md:text-5xl font-black mb-3">
          <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Fundraising Hub
          </span>
        </h1>

        <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-6">
          Support causes you care about or create your own campaign to get help from the community
        </p>

        {/* Glassmorphism badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card/60 backdrop-blur-sm border border-border/50 text-sm text-muted-foreground mb-6"
        >
          <Sparkles className="w-4 h-4 text-primary" />
          Every contribution makes a difference
        </motion.div>

        <div className="flex gap-3 justify-center flex-wrap mb-8">
          <Button size="lg" onClick={onMyCampaigns}>
            <Sparkles className="mr-2 h-4 w-4" /> My Campaigns
          </Button>
          <Button size="lg" variant="outline" onClick={onExplore}>
            <Heart className="mr-2 h-4 w-4" /> Explore Causes
          </Button>
        </div>

        {/* Stats */}
        <div className="flex justify-center gap-6 flex-wrap">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card/50 border border-border/30"
            >
              <stat.icon className="w-4 h-4 text-primary" />
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
