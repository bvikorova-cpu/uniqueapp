import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Flame, Trophy, Star } from "lucide-react";
import { useVotingStreak } from "@/hooks/useVotingStreak";
import { useMegatalentContestStats } from "@/hooks/useMegatalentContestStats";

interface Props {
  totalVotes: number;
  subscriptionTier: 'premium' | 'top_premium' | null;
}

const MegatalentEngagementRow = ({ totalVotes, subscriptionTier }: Props) => {
  const { data: streak } = useVotingStreak();
  const { data: stats } = useMegatalentContestStats();

  const streakDays = streak?.currentStreak ?? 0;
  const longest = streak?.longestStreak ?? 0;
  const categoryCount = stats?.categoryCount ?? 0;
  const activeTalents = stats?.activeTalents ?? 0;

  const items = [
    {
      icon: Flame,
      label: "Voting Streak",
      value: `${streakDays} ${streakDays === 1 ? "day" : "days"}`,
      sub: longest > 0 ? `Longest: ${longest} days` : "Vote daily to start a streak",
      color: "text-orange-500",
    },
    {
      icon: Trophy,
      label: "Your Votes",
      value: totalVotes.toLocaleString(),
      sub: subscriptionTier === "top_premium"
        ? "TOP Premium — real votes × 2 in ranking"
        : subscriptionTier === "premium"
          ? "Premium tier"
          : "Subscribe to enter the contest",
      color: "text-yellow-500",
    },
    {
      icon: Star,
      label: "Categories",
      value: categoryCount ? `${categoryCount}` : "—",
      sub: activeTalents
        ? `${activeTalents.toLocaleString()} active talents`
        : "Talent categories available",
      color: "text-amber-500",
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
      {items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
          <Card className="bg-card/80 backdrop-blur-xl border-yellow-500/10 hover:border-yellow-500/30 transition-all">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <item.icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="font-bold text-sm">{item.value}</p>
                <p className="text-[10px] text-muted-foreground">{item.sub}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default MegatalentEngagementRow;
