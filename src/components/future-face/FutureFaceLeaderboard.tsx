import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Award, User, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  rank: number;
  user_id: string;
  username: string;
  score: number;
  transformations: number;
  badge: string;
}

const getRankIcon = (rank: number) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Award className="h-5 w-5 text-amber-700" />;
  return <span className="text-sm font-bold text-muted-foreground w-5 text-center">#{rank}</span>;
};

const getRankBg = (rank: number) => {
  if (rank === 1) return "bg-gradient-to-r from-yellow-500/15 to-amber-500/10 border-yellow-500/30";
  if (rank === 2) return "bg-gradient-to-r from-gray-400/10 to-gray-500/5 border-gray-400/20";
  if (rank === 3) return "bg-gradient-to-r from-amber-700/10 to-amber-800/5 border-amber-700/20";
  return "border-border/30";
};

const badgeFor = (score: number) => {
  if (score >= 95) return "Crystal Legend";
  if (score >= 90) return "Diamond";
  if (score >= 80) return "Platinum";
  if (score >= 70) return "Gold";
  return "Silver";
};

export default function FutureFaceLeaderboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Aggregate: max score + count of analyses per user
      const { data } = await supabase
        .from("future_face_skin_scores")
        .select("user_id, score")
        .order("score", { ascending: false })
        .limit(500);

      const grouped = new Map<string, { score: number; count: number }>();
      (data || []).forEach((r: any) => {
        const g = grouped.get(r.user_id) || { score: 0, count: 0 };
        g.score = Math.max(g.score, Number(r.score) || 0);
        g.count += 1;
        grouped.set(r.user_id, g);
      });

      const top = Array.from(grouped.entries())
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 10);
      const ids = top.map(([id]) => id);
      const { data: profs } = ids.length
        ? await (supabase as any).from("profiles_public").select("id, full_name").in("id", ids)
        : { data: [] as any[] };
      const pmap = new Map<string, any>((profs || []).map((p: any) => [p.id, p.full_name]));

      const final: Row[] = top.map(([id, g], i) => ({
        rank: i + 1,
        user_id: id,
        username: pmap.get(id) || "User",
        score: g.score,
        transformations: g.count,
        badge: badgeFor(g.score),
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
    <div className="mb-8">
      <h2 className="text-xl sm:text-2xl font-black mb-4">🏆 Transformation Leaderboard</h2>
      <Card className="bg-gradient-to-br from-cyan-500/5 to-purple-500/5 border-cyan-500/20">
        <CardHeader className="p-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Skin Scores
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2">
          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-6">
              No scores yet. Be the first to analyze your skin!
            </p>
          ) : (
            rows.map((entry, i) => (
              <motion.div
                key={entry.user_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`flex items-center gap-3 p-2.5 rounded-lg border ${getRankBg(entry.rank)}`}
              >
                <div className="flex items-center justify-center w-8">{getRankIcon(entry.rank)}</div>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <div className="p-1.5 rounded-full bg-muted">
                    <User className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{entry.username}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.transformations} analyses</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] shrink-0">
                  {entry.badge}
                </Badge>
                <div className="text-right shrink-0">
                  <p className="text-sm font-black text-cyan-500">{entry.score}</p>
                  <p className="text-[9px] text-muted-foreground">Score</p>
                </div>
              </motion.div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
