import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Brain, Trophy, Swords, Flame, ArrowLeft, Loader2, Medal, Crown } from "lucide-react";

interface Stats {
  best_iq: number | null;
  latest_iq: number | null;
  total_tests: number | null;
  current_streak: number | null;
  longest_streak: number | null;
  tier: string | null;
  country_code: string | null;
}

interface DuelWin {
  id: string;
  mode: string;
  finished_at: string | null;
  host_id: string;
  opponent_id: string | null;
  host_score: number;
  opponent_score: number;
}

interface TourneyWin {
  id: string;
  round: number;
  completed_at: string | null;
}

const tierColor: Record<string, string> = {
  novice: "from-slate-500 to-slate-700",
  bronze: "from-amber-700 to-amber-900",
  silver: "from-slate-300 to-slate-500",
  gold: "from-yellow-400 to-amber-600",
  platinum: "from-cyan-300 to-blue-500",
  diamond: "from-fuchsia-400 to-purple-600",
  master: "from-pink-500 to-rose-600",
  grandmaster: "from-purple-600 to-indigo-800",
};

export default function IQTrophyProfile() {
  const { userId } = useParams<{ userId: string }>();
  const [name, setName] = useState<string>("Player");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [duelWins, setDuelWins] = useState<DuelWin[]>([]);
  const [tourneyWins, setTourneyWins] = useState<TourneyWin[]>([]);
  const [duelsPlayed, setDuelsPlayed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let alive = true;
    (async () => {
      const [profileRes, statsRes, winsRes, playedRes, tourneyRes] = await Promise.all([
        supabase.from("profiles_public" as any).select("full_name,avatar_url").eq("id", userId).maybeSingle(),
        supabase.from("iq_user_stats").select("best_iq,latest_iq,total_tests,current_streak,longest_streak,tier,country_code").eq("user_id", userId).maybeSingle(),
        supabase.from("iq_duels").select("id,mode,finished_at,host_id,opponent_id,host_score,opponent_score").eq("status", "finished").eq("winner_id", userId).order("finished_at", { ascending: false }).limit(10),
        supabase.from("iq_duels").select("id", { count: "exact", head: true }).eq("status", "finished").or(`host_id.eq.${userId},opponent_id.eq.${userId}`),
        supabase.from("iq_tournament_matches").select("id,round,completed_at").eq("winner_id", userId).eq("status", "finished").order("completed_at", { ascending: false }).limit(10),
      ]);

      if (!alive) return;
      setName(profileRes.data?.full_name ?? "Player");
      setAvatar(profileRes.data?.avatar_url ?? null);
      setStats((statsRes.data as Stats) ?? null);
      setDuelWins((winsRes.data ?? []) as DuelWin[]);
      setDuelsPlayed(playedRes.count ?? 0);
      setTourneyWins(((tourneyRes.data ?? []) as TourneyWin[]));
      setLoading(false);
    })();
    return () => { alive = false; };
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-purple-500" />
      </div>
    );
  }

  const tier = stats?.tier ?? "novice";
  const winRate = duelsPlayed > 0 ? Math.round((duelWins.length / duelsPlayed) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-purple-950/10 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <Link to="/iq-platform">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to IQ Platform
          </Button>
        </Link>

        {/* Hero card */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Card className={`relative overflow-hidden border-purple-500/30 bg-gradient-to-br ${tierColor[tier] ?? tierColor.novice} text-white`}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <CardContent className="relative p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-5">
              <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-4xl font-black border-4 border-white/30 overflow-hidden">
                {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : name[0]?.toUpperCase()}
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl sm:text-4xl font-black flex items-center gap-2 justify-center sm:justify-start">
                  {name}
                  {tourneyWins.length > 0 && <Crown className="h-7 w-7 text-yellow-300" />}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2 justify-center sm:justify-start">
                  <Badge className="bg-white/20 backdrop-blur capitalize border-white/30">{tier}</Badge>
                  {stats?.country_code && <Badge variant="outline" className="border-white/30 text-white">{stats.country_code}</Badge>}
                </div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-black">{stats?.best_iq ?? "—"}</div>
                <div className="text-xs uppercase tracking-wider opacity-80">Best IQ</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {[
            { icon: Brain, label: "Latest IQ", value: stats?.latest_iq ?? "—" },
            { icon: Trophy, label: "Tests", value: stats?.total_tests ?? 0 },
            { icon: Flame, label: "Streak", value: `${stats?.current_streak ?? 0}🔥` },
            { icon: Medal, label: "Longest", value: stats?.longest_streak ?? 0 },
          ].map((s, i) => (
            <Card key={i} className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <CardContent className="p-3 text-center">
                <s.icon className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                <div className="text-xl font-black">{s.value}</div>
                <div className="text-[10px] text-muted-foreground uppercase">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Duel record */}
        <Card className="mt-4 border-purple-500/20">
          <CardContent className="p-5">
            <h2 className="font-black flex items-center gap-2 mb-3"><Swords className="h-4 w-4 text-pink-500" /> Duel Record</h2>
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <div><span className="text-2xl font-black text-green-500">{duelWins.length}</span> <span className="text-xs text-muted-foreground">wins</span></div>
              <div><span className="text-2xl font-black">{duelsPlayed}</span> <span className="text-xs text-muted-foreground">played</span></div>
              <div><span className="text-2xl font-black text-purple-500">{winRate}%</span> <span className="text-xs text-muted-foreground">win rate</span></div>
            </div>
            {duelWins.length === 0 ? (
              <p className="text-xs text-muted-foreground">No duel wins yet.</p>
            ) : (
              <div className="space-y-1">
                {duelWins.slice(0, 5).map((d) => {
                  const my = d.host_id === userId ? d.host_score : d.opponent_score;
                  const opp = d.host_id === userId ? d.opponent_score : d.host_score;
                  return (
                    <div key={d.id} className="flex items-center justify-between p-2 rounded bg-muted/30 text-xs">
                      <Badge variant="outline" className="capitalize text-[10px]">{d.mode}</Badge>
                      <span className="font-bold">{my} – {opp}</span>
                      <span className="text-muted-foreground">
                        {d.finished_at ? new Date(d.finished_at).toLocaleDateString() : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tournament wins */}
        {tourneyWins.length > 0 && (
          <Card className="mt-4 border-yellow-500/30 bg-gradient-to-br from-yellow-500/5 to-amber-500/5">
            <CardContent className="p-5">
              <h2 className="font-black flex items-center gap-2 mb-3"><Crown className="h-4 w-4 text-yellow-500" /> Tournament Victories</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {tourneyWins.map((m) => (
                  <div key={m.id} className="p-2 rounded bg-muted/30 text-center text-xs">
                    <div className="font-bold">Round {m.round}</div>
                    <div className="text-muted-foreground">
                      {m.completed_at ? new Date(m.completed_at).toLocaleDateString() : ""}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
