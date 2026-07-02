import { motion } from "framer-motion";
import { Flame, BarChart3, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function TennisEngagement() {
  const cards = [
    { icon: Flame, title: "Daily Streak", value: "0 Days", desc: "Play daily to build streaks", gradient: "from-orange-500/20 to-red-500/20", iconColor: "text-orange-400" },
    { icon: BarChart3, title: "Win Rate", value: "0%", desc: "Your match win percentage", gradient: "from-lime-500/20 to-green-500/20", iconColor: "text-lime-400" },
    { icon: Trophy, title: "Trophies", value: "0", desc: "Grand Slams won", gradient: "from-amber-500/20 to-yellow-500/20", iconColor: "text-amber-400" },
  ];

  return (
    <><FloatingHowItWorks title="TennisEngagement — How it works" steps={[{title:"Open this section",desc:"Access TennisEngagement from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="grid grid-cols-3 gap-3">
      {cards.map((card, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }}
          className={`p-3 md:p-4 rounded-xl bg-gradient-to-br ${card.gradient} border border-border/30`}>
          <card.icon className={`h-5 w-5 ${card.iconColor} mb-2`} />
          <div className="text-lg md:text-xl font-bold text-foreground">{card.value}</div>
          <div className="text-xs font-semibold text-foreground/80">{card.title}</div>
          <div className="text-[10px] text-muted-foreground mt-1">{card.desc}</div>
        </motion.div>
      ))}
    </div>
  </>
  );
}
