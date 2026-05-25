import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Medal, Crown, TrendingUp, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Row {
  rank: number;
  user_id: string;
  name: string;
  avatar_url: string | null;
  score: number;
}

export default function WallEngagementLeaderboard() {
  const [period, setPeriod] = useState("alltime");
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<{ rank: number | null; score: number }>({ rank: null, score: 0 });
  const { user } = useAuth();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from("user_xp")
        .select("user_id, total_xp")
        .order("total_xp", { ascending: false })
        .limit(50);

      const ids = (data || []).map((r: any) => r.user_id);
      const { data: profs } = ids.length
        ? await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", ids)
        : { data: [] as any[] };
      const pmap = new Map((profs || []).map((p: any) => [p.id, p]));

      const top: Row[] = (data || []).slice(0, 10).map((r: any, i: number) => ({
        rank: i + 1,
        user_id: r.user_id,
        name: pmap.get(r.user_id)?.full_name || "User",
        avatar_url: pmap.get(r.user_id)?.avatar_url || null,
        score: Number(r.total_xp) || 0,
      }));

      let myRank: number | null = null;
      let myScore = 0;
      if (user) {
        const idx = (data || []).findIndex((r: any) => r.user_id === user.id);
        if (idx >= 0) {
          myRank = idx + 1;
          myScore = Number((data as any[])[idx].total_xp) || 0;
        } else {
          const { data: mine } = await supabase
            .from("user_xp")
            .select("total_xp")
            .eq("user_id", user.id)
            .maybeSingle();
          myScore = Number((mine as any)?.total_xp) || 0;
        }
      }

      if (!cancelled) {
        setRows(top);
        setMe({ rank: myRank, score: myScore });
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-5 w-5 text-amber-400" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />;
    return <span className="text-sm font-bold text-muted-foreground">#{rank}</span>;
  };

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-amber-500/20 to-yellow-500/10 border-amber-400/30";
    if (rank === 2) return "bg-gradient-to-r from-gray-300/20 to-gray-400/10 border-gray-300/30";
    if (rank === 3) return "bg-gradient-to-r from-amber-700/20 to-orange-800/10 border-amber-700/30";
    return "bg-muted/10 border-border/20";
  };

  return (
    <div className="space-y-4">
      <Card className="p-4 bg-card/80 backdrop-blur-md border-border/30">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-500" /> XP Rankings
          </h3>
          <Tabs value={period} onValueChange={setPeriod}>
            <TabsList className="h-8">
              <TabsTrigger value="alltime" className="text-xs px-3 h-7">All Time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {user && (
          <div className="mb-4 p-3 rounded-xl bg-gradient-to-r from-orange-500/15 to-teal-500/10 border border-orange-400/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-orange-500">
                  {me.rank ? `#${me.rank}` : "—"}
                </span>
                <span className="text-lg">👤</span>
                <div>
                  <p className="font-bold text-sm">You</p>
                  <p className="text-[10px] text-muted-foreground">Score: {me.score.toLocaleString()} XP</p>
                </div>
              </div>
              {me.rank && me.rank <= 10 && (
                <div className="flex items-center gap-1 text-green-500 text-xs font-bold">
                  <TrendingUp className="h-3 w-3" /> Top 10
                </div>
              )}
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : rows.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-8">No rankings yet — earn XP to appear here.</p>
        ) : (
          <div className="space-y-2">
            {rows.map((r, i) => (
              <motion.div
                key={r.user_id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-xl border ${getRankBg(r.rank)}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-7 flex justify-center">{getRankIcon(r.rank)}</div>
                  {r.avatar_url ? (
                    <img src={r.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <span className="text-xl">👤</span>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-sm truncate">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">XP</p>
                  </div>
                </div>
                <span className="text-sm font-black text-orange-500">{r.score.toLocaleString()}</span>
              </motion.div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
