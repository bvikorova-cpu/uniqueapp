import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, Trophy, Coins } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Match {
  id: string;
  player1_id: string | null;
  player2_id: string | null;
  status: string;
  winner_id: string | null;
}

interface Bet {
  id: string;
  match_id: string;
  user_id: string;
  predicted_winner_id: string;
  stake_credits: number;
  payout_credits: number;
  status: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
}

export default function IQMatchBetting({ competitionId }: { competitionId: string }) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [stake, setStake] = useState<Record<string, string>>({});
  const [pickedSide, setPickedSide] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  // Load matches + bets
  const refresh = async () => {
    const { data: m } = await supabase
      .from("iq_tournament_matches")
      .select("id,player1_id,player2_id,status,winner_id")
      .eq("competition_id", competitionId)
      .order("round", { ascending: true })
      .order("slot", { ascending: true });
    setMatches((m as Match[]) || []);

    const matchIds = (m || []).map((x) => x.id);
    if (matchIds.length) {
      const { data: b } = await supabase
        .from("iq_match_bets")
        .select("*")
        .in("match_id", matchIds);
      setBets((b as Bet[]) || []);

      const playerIds = Array.from(
        new Set(
          (m || []).flatMap((x) => [x.player1_id, x.player2_id]).filter(Boolean) as string[],
        ),
      );
      if (playerIds.length) {
        const { data: p } = await supabase
          .from("profiles")
          .select("id,full_name,avatar_url")
          .in("id", playerIds);
        const map: Record<string, Profile> = {};
        (p as Profile[] || []).forEach((pr) => { map[pr.id] = pr; });
        setProfiles(map);
      }
    }
  };

  useEffect(() => { refresh(); }, [competitionId]);

  // Realtime
  useEffect(() => {
    const ch = supabase
      .channel(`iq-betting-${competitionId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "iq_match_bets" }, () => refresh())
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "iq_tournament_matches" }, () => refresh())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [competitionId]);

  const pools = useMemo(() => {
    const p: Record<string, { p1: number; p2: number; mine?: Bet }> = {};
    matches.forEach((m) => {
      p[m.id] = { p1: 0, p2: 0 };
    });
    bets.forEach((b) => {
      if (!p[b.match_id]) return;
      if (b.predicted_winner_id === matches.find((m) => m.id === b.match_id)?.player1_id) {
        p[b.match_id].p1 += b.stake_credits;
      } else {
        p[b.match_id].p2 += b.stake_credits;
      }
      if (b.user_id === userId) p[b.match_id].mine = b;
    });
    return p;
  }, [matches, bets, userId]);

  const handleBet = async (matchId: string) => {
    const side = pickedSide[matchId];
    const amt = parseInt(stake[matchId] || "0", 10);
    if (!side || !amt) {
      toast({ title: "Pick player & stake", variant: "destructive" });
      return;
    }
    setPlacing(matchId);
    const { error } = await supabase.rpc("place_iq_match_bet", {
      _match_id: matchId,
      _predicted_winner_id: side,
      _stake: amt,
    });
    setPlacing(null);
    if (error) {
      toast({ title: "Bet failed", description: error.message.replace(/_/g, " "), variant: "destructive" });
      return;
    }
    toast({ title: "Bet placed!", description: `${amt} CR locked in.` });
    refresh();
  };

  const playerName = (id: string | null) =>
    id ? profiles[id]?.full_name || id.slice(0, 6) : "TBD";

  const openMatches = matches.filter((m) => m.status === "pending" && m.player1_id && m.player2_id);

  if (!matches.length) {
    return (
      <>
        <FloatingHowItWorks title="How IQMatch Betting works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <div className="text-center py-8 text-sm text-muted-foreground">
        No matches yet. Bracket must start first.
      </div>
      </>
      );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <TrendingUp className="h-5 w-5 text-pink-500" />
        <h3 className="text-lg font-bold">Live Prediction Market</h3>
        <Badge variant="outline" className="text-[10px]">Parimutuel · winner-take-all</Badge>
      </div>

      {openMatches.length === 0 && (
        <p className="text-xs text-muted-foreground">No open matches. Check back when next round seeds.</p>
      )}

      <div className="grid gap-3">
        {openMatches.map((m) => {
          const pool = pools[m.id] || { p1: 0, p2: 0 };
          const total = pool.p1 + pool.p2;
          const odds1 = total > 0 && pool.p1 > 0 ? (total / pool.p1).toFixed(2) : "—";
          const odds2 = total > 0 && pool.p2 > 0 ? (total / pool.p2).toFixed(2) : "—";
          const mine = pool.mine;
          const isPlayer = userId === m.player1_id || userId === m.player2_id;

          return (
            <Card key={m.id} className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>{playerName(m.player1_id)} vs {playerName(m.player2_id)}</span>
                  <Badge variant="outline" className="text-[10px]"><Coins className="h-3 w-3 mr-1" />Pool: {total} CR</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 pt-0 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={pickedSide[m.id] === m.player1_id ? "default" : "outline"}
                    size="sm"
                    className="flex-col h-auto py-2"
                    disabled={isPlayer || !!mine}
                    onClick={() => setPickedSide((s) => ({ ...s, [m.id]: m.player1_id! }))}
                  >
                    <span className="text-xs font-bold truncate max-w-full">{playerName(m.player1_id)}</span>
                    <span className="text-[10px] opacity-70">{odds1}× · {pool.p1} CR</span>
                  </Button>
                  <Button
                    variant={pickedSide[m.id] === m.player2_id ? "default" : "outline"}
                    size="sm"
                    className="flex-col h-auto py-2"
                    disabled={isPlayer || !!mine}
                    onClick={() => setPickedSide((s) => ({ ...s, [m.id]: m.player2_id! }))}
                  >
                    <span className="text-xs font-bold truncate max-w-full">{playerName(m.player2_id)}</span>
                    <span className="text-[10px] opacity-70">{odds2}× · {pool.p2} CR</span>
                  </Button>
                </div>

                {mine ? (
                  <div className="text-xs text-center text-muted-foreground">
                    ✅ You bet <b>{mine.stake_credits} CR</b> on {playerName(mine.predicted_winner_id)}
                  </div>
                ) : isPlayer ? (
                  <p className="text-[10px] text-center text-muted-foreground">Players cannot bet on their own match.</p>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Credits"
                      min={1}
                      max={1000}
                      value={stake[m.id] || ""}
                      onChange={(e) => setStake((s) => ({ ...s, [m.id]: e.target.value }))}
                      className="h-8 text-xs"
                    />
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-pink-600 to-purple-600"
                      disabled={placing === m.id || !pickedSide[m.id] || !stake[m.id]}
                      onClick={() => handleBet(m.id)}
                    >
                      {placing === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : "Place bet"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Settled history */}
      {bets.filter((b) => b.user_id === userId && b.status !== "open").length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs font-bold mb-2 flex items-center gap-1"><Trophy className="h-3 w-3" /> My settled bets</p>
          <div className="space-y-1">
            {bets.filter((b) => b.user_id === userId && b.status !== "open").map((b) => (
              <div key={b.id} className="flex items-center justify-between text-[11px] p-2 rounded bg-card">
                <span>On {playerName(b.predicted_winner_id)} · {b.stake_credits} CR</span>
                <Badge variant={b.status === "won" ? "default" : b.status === "lost" ? "destructive" : "outline"} className="text-[9px]">
                  {b.status === "won" ? `+${b.payout_credits}` : b.status === "refunded" ? `↩ ${b.payout_credits}` : "lost"}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
