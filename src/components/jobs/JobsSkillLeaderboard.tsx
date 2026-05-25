import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, TrendingUp, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  rank: number;
  user_id: string;
  name: string;
  score: number;
  badge: string;
}

const badgeFor = (rank: number) => {
  if (rank === 1) return "👑";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  if (rank <= 5) return "⭐";
  if (rank <= 7) return "🔥";
  return "💪";
};

export default function JobsSkillLeaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("hub_xp")
        .select("user_id, xp")
        .eq("hub", "jobs")
        .order("xp", { ascending: false })
        .limit(10);

      let src = data || [];
      if (src.length === 0) {
        const { data: fallback } = await supabase
          .from("user_xp")
          .select("user_id, total_xp")
          .order("total_xp", { ascending: false })
          .limit(10);
        src = (fallback || []).map((r: any) => ({ user_id: r.user_id, xp: r.total_xp }));
      }

      const ids = src.map((r: any) => r.user_id);
      const { data: profs } = ids.length
        ? await (supabase as any).from("profiles_public").select("id, full_name").in("id", ids)
        : { data: [] as any[] };
      const pmap = new Map((profs || []).map((p: any) => [p.id, p.full_name]));

      const final: Row[] = src.map((r: any, i: number) => ({
        rank: i + 1,
        user_id: r.user_id,
        name: pmap.get(r.user_id) || "User",
        score: Number(r.xp) || 0,
        badge: badgeFor(i + 1),
      }));

      if (!cancelled) {
        setRows(final);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl sm:text-2xl font-black">🏆 Skill Leaderboard</h2>
      <p className="text-sm text-muted-foreground">
        Top candidates ranked by skill XP and activity
      </p>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : rows.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            No candidates yet — complete your profile and skill assessments to appear here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rows.map((leader, i) => (
            <motion.div
              key={leader.user_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Card
                className={`border-border/30 ${
                  leader.rank <= 3
                    ? "bg-gradient-to-r from-amber-500/10 to-yellow-500/5 border-amber-500/30"
                    : "bg-card/80"
                }`}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="text-2xl w-10 text-center">{leader.badge}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm truncate">{leader.name}</p>
                      {leader.rank === 1 && <Crown className="h-4 w-4 text-amber-400" />}
                    </div>
                    <div className="mt-1">
                      <Badge variant="outline" className="text-[9px] py-0">
                        Rank #{leader.rank}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm">{leader.score.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 justify-end">
                      <TrendingUp className="h-3 w-3" /> XP
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
