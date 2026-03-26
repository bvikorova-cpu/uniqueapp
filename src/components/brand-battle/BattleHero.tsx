import { motion } from "framer-motion";
import { Trophy, Swords, Flame, Zap, Star, Crown, Target, Shield } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BattleHeroProps {
  totalVotes?: number;
  totalSponsors?: number;
}

const floatingIcons = [
  { icon: Trophy, x: "10%", y: "20%", delay: 0, size: 28 },
  { icon: Swords, x: "85%", y: "15%", delay: 0.5, size: 24 },
  { icon: Flame, x: "15%", y: "70%", delay: 1, size: 22 },
  { icon: Crown, x: "90%", y: "65%", delay: 1.5, size: 26 },
  { icon: Star, x: "50%", y: "10%", delay: 0.3, size: 20 },
  { icon: Shield, x: "75%", y: "80%", delay: 0.8, size: 22 },
  { icon: Zap, x: "30%", y: "80%", delay: 1.2, size: 24 },
  { icon: Target, x: "60%", y: "75%", delay: 0.6, size: 20 },
];

export const BattleHero = ({ totalVotes = 0, totalSponsors = 0 }: BattleHeroProps) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-accent/10 to-primary/5 border border-primary/20 p-8 md:p-12 mb-10">
      {/* Floating icons */}
      {floatingIcons.map((item, i) => {
        const Icon = item.icon;
        return (
          <motion.div
            key={i}
            className="absolute text-primary/15 pointer-events-none"
            style={{ left: item.x, top: item.y }}
            animate={{ y: [0, -12, 0], rotate: [0, 8, -8, 0], opacity: [0.15, 0.3, 0.15] }}
            transition={{ duration: 4 + i * 0.5, repeat: Infinity, delay: item.delay, ease: "easeInOut" }}
          >
            <Icon size={item.size} />
          </motion.div>
        );
      })}

      {/* Animated VS emblem */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        animate={{ scale: [1, 1.15, 1], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="text-[12rem] font-black text-primary/10 select-none leading-none">VS</span>
      </motion.div>

      <div className="relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge className="bg-primary/15 text-primary border-primary/30 mb-4 text-sm px-4 py-1.5">
            <Swords className="h-4 w-4 mr-1.5" />
            Live Brand Battle — Q1 2025
          </Badge>
        </motion.div>

        <motion.h1
          className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Brand Battle Arena
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Vote for your favorite brands, compete in head-to-head matchups, and earn rewards.
          Top brands get premium placement.
        </motion.p>

        {/* Live stats bar */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 md:gap-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-semibold text-muted-foreground">Live</span>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-primary">{totalVotes.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-primary">{totalSponsors}</div>
            <div className="text-xs text-muted-foreground">Active Brands</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-black text-primary">€10K</div>
            <div className="text-xs text-muted-foreground">Prize Pool</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
