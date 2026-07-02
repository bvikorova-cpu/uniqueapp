import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Medal, Award, History, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface WinnerRow {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  weekly_xp: number;
  view_count: number;
  bonus_xp: number;
  week_start: string;
}

const rankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
};

const rankBg = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/15 to-amber-500/10 border-yellow-500/30";
  if (rank === 2) return "bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/20";
  if (rank === 3) return "bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700/20";
  return "border-border/30";
};

export const LastWeekWinners = () => {
  const { data: winners, isLoading } = useQuery<WinnerRow[]>({
    queryKey: ["last-week-xp-winners"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_last_week_xp_winners");
      if (error) throw error;
      return (data as WinnerRow[]) || [];
    },
  });

  if (isLoading) return null;
  if (!winners || winners.length === 0) return null;

  const weekLabel = new Date(winners[0].week_start).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Card className="bg-gradient-to-br from-amber-500/5 to-orange-500/5 border-amber-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <History className="h-5 w-5 text-amber-500" />
            Last Week's Champions
          </CardTitle>
          <Badge variant="outline" className="text-[10px]">Week of {weekLabel}</Badge>
        </div>
        <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" />
          Top 3 received bonus XP: 100 / 50 / 25
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {winners.map((w, i) => (
          <motion.div
            key={w.user_id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            className={`flex items-center gap-3 p-2.5 rounded-lg border ${rankBg(w.rank)}`}
          >
            <div className="flex items-center justify-center w-8">{rankIcon(w.rank)}</div>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {w.avatar_url ? (
                <img src={w.avatar_url} alt={w.display_name} className="h-8 w-8 rounded-full object-cover" loading="lazy" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-xs font-bold">
                  {w.display_name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-bold truncate">{w.display_name}</p>
                <p className="text-[10px] text-muted-foreground">{w.view_count} views</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-amber-600 dark:text-amber-400">
                {w.weekly_xp.toLocaleString()} XP
              </p>
              {w.bonus_xp > 0 && (
                <p className="text-[9px] text-green-600 dark:text-green-400 font-bold">+{w.bonus_xp} bonus</p>
              )}
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
