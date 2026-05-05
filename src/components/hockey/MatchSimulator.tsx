import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { spendSportCoins } from "@/lib/sportCoins";
import { BattleResult } from "@/components/sports/BattleResult";
import { computeBattlePower, opponentPower } from "@/lib/battlePower";

export function MatchSimulator({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("hockey_teams").select("*").eq("user_id", user.id).single().then(({ data }) => setTeam(data));
  }, [user]);

  const simulate = async () => {
    if (!user || !team) { toast.error("Create a team first!"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data: coins } = await supabase.from("hockey_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < 300) { toast.error("Need 300 coins!"); return; }

      const { data: players } = await supabase.from("hockey_players").select("*").eq("user_id", user.id).eq("is_starter", true);
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Simulate an ice hockey match. My team: "${team.name}" (${team.playstyle}), players: ${(players || []).map(p => `${p.name}(${p.position},OVR:${p.overall_rating})`).join(", ")}. Generate result as JSON: {"opponent_name": "<creative team name>", "home_score": <0-8>, "away_score": <0-8>, "periods": [{"p": 1, "home": <num>, "away": <num>}, {"p": 2, "home": <num>, "away": <num>}, {"p": 3, "home": <num>, "away": <num>}], "mvp": "<player name>", "mvp_stats": "<goals/assists/+- line>", "highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"], "coins_reward": <100-500>}`,
          type: "hockey_match"
        }
      });
      if (error) throw error;

      const jsonMatch = data.response?.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Simulation failed");
      const matchResult = JSON.parse(jsonMatch[0]);

      const won = matchResult.home_score > matchResult.away_score;
      const home_power = computeBattlePower(players || [], team, matchResult.home_score);
      const away_power = opponentPower(matchResult.away_score);
      const spendRes = await spendSportCoins("hockey_coins", 300, matchResult.coins_reward || 0);
      if (!spendRes.ok) { toast.error("Need 300 coins!"); return; }
      await supabase.from("hockey_teams").update({ wins: team.wins + (won ? 1 : 0), losses: team.losses + (won ? 0 : 1) }).eq("id", team.id);
      await supabase.from("hockey_matches").insert({ home_team_id: team.id, home_score: matchResult.home_score, away_score: matchResult.away_score, period_scores: matchResult.periods, coins_reward: matchResult.coins_reward, status: "completed" });

      const breakdown = (matchResult.periods || []).map((p: any) => ({ label: `P${p.p}`, home: p.home, away: p.away }));
      setResult({ ...matchResult, won, home_power, away_power, breakdown });
      toast.success(won ? "Victory! 🏆" : "Defeat! Better luck next time.");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Swords className="h-5 w-5 text-primary" />Match Simulator <span className="text-xs text-muted-foreground">(300 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {team ? <p className="text-sm">Playing as: <strong>{team.name}</strong> ({team.playstyle})</p> : <p className="text-sm text-muted-foreground">Create a team first!</p>}
          <Button className="w-full" onClick={simulate} disabled={loading || !team}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Simulating...</> : "Play Match (300 coins)"}
          </Button>
          {result && (
            <div className={`p-4 rounded-lg border ${result.won ? "bg-emerald-500/10 border-emerald-500/30" : "bg-red-500/10 border-red-500/30"}`}>
              <div className="text-center mb-3">
                <span className="text-2xl font-black">{result.home_score} - {result.away_score}</span>
                <p className="text-sm text-muted-foreground">vs {result.opponent_name}</p>
                <p className={`font-bold ${result.won ? "text-emerald-400" : "text-red-400"}`}>{result.won ? "VICTORY" : "DEFEAT"}</p>
              </div>
              {result.periods && <div className="flex justify-center gap-4 text-xs mb-3">{result.periods.map((p: any, i: number) => <span key={i}>P{p.p}: {p.home}-{p.away}</span>)}</div>}
              <p className="text-sm text-center">🏅 MVP: {result.mvp} ({result.mvp_stats})</p>
              <div className="mt-2 space-y-1">{result.highlights?.map((h: string, i: number) => <p key={i} className="text-xs text-muted-foreground">• {h}</p>)}</div>
              <p className="text-center text-sm mt-2 text-primary">+{result.coins_reward} coins earned!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
