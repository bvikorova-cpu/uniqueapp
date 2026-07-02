import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2, Swords } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { BattleResult } from "@/components/sports/BattleResult";
import { computeBattlePower, opponentPower } from "@/lib/battlePower";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function MatchSimulator({ onBack }: { onBack: () => void }) {
  const { user } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase.from("tennis_teams").select("*").eq("user_id", user.id).single().then(({ data }) => setTeam(data));
  }, [user]);

  const simulate = async () => {
    if (!user || !team) { toast.error("Create a team first!"); return; }
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const { data: coins } = await supabase.from("tennis_coins").select("*").eq("user_id", user.id).single();
      if (!coins || coins.balance < 300) { toast.error("Need 300 coins!"); return; }

      const { data: players } = await supabase.from("tennis_players").select("*").eq("user_id", user.id).eq("is_starter", true);
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: {
          prompt: `Simulate a tennis match. My team: "${team.name}" (${team.playstyle}), players: ${(players || []).map(p => `${p.name}(${p.position},OVR:${p.overall_rating})`).join(", ")}. Generate result as JSON: {"opponent_name": "<creative player/team name>", "home_score": <0-3>, "away_score": <0-3>, "sets": [{"set": 1, "home": <0-7>, "away": <0-7>}, {"set": 2, "home": <0-7>, "away": <0-7>}, {"set": 3, "home": <0-7>, "away": <0-7>}], "mvp": "<player name>", "mvp_stats": "<aces/winners/unforced errors>", "highlights": ["<highlight 1>", "<highlight 2>", "<highlight 3>"], "coins_reward": <100-500>}`,
          type: "tennis_match"
        }
      });
      if (error) throw error;

      const jsonMatch = data.response?.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("Simulation failed");
      const matchResult = JSON.parse(jsonMatch[0]);

      const won = matchResult.home_score > matchResult.away_score;
      const home_power = computeBattlePower(players || [], team, matchResult.home_score);
      const away_power = opponentPower(matchResult.away_score);
      await supabase.from("tennis_coins").update({ balance: coins.balance - 300 + matchResult.coins_reward, total_spent: coins.total_spent + 300 }).eq("user_id", user.id);
      await supabase.from("tennis_teams").update({ wins: team.wins + (won ? 1 : 0), losses: team.losses + (won ? 0 : 1) }).eq("id", team.id);
      await supabase.from("tennis_matches").insert({ home_team_id: team.id, home_score: matchResult.home_score, away_score: matchResult.away_score, set_scores: matchResult.sets, coins_reward: matchResult.coins_reward, status: "completed" });

      const breakdown = (matchResult.sets || []).map((s: any) => ({ label: `Set ${s.set}`, home: s.home, away: s.away }));
      setResult({ ...matchResult, won, home_power, away_power, breakdown });
      toast.success(won ? "Victory! 🏆" : "Defeat! Better luck next time.");
    } catch (e: any) { toast.error(e.message); } finally { setLoading(false); }
  };

  return (
    <><FloatingHowItWorks title="MatchSimulator — How it works" steps={[{title:"Open this section",desc:"Access MatchSimulator from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<div className="space-y-4">
      <Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4 mr-2" />Back</Button>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2"><Swords className="h-5 w-5 text-primary" />Match Simulator <span className="text-xs text-muted-foreground">(300 coins)</span></CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {team ? <p className="text-sm">Playing as: <strong>{team.name}</strong> ({team.playstyle})</p> : <p className="text-sm text-muted-foreground">Create a team first!</p>}
          <Button className="w-full" onClick={simulate} disabled={loading || !team}>
            {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Simulating...</> : "Play Match (300 coins)"}
          </Button>
          {result && <BattleResult result={result} homeName={team?.name || "Your Team"} />}
        </CardContent>
      </Card>
    </div>
  </>
  );
}
