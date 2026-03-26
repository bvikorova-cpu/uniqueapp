import { motion } from "framer-motion";
import { Heart, Shield, Users, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const floatingEmojis = ["❤️", "🐾", "🎓", "🆘", "🏥", "✨", "🦸", "🎭"];
const emojiPositions = [
  { left: "2%", top: "3%" },
  { left: "92%", top: "5%" },
  { left: "3%", top: "30%" },
  { left: "90%", top: "28%" },
  { left: "5%", top: "58%" },
  { left: "88%", top: "55%" },
  { left: "2%", top: "80%" },
  { left: "92%", top: "78%" },
];

const stats = [
  { icon: TrendingUp, value: "€500K+", label: "Total Raised" },
  { icon: Users, value: "10K+", label: "Supporters" },
  { icon: Heart, value: "2,000+", label: "Campaigns" },
];

interface FundraisingHeroProps {
  onMyCampaigns: () => void;
  onExplore: () => void;
}

export const FundraisingHero = ({ onMyCampaigns, onExplore }: FundraisingHeroProps) => {
  return (
    <div className="relative text-center py-12 px-4 overflow-hidden">
      {/* Floating emojis */}
      {floatingEmojis.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-xl sm:text-2xl pointer-events-none select-none"
          style={{ left: emojiPositions[i].left, top: emojiPositions[i].top }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, i % 2 === 0 ? 8 : -8, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 3 + i * 0.3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Orbital mascot */}
      <div className="relative mx-auto w-28 h-28 mb-6">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute inset-2 rounded-full border-2 border-dashed border-accent/20"
          animate={{ rotate: -360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-primary via-accent to-primary flex items-center justify-center shadow-[0_0_40px_hsl(var(--primary)/0.4)]">
          <Heart className="h-10 w-10 text-white" />
        </div>
        {[Shield, Users, Sparkles].map((Icon, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 bg-card rounded-full shadow-lg flex items-center justify-center border border-border/50"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear", delay: i * 2.67 }}
            style={{
              top: "50%",
              left: "50%",
              transformOrigin: `${-20 + i * 5}px ${-20 + i * 5}px`,
            }}
          >
            <Icon className="h-4 w-4 text-primary" />
          </motion.div>
        ))}
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-1.5 mb-4"
      >
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-primary">Community-Powered Giving</span>
      </motion.div>

      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-4xl sm:text-5xl font-black mb-2"
      >
        <span className="bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
          Fundraising
        </span>{" "}
        <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
          Hub
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-muted-foreground text-base max-w-md mx-auto mb-6"
      >
        Help each other achieve goals and fulfill dreams. 7 categories, thousands of opportunities to make a difference.
      </motion.p>

      {/* Pricing badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl px-4 py-2 mb-6"
      >
        <Heart className="h-4 w-4 text-accent" />
        <span className="text-sm font-semibold text-accent">Platform fees: 5-10% • 100% transparent</span>
      </motion.div>

      {/* CTA buttons */}
      <div className="flex gap-3 justify-center mb-8">
        <Button size="lg" onClick={onMyCampaigns} className="shadow-lg">
          My Campaigns
        </Button>
        <Button size="lg" variant="outline" onClick={onExplore}>
          Explore Categories
        </Button>
      </div>

      {/* Stats */}
      <div className="flex justify-center gap-6 sm:gap-10">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="text-center"
          >
            <stat.icon className="h-5 w-5 text-primary mx-auto mb-1" />
            <div className="text-lg font-black text-foreground">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
