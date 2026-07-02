import { motion } from "framer-motion";
import { Flame, BarChart3, Trophy } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export const FootballEngagement = () => {
  return (
    <><FloatingHowItWorks title="FootballEngagement — How it works" steps={[{title:"Open this section",desc:"Access FootballEngagement from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-3 gap-3">
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-transparent p-4 text-center">
        <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
        <p className="text-2xl font-bold">0</p>
        <p className="text-xs text-muted-foreground">Day Streak</p>
      </div>
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-green-500/10 to-transparent p-4 text-center">
        <BarChart3 className="h-6 w-6 text-emerald-400 mx-auto mb-2" />
        <p className="text-2xl font-bold">0</p>
        <p className="text-xs text-muted-foreground">Team Rating</p>
      </div>
      <div className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-amber-500/10 to-transparent p-4 text-center">
        <Trophy className="h-6 w-6 text-amber-400 mx-auto mb-2" />
        <p className="text-2xl font-bold">0</p>
        <p className="text-xs text-muted-foreground">Trophies Won</p>
      </div>
    </motion.div>
  </>
  );
};
