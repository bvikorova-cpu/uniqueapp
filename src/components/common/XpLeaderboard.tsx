import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trophy, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Row {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  total_xp: number;
  entries: number;
}

interface Props {
  /** XP source prefix, e.g. "holographic_battle" or "time_reversal_battle". */
  sourcePrefix: string;
  title?: string;
  limit?: number;
  /** Bump this value to force a reload (e.g. after a battle). */
  reloadKey?: number;
}

/** Real XP leaderboard — aggregated from the platform-wide XP ledger. */
export const XpLeaderboard = ({ sourcePrefix, title = "XP Leaderboard", limit = 10, reloadKey = 0 }: Props) => {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setMe(user?.id ?? null);
      const { data, error } = await supabase.rpc("get_module_xp_leaderboard", {
        _source_prefix: sourcePrefix,
        _limit: limit,
      });
      if (error) throw error;
      setRows(((data as unknown as Row[]) ?? []).map((r) => ({ ...r, total_xp: Number(r.total_xp), entries: Number(r.entries) })));
    } catch (e) {
      console.error("XpLeaderboard", e);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [sourcePrefix, limit]);

  useEffect(() => { load(); }, [load, reloadKey]);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="h-5 w-5 text-amber-400" /> {title}
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={load} aria-label="Refresh leaderboard">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-10 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
        ) : rows.length === 0 ? (
          <p className="text-center py-6 text-sm text-muted-foreground">
            No XP earned here yet — win a battle to open the leaderboard.
          </p>
        ) : (
          <ol className="space-y-2">
            {rows.map((r, i) => (
              <li
                key={r.user_id}
                className={`flex items-center gap-3 rounded-xl border p-2.5 ${
                  r.user_id === me ? "border-primary/40 bg-primary/5" : "border-border/40 bg-card/50"
                }`}
              >
                <span
                  className={`w-7 text-center text-lg font-black ${
                    i === 0 ? "text-amber-400" : i === 1 ? "text-muted-foreground" : i === 2 ? "text-amber-600" : "text-muted-foreground/70"
                  }`}
                >
                  {i + 1}
                </span>
                <Avatar className="h-9 w-9">
                  {r.avatar_url && <AvatarImage src={r.avatar_url} alt={r.display_name ?? "Player"} />}
                  <AvatarFallback>{(r.display_name ?? "P").slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {r.display_name ?? "Player"}{r.user_id === me ? " (you)" : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{r.entries} win{r.entries === 1 ? "" : "s"}</p>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-500/30">{r.total_xp} XP</Badge>
              </li>
            ))}
          </ol>
        )}
      </CardContent>
    </Card>
  );
};
