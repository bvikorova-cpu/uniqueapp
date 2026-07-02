import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Crown, Shield, Sword, Star, Gem, Flame } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

const RANK_TIERS = [
  { key: "bronze", name: "Bronze", min: 0, color: "from-amber-700 to-amber-900", border: "ring-amber-600", icon: Shield, emoji: "🥉" },
  { key: "silver", name: "Silver", min: 100, color: "from-gray-300 to-gray-500", border: "ring-gray-400", icon: Sword, emoji: "🥈" },
  { key: "gold", name: "Gold", min: 300, color: "from-yellow-400 to-amber-500", border: "ring-yellow-400", icon: Star, emoji: "🥇" },
  { key: "platinum", name: "Platinum", min: 600, color: "from-cyan-300 to-blue-500", border: "ring-cyan-400", icon: Gem, emoji: "💎" },
  { key: "diamond", name: "Diamond", min: 1000, color: "from-violet-400 to-purple-600", border: "ring-violet-400", icon: Crown, emoji: "👑" },
  { key: "grandmaster", name: "Grandmaster", min: 2000, color: "from-red-500 to-orange-500", border: "ring-red-500", icon: Flame, emoji: "🔥" },
];

const getRankForPoints = (points: number) => {
  for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
    if (points >= RANK_TIERS[i].min) return RANK_TIERS[i];
  }
  return RANK_TIERS[0];
};

const getNextRank = (points: number) => {
  for (const tier of RANK_TIERS) {
    if (points < tier.min) return tier;
  }
  return null;
};

export const RankAvatarSystem = () => {
  const [rankData, setRankData] = useState<{ rank_tier: string; rank_points: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data } = await supabase
        .from("brain_duel_rank_avatars")
        .select("rank_tier, rank_points")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setRankData(data);
      } else {
        // Create initial rank
        await supabase.from("brain_duel_rank_avatars").insert({ user_id: user.id, rank_tier: "bronze", rank_points: 0 });
        setRankData({ rank_tier: "bronze", rank_points: 0 });
      }
      setLoading(false);
    };
    load();
  }, []);

  if (loading || !rankData) return null;

  const currentRank = getRankForPoints(rankData.rank_points);
  const nextRank = getNextRank(rankData.rank_points);
  const Icon = currentRank.icon;
  const progress = nextRank
    ? ((rankData.rank_points - currentRank.min) / (nextRank.min - currentRank.min)) * 100
    : 100;

  return (
    <>
      <FloatingHowItWorks title={"Rank Avatar System - How it works"} steps={[{ title: 'Open', desc: 'Access the Rank Avatar System section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Rank Avatar System.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-primary/20 backdrop-blur-xl bg-card/80 overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${currentRank.color} opacity-5`} />
      <CardHeader className="relative pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className="h-4 w-4" />
          Rank Avatar
        </CardTitle>
      </CardHeader>
      <CardContent className="relative">
        <div className="flex items-center gap-4">
          <motion.div
            animate={currentRank.key === "grandmaster" ? { rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Avatar className={`h-16 w-16 ring-4 ${currentRank.border} shadow-lg`}>
              <AvatarFallback className={`bg-gradient-to-br ${currentRank.color} text-white text-2xl font-black`}>
                {currentRank.emoji}
              </AvatarFallback>
            </Avatar>
          </motion.div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge className={`bg-gradient-to-r ${currentRank.color} text-white border-0 shadow-md`}>
                {currentRank.name}
              </Badge>
              <span className="text-xs text-muted-foreground">{rankData.rank_points} RP</span>
            </div>
            {nextRank ? (
              <>
                <div className="h-2 rounded-full bg-muted/50 overflow-hidden mb-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full bg-gradient-to-r ${currentRank.color}`}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {nextRank.min - rankData.rank_points} RP to {nextRank.emoji} {nextRank.name}
                </p>
              </>
            ) : (
              <p className="text-xs text-primary font-semibold">🏆 Maximum Rank Achieved!</p>
            )}
          </div>
        </div>

        {/* All ranks preview */}
        <div className="flex gap-1.5 mt-4 justify-center">
          {RANK_TIERS.map((tier) => {
            const isUnlocked = rankData.rank_points >= tier.min;
            const isCurrent = tier.key === currentRank.key;
            return (
              <motion.div
                key={tier.key}
                whileHover={{ scale: 1.2 }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  isCurrent ? `bg-gradient-to-br ${tier.color} ring-2 ring-white/50 shadow-lg` :
                  isUnlocked ? `bg-gradient-to-br ${tier.color} opacity-60` :
                  "bg-muted/30 opacity-30"
                }`}
                title={`${tier.name} (${tier.min} RP)`}
              >
                {tier.emoji}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
