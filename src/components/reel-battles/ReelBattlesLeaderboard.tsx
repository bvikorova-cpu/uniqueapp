import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Flame, Swords, Sparkles, Radio } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ChampionBadge from "@/components/battle-coins/ChampionBadge";
import { useChampionBadges, championRankClasses } from "@/hooks/useChampionBadges";
import { useEquippedCosmetics } from "@/hooks/useEquippedCosmetics";

type Row = {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  duels: number;
  total_votes: number;
  wins: number;
  reel_xp: number;
  rank: number;
};

type MyRank = {
  rank: number;
  points: number;
  wins: number;
  total_votes: number;
  duels: number;
  total_participants: number;
};

const medal = (rank: number) => (rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`);

// Refresh throttle: with very large user counts we never want a vote storm to
// trigger one request per event — coalesce into at most one load per window.
const MIN_RELOAD_MS = 10000;

export default function ReelBattlesLeaderboard({ currentUserId }: { currentUserId?: string | null }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [me, setMe] = useState<MyRank | null>(null);
  const [loading, setLoading] = useState(true);
  const lastLoad = useRef(0);
  const pending = useRef<number | null>(null);

  const load = useCallback(async () => {
    lastLoad.current = Date.now();
    const [{ data, error }, mine] = await Promise.all([
      supabase.rpc("get_reel_battles_leaderboard", { _limit: 20 }),
      currentUserId
        ? supabase.rpc("get_my_battle_leaderboard_rank", { _board: "reel_battles" })
        : Promise.resolve({ data: null, error: null } as any),
    ]);
    if (!error) setRows((data as Row[]) || []);
    const mineRow = Array.isArray(mine?.data) ? (mine.data[0] as MyRank | undefined) : null;
    setMe(mineRow ?? null);
    setLoading(false);
  }, [currentUserId]);

  const scheduleLoad = useCallback(() => {
    if (pending.current) return;
    const wait = Math.max(0, MIN_RELOAD_MS - (Date.now() - lastLoad.current));
    pending.current = window.setTimeout(() => {
      pending.current = null;
      void load();
    }, wait);
  }, [load]);

  useEffect(() => {
    load();
    const channel = supabase
      .channel("reel-battles-leaderboard")
      .on("postgres_changes", { event: "*", schema: "public", table: "reel_battle_participants" }, scheduleLoad)
      .on("postgres_changes", { event: "*", schema: "public", table: "reel_battles" }, scheduleLoad)
      .subscribe();

    const interval = window.setInterval(load, 60000);
    return () => {
      supabase.removeChannel(channel);
      window.clearInterval(interval);
      if (pending.current) window.clearTimeout(pending.current);
    };
  }, [load, scheduleLoad]);

  const champBadges = useChampionBadges(rows.map((r) => r.user_id));
  // Equipped Battle Coins cosmetics: frame ring on the avatar, sticker + badge next to the name.
  const cosmetics = useEquippedCosmetics(rows.map((r) => r.user_id));
  const inTop = rows.some((r) => r.user_id === currentUserId);

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
        <p className="text-[11px] text-muted-foreground">
          Ranked by real points earned (XP from duel wins){me ? ` · ${me.total_participants.toLocaleString()} creators ranked` : ""}
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {loading ? (
          <p className="text-sm text-muted-foreground text-center py-4">Loading real-time standings…</p>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No creators on the board yet — start a reel duel to appear here.
          </p>
        ) : (
          rows.map((r) => (
            <div
              key={r.user_id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border ${
                r.user_id === currentUserId
                  ? "border-primary/50 bg-primary/10"
                  : "border-border/60 bg-secondary/20"
              }`}
            >
              <span className="w-8 text-center text-sm font-bold shrink-0">{medal(Number(r.rank))}</span>
              <Avatar className={`h-9 w-9 shrink-0 ${championRankClasses(champBadges[r.user_id]?.rank).ring || cosmetics[r.user_id]?.frame?.css_class || ""}`}>
                <AvatarImage src={r.avatar_url || undefined} alt={r.display_name || "Creator"} />
                <AvatarFallback>{(r.display_name || "C").slice(0, 1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold truncate flex items-center gap-1.5 ${championRankClasses(champBadges[r.user_id]?.rank).text}`}>
                  <span className="truncate">{r.display_name || "Creator"}</span>
                  <ChampionBadge badge={champBadges[r.user_id]} />
                  {cosmetics[r.user_id]?.badge && (
                    <span title={cosmetics[r.user_id]!.badge!.name} aria-label={cosmetics[r.user_id]!.badge!.name}>
                      {cosmetics[r.user_id]!.badge!.preview}
                    </span>
                  )}
                  {cosmetics[r.user_id]?.sticker && (
                    <span title={cosmetics[r.user_id]!.sticker!.name} aria-label={cosmetics[r.user_id]!.sticker!.name}>
                      {cosmetics[r.user_id]!.sticker!.preview}
                    </span>
                  )}
                  {r.user_id === currentUserId && <span className="text-primary text-xs ml-1">(you)</span>}
                </p>
                <p className="text-[11px] text-muted-foreground flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1"><Trophy className="h-3 w-3" />{r.wins} wins</span>
                  <span className="flex items-center gap-1"><Flame className="h-3 w-3 text-primary" />{r.total_votes} votes</span>
                  <span className="flex items-center gap-1"><Swords className="h-3 w-3" />{r.duels} duels</span>
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold shrink-0">
                <Sparkles className="h-3.5 w-3.5 text-primary" />{r.reel_xp} pts
              </span>
            </div>
          ))
        )}

        {me && !inTop && (
          <div className="flex items-center gap-3 p-2.5 rounded-xl border border-primary/50 bg-primary/10">
            <span className="w-8 text-center text-sm font-bold shrink-0">#{me.rank}</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Your position</p>
              <p className="text-[11px] text-muted-foreground">
                {me.wins} wins · {me.total_votes} votes · {me.duels} duels
              </p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-primary" />{me.points} pts
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
