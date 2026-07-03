import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Trophy, Calendar as CalIcon } from "lucide-react";

interface LeaderRow {
  user_id: string;
  days_completed: number;
  total_votes: number;
  rank: number;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

interface Winner {
  id: string;
  month_key: string;
  user_id: string;
  days_completed: number;
  total_votes: number;
  xp_awarded: number;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
}

const monthLabel = (key: string) => {
  const [y, m] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, 1).toLocaleString("en", { month: "long", year: "numeric" });
};

const currentMonthKey = () => new Date().toISOString().slice(0, 7);

// Build a list of last 24 months down to Jan 2026 (safe lower bound).
const buildMonthOptions = () => {
  const out: string[] = [];
  const now = new Date();
  for (let i = 0; i < 24; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(d.toISOString().slice(0, 7));
  }
  return out;
};

export default function HealthyChallengeHistory() {
  const [monthOptions] = useState<string[]>(buildMonthOptions());
  const [selected, setSelected] = useState<string>(currentMonthKey());
  const [leaderboard, setLeaderboard] = useState<LeaderRow[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: lb } = await (supabase as any).rpc("get_healthy_leaderboard", { _month_key: selected, _limit: 50 });
      const ids = Array.from(new Set((lb || []).map((r: any) => r.user_id)));
      let pmap = new Map<string, any>();
      if (ids.length) {
        const { data: p } = await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", ids);
        pmap = new Map((p || []).map((x: any) => [x.id, x]));
      }
      setLeaderboard((lb || []).map((r: any) => ({ ...r, profile: pmap.get(r.user_id) })));
      setLoading(false);
    })();
  }, [selected]);

  useEffect(() => {
    (async () => {
      const { data: w } = await (supabase as any)
        .from("healthy_monthly_winners")
        .select("*")
        .order("month_key", { ascending: false })
        .limit(48);
      const wRows = (w || []) as Winner[];
      const ids = Array.from(new Set(wRows.map((r) => r.user_id)));
      let pmap = new Map<string, any>();
      if (ids.length) {
        const { data: p } = await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", ids);
        pmap = new Map((p || []).map((x: any) => [x.id, x]));
      }
      setWinners(wRows.map((r) => ({ ...r, profile: pmap.get(r.user_id) })));
    })();
  }, []);

  const isCurrent = selected === currentMonthKey();

  const winnerOfSelected = useMemo(
    () => winners.find((w) => w.month_key === selected) || null,
    [winners, selected],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-rose-50 to-sky-50 dark:from-orange-950/40 dark:via-rose-950/40 dark:to-sky-950/40">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center justify-between mb-4">
          <Link to="/healthy-challenge">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
          <Badge className="bg-orange-600">💪 Healthy Challenge</Badge>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black mb-1">Monthly History & Champions</h1>
        <p className="text-sm text-muted-foreground mb-4">Browse leaderboards across past months and see who won the 100,000&nbsp;XP prize.</p>

        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <CalIcon className="w-4 h-4" /> Leaderboard for {monthLabel(selected)} {isCurrent && <Badge variant="secondary" className="ml-1">Live</Badge>}
            </CardTitle>
            <Select value={selected} onValueChange={setSelected}>
              <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {monthOptions.map((m) => (
                  <SelectItem key={m} value={m}>{monthLabel(m)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardHeader>
          <CardContent>
            {winnerOfSelected && (
              <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 flex items-center gap-3">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <div className="flex-1">
                  <p className="font-semibold">🏆 Champion: {winnerOfSelected.profile?.full_name || "User"}</p>
                  <p className="text-xs text-muted-foreground">
                    {winnerOfSelected.days_completed} days · {winnerOfSelected.total_votes} votes · +{winnerOfSelected.xp_awarded.toLocaleString()} XP
                  </p>
                </div>
              </div>
            )}
            {loading ? (
              <p className="text-center text-muted-foreground py-6">Loading…</p>
            ) : leaderboard.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">No entries for this month.</p>
            ) : (
              <ol className="space-y-2">
                {leaderboard.map((r) => (
                  <li key={r.user_id} className={`flex items-center gap-3 p-3 rounded-lg ${r.rank <= 3 ? "bg-gradient-to-r from-yellow-100 to-transparent dark:from-yellow-900/30" : "bg-muted/50"}`}>
                    <span className="text-2xl w-8 text-center">{r.rank === 1 ? "🥇" : r.rank === 2 ? "🥈" : r.rank === 3 ? "🥉" : `#${r.rank}`}</span>
                    {r.profile?.avatar_url && <img src={r.profile.avatar_url} className="w-10 h-10 rounded-full" alt="" />}
                    <div className="flex-1">
                      <p className="font-semibold">{r.profile?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{r.days_completed} days · {r.total_votes} votes</p>
                    </div>
                    {r.rank === 1 && !isCurrent && <Badge className="bg-yellow-500">100k XP</Badge>}
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>All Past Champions</CardTitle></CardHeader>
          <CardContent>
            {winners.length === 0 ? (
              <p className="text-muted-foreground">No champions crowned yet — could be you next month!</p>
            ) : (
              <div className="space-y-2">
                {winners.map((w) => (
                  <button
                    key={w.id}
                    onClick={() => setSelected(w.month_key)}
                    className="w-full text-left flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition"
                  >
                    <Trophy className="w-6 h-6 text-yellow-500" />
                    {w.profile?.avatar_url && <img src={w.profile.avatar_url} className="w-9 h-9 rounded-full" alt="" />}
                    <div className="flex-1">
                      <p className="font-semibold">{monthLabel(w.month_key)} — {w.profile?.full_name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{w.days_completed} days · {w.total_votes} votes · +{w.xp_awarded.toLocaleString()} XP</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
