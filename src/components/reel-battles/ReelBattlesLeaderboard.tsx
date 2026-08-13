import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Flame, Swords, Sparkles, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Row = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  duels: number;
  total_votes: number;
  wins: number;
  reel_xp: number;
};

const medal = (i: number) => (i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`);

export default function ReelBattlesLeaderboard({ currentUserId }: { currentUserId?: string | null }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data, error } = await supabase.rpc("get_reel_battles_leaderboard", { _limit: 20 });
    if (!error) setRows((data as Row[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("reel-battles-leaderboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "reel_battle_participants" }, () => load())
      .on("postgres_changes", { event: "*", schema: "public", table: "reel_battles" }, () => load())
      .subscribe();

    const interval = window.setInterval(load, 30000);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(interval);
    };
  }, [load]);

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" /> Live Leaderboard
          </span>
          <Badge variant="outline" className="gap-1 text-[10px] border-primary/40 text-primary">
            <Radio className="h-3 w-3 animate-pulse" /> LIVE
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading real-time standings…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No creators on the board yet — start a reel duel to appear here.
          </p>
        ) : (
          rows.map((r, i) => (
            <div
              key={r.user_id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                r.user_id === currentUserId
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/60 bg-secondary/20"
              }`}
            >
              <span className="w-8 text-center text-sm font-bold shrink-0">{medal(i)}</span>
              <Avatar className="h-9 w-9 shrink-0">
                <AvatarImage src={r.avatar_url || undefined} alt={r.display_name || "Creator"} />
                <AvatarFallback>{(r.display_name || "C").slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">
                  {r.display_name || "Creator"}
                  {r.user_id === currentUserId && <span className="text-primary text-xs ml-1">(you)</span>}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />{r.wins} wins</span>
                  <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-primary" />{r.total_votes} votes</span>
                  <span className="flex items-center gap-1"><Swords className="h-3 w-3" />{r.duels} duels</span>
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-primary" />{r.reel_xp} XP
              </span>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
