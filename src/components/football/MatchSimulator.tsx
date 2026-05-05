import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Swords, Play, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BattleResult } from "@/components/sports/BattleResult";
import { computeBattlePower, opponentPower } from "@/lib/battlePower";

const events = ["⚽ GOAL!", "🎯 Shot on target", "🛡️ Great save!", "🔄 Substitution", "⚠️ Yellow card", "🏃 Counter attack", "📐 Corner kick", "🎯 Free kick"];

export const MatchSimulator = ({ onBack }: { onBack: () => void }) => {
  const { user, session } = useAuth();
  const [team, setTeam] = useState<any>(null);
  const [simulating, setSimulating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [matchLog, setMatchLog] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase.from("football_teams").select("*").eq("user_id", user.id).single().then(({ data }) => setTeam(data));
  }, [user]);

  const simulateMatch = async (useAI: boolean) => {
    if (!user || !session) { toast.error("Sign in first"); return; }
    if (!team) { toast.error("Create your team first!"); return; }
    setSimulating(true); setMatchLog([]); setResult(null);

    try {
      const { data: squadPlayers } = await supabase.from("football_players").select("*").eq("team_id", team.id);
      const squadRating = squadPlayers && squadPlayers.length > 0 ? Math.round(squadPlayers.reduce((a, p) => a + p.overall_rating, 0) / squadPlayers.length) : 50;
      const opponentRating = 40 + Math.floor(Math.random() * 40);
      const opponentName = ["FC United", "Real Stars", "Bayern Elite", "PSG Legends", "Liverpool FC", "City Wanderers"][Math.floor(Math.random() * 6)];

      let homeScore = 0, awayScore = 0;
      const log: string[] = [];

      if (useAI) {
        const { data, error } = await supabase.functions.invoke("generate-gift-message", {
          headers: { Authorization: `Bearer ${session.access_token}` },
          body: { prompt: `Simulate a football match between "${team.name}" (rating ${squadRating}) vs "${opponentName}" (rating ${opponentRating}). Return JSON: {"home_score": <number>, "away_score": <number>, "events": ["<minute>: <event>", ...], "man_of_match": "<name>"}. Generate 8-12 events.`, type: "football_match" }
        });
        if (!error && data) {
          try {
            const r = JSON.parse(data.message || "{}");
            homeScore = r.home_score ?? Math.floor(Math.random() * 4);
            awayScore = r.away_score ?? Math.floor(Math.random() * 3);
            if (r.events) log.push(...r.events);
          } catch {}
        }
      }

      if (log.length === 0) {
        for (let i = 0; i < 8; i++) {
          const minute = Math.floor(Math.random() * 90) + 1;
          log.push(`${minute}' ${events[Math.floor(Math.random() * events.length)]}`);
        }
        homeScore = squadRating > opponentRating ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);
        awayScore = opponentRating > squadRating ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2);
      }

      log.sort((a, b) => parseInt(a) - parseInt(b));
      for (let i = 0; i < log.length; i++) {
        await new Promise(r => setTimeout(r, 400));
        setMatchLog(prev => [...prev, log[i]]);
      }

      const matchResult = { homeTeam: team.name, awayTeam: opponentName, homeScore, awayScore };
      setResult(matchResult);

      const won = homeScore > awayScore;
      const draw = homeScore === awayScore;
      await supabase.from("football_teams").update({
        wins: team.wins + (won ? 1 : 0),
        losses: team.losses + (!won && !draw ? 1 : 0),
        draws: team.draws + (draw ? 1 : 0),
        coins_earned: team.coins_earned + (won ? 200 : draw ? 50 : 0)
      }).eq("id", team.id);

      const { data: coins } = await supabase.from("football_coins").select("*").eq("user_id", user.id).single();
      if (coins) {
        const reward = won ? 200 : draw ? 50 : 10;
        await supabase.from("football_coins").update({ balance: coins.balance + reward, total_earned: coins.total_earned + reward }).eq("user_id", user.id);
      }

      toast.success(won ? "🏆 Victory!" : draw ? "🤝 Draw!" : "😢 Defeat!");
    } catch (e: any) { toast.error(e.message); } finally { setSimulating(false); }
  };

  if (!user) return <div className="space-y-4"><Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Back</Button><p className="text-center py-8">Sign in to play matches</p></div>;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <h2 className="text-2xl font-bold">⚔️ Match Simulator</h2>
      {!team ? <Card><CardContent className="py-8 text-center">Create your team first in Team Builder!</CardContent></Card> : (
        <>
          <Card className="border-emerald-500/30">
            <CardContent className="pt-6 text-center">
              <p className="text-lg font-bold mb-2">{team.name}</p>
              <p className="text-sm text-muted-foreground mb-4">W{team.wins} D{team.draws} L{team.losses}</p>
              <div className="grid grid-cols-2 gap-3">
                <Button onClick={() => simulateMatch(false)} disabled={simulating} className="gap-2"><Play className="h-4 w-4" /> Quick Match</Button>
                <Button onClick={() => simulateMatch(true)} disabled={simulating} className="gap-2 bg-gradient-to-r from-emerald-600 to-green-600"><Sparkles className="h-4 w-4" /> AI Match (3 credits)</Button>
              </div>
            </CardContent>
          </Card>
          {matchLog.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Match Events</CardTitle></CardHeader>
              <CardContent className="space-y-2 max-h-64 overflow-y-auto">
                {matchLog.map((ev, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="p-2 rounded bg-muted/50 text-sm">{ev}</motion.div>
                ))}
              </CardContent>
            </Card>
          )}
          {result && (
            <Card className="border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Full Time</p>
                <div className="flex items-center justify-center gap-6">
                  <div><p className="font-bold">{result.homeTeam}</p><p className="text-4xl font-black">{result.homeScore}</p></div>
                  <p className="text-2xl text-muted-foreground">-</p>
                  <div><p className="font-bold">{result.awayTeam}</p><p className="text-4xl font-black">{result.awayScore}</p></div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
