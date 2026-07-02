import { motion } from "framer-motion";
import { Flame, Target, Star, Zap } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const achievements = [
  { code: "first_blood", label: "First Blood", desc: "Win your first battle", icon: Flame, color: "text-red-400" },
  { code: "hat_trick", label: "Hat Trick", desc: "Win 3 battles in a row", icon: Target, color: "text-purple-400" },
  { code: "crowd_fav", label: "Crowd Favorite", desc: "Receive 100+ votes on a single story", icon: Star, color: "text-yellow-400" },
  { code: "lightning", label: "Lightning Writer", desc: "Submit a story within 1 hour of battle start", icon: Zap, color: "text-blue-400" },
];

export function ArenaAchievements() {
  // All locked by default — real unlock status would come from supabase
  return (
    <><FloatingHowItWorks title="ArenaAchievements — How it works" steps={[{title:"Open this section",desc:"Access ArenaAchievements from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="rounded-2xl border border-border/30 bg-card/20 p-6 mb-8">
      <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
        <Star className="w-5 h-5 text-yellow-400" />
        Achievements
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {achievements.map((a, i) => (
          <motion.div
            key={a.code}
            className="relative p-4 rounded-xl border border-border/20 bg-card/10 text-center opacity-50 grayscale hover:opacity-70 hover:grayscale-0 transition-all"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 0.5, scale: 1 }}
            transition={{ delay: i * 0.1 }}
          >
            <a.icon className={`w-8 h-8 mx-auto mb-2 ${a.color}`} />
            <p className="text-sm font-bold text-foreground">{a.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{a.desc}</p>
            <div className="absolute inset-0 rounded-xl border-2 border-dashed border-muted-foreground/20" />
          </motion.div>
        ))}
      </div>
    </div>
  </>
  );
}
