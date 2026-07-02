import { Card } from "@/components/ui/card";
import { useCursedAchievements } from "@/hooks/useShadowArenaFeatures";
import { Trophy, Sparkles, Skull } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const RARITY_STYLES: Record<string, { color: string; glow: string; icon: typeof Trophy }> = {
  common: { color: "text-gray-300 border-gray-600/40", glow: "shadow-[0_0_15px_rgba(156,163,175,0.3)]", icon: Trophy },
  rare: { color: "text-blue-300 border-blue-600/50", glow: "shadow-[0_0_20px_rgba(59,130,246,0.4)]", icon: Sparkles },
  legendary: { color: "text-yellow-300 border-yellow-600/60", glow: "shadow-[0_0_25px_rgba(251,191,36,0.5)]", icon: Skull },
};

export function CursedAchievementsCard() {
  const { data: achievements, isLoading } = useCursedAchievements();

  return (
<Card className="p-5 bg-gradient-to-br from-[hsl(280,30%,8%)] to-[hsl(0,0%,4%)] border-red-900/30 mb-6">
  <FloatingHowItWorks title="CursedAchievementsCard — How it works" steps={[{title:"Open this section",desc:"Access CursedAchievementsCard from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
      <h3 className="text-xl font-black text-red-100 flex items-center gap-2 mb-4">
        <Skull className="w-5 h-5 text-yellow-400" />
        Cursed Achievements
      </h3>
      {isLoading ? (
        <p className="text-sm text-muted-foreground text-center py-4">Loading...</p>
      ) : !achievements?.length ? (
        <p className="text-sm text-muted-foreground text-center py-4">No cursed achievements yet. Win battles, spin the wheel, narrate stories.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {achievements.map((a, i) => {
            const style = RARITY_STYLES[a.rarity] || RARITY_STYLES.common;
            const Icon = style.icon;
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`relative p-3 rounded-xl border-2 bg-card/40 text-center ${style.color} ${style.glow}`}
              >
                <Icon className="w-8 h-8 mx-auto mb-1" />
                <p className="text-xs font-bold">{a.achievement_name}</p>
                <p className="text-[10px] uppercase mt-1 opacity-70">{a.rarity}</p>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
