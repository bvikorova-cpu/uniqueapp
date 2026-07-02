import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface LeaderEntry {
  referrer_id: string;
  full_name: string | null;
  avatar_url: string | null;
  referral_count: number;
  total_earnings: number;
}

interface Props {
  currentUserId?: string;
}

export const ReferralLeaderboard = ({ currentUserId }: Props) => {
  const [leaders, setLeaders] = useState<LeaderEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Aggregate referral earnings this month
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const { data: earnings } = await supabase
          .from("megatalent_referral_earnings")
          .select("referrer_id, amount")
          .gte("created_at", monthStart.toISOString());

        if (!earnings) {
          setLoading(false);
          return;
        }

        // Aggregate by referrer
        const map = new Map<string, { count: number; total: number }>();
        earnings.forEach((e: any) => {
          const cur = map.get(e.referrer_id) || { count: 0, total: 0 };
          cur.count += 1;
          cur.total += Number(e.amount);
          map.set(e.referrer_id, cur);
        });

        const ids = Array.from(map.keys());
        if (ids.length === 0) {
          setLoading(false);
          return;
        }

        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", ids);

        const merged: LeaderEntry[] = ids.map((id) => {
          const stats = map.get(id)!;
          const p = profiles?.find((pr: any) => pr.id === id);
          return {
            referrer_id: id,
            full_name: p?.full_name || null,
            avatar_url: p?.avatar_url || null,
            referral_count: stats.count,
            total_earnings: stats.total,
          };
        });

        merged.sort((a, b) => b.referral_count - a.referral_count);
        setLeaders(merged.slice(0, 10));
      } catch (e) {
        console.error("Leaderboard load error:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rankIcon = (i: number) => {
    if (i === 0) return <Crown className="h-4 w-4 text-yellow-400" />;
    if (i === 1) return <Medal className="h-4 w-4 text-zinc-300" />;
    if (i === 2) return <Award className="h-4 w-4 text-amber-600" />;
    return <span className="text-xs font-bold text-muted-foreground">#{i + 1}</span>;
  };

  return (
    <Card className="border-yellow-500/20 bg-card/80 backdrop-blur-xl">
      <FloatingHowItWorks
        title={"Referral Leaderboard"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          🏆 Top Referrers This Month
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-5 w-5 animate-spin text-yellow-500" />
          </div>
        ) : leaders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            Be the first one this month! 🚀
          </p>
        ) : (
          <div className="space-y-2">
            {leaders.map((leader, i) => {
              const isMe = leader.referrer_id === currentUserId;
              return (
                <motion.div
                  key={leader.referrer_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                    isMe
                      ? "bg-yellow-500/15 border-yellow-500/40 ring-1 ring-yellow-500/30"
                      : i < 3
                      ? "bg-yellow-500/5 border-yellow-500/15"
                      : "bg-background/40 border-border/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-background/60 border border-border/40">
                      {rankIcon(i)}
                    </div>
                    {leader.avatar_url ? (
                      <img
                        src={leader.avatar_url}
                        alt={leader.full_name || "User"}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center text-black text-xs font-bold shrink-0">
                        {leader.full_name?.charAt(0) || "?"}
                      </div>
                    )}
                    <span className="font-semibold text-sm truncate">
                      {isMe ? "You" : leader.full_name || "Anonymous"}
                    </span>
                    {isMe && (
                      <Badge className="bg-yellow-500 text-black text-[10px] px-1.5 py-0">
                        ME
                      </Badge>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-sm">{leader.referral_count}</div>
                    <div className="text-[10px] text-muted-foreground">
                      €{leader.total_earnings.toFixed(0)}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
