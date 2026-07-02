import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Crown, Medal, Loader2, Swords, Gift } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import IQMatchBetting from "./IQMatchBetting";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Match {
  id: string;
  round: number;
  slot: number;
  player1_id: string | null;
  player2_id: string | null;
  player1_score: number | null;
  player2_score: number | null;
  winner_id: string | null;
  status: string;
}

interface Props {
  competitionId: string;
  bracketSize: number;
  finalizedAt: string | null;
}

export default function IQTournamentBracket({ competitionId, bracketSize, finalizedAt }: Props) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [profiles, setProfiles] = useState<Record<string, { name: string; avatar: string | null }>>({});
  const [payouts, setPayouts] = useState<any[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [scoreInput, setScoreInput] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    load();
    const ch = supabase
      .channel(`bracket-${competitionId}`)
      .on("postgres_changes",
        { event: "*", schema: "public", table: "iq_tournament_matches", filter: `competition_id=eq.${competitionId}` },
        () => load())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [competitionId]);

  const load = async () => {
    const [{ data: m }, { data: p }] = await Promise.all([
      supabase.from("iq_tournament_matches").select("*").eq("competition_id", competitionId).order("round").order("slot"),
      supabase.from("iq_tournament_payouts").select("*").eq("competition_id", competitionId).order("rank"),
    ]);
    if (m) {
      setMatches(m as any);
      const ids = Array.from(new Set(m.flatMap((x: any) => [x.player1_id, x.player2_id]).filter(Boolean))) as string[];
      if (ids.length) {
        const { data: profs } = await (supabase as any)
          .from("profiles")
          .select("user_id, full_name, username, avatar_url")
          .in("user_id", ids);
        const map: Record<string, any> = {};
        profs?.forEach((p: any) => {
          map[p.user_id] = { name: p.full_name || p.username || "Player", avatar: p.avatar_url };
        });
        setProfiles(map);
      }
    }
    if (p) setPayouts(p);
  };

  const submitScore = async (matchId: string) => {
    const v = parseInt(scoreInput[matchId] || "0", 10);
    if (isNaN(v) || v < 0 || v > 200) {
      toast({ title: "Enter score 0-200", variant: "destructive" });
      return;
    }
    setSubmitting(matchId);
    const { error } = await supabase.rpc("submit_iq_tournament_match_score", { _match_id: matchId, _score: v });
    setSubmitting(null);
    if (error) toast({ title: "Error", description: error.message, variant: "destructive" });
    else {
      toast({ title: "Score submitted!" });
      setScoreInput((s) => ({ ...s, [matchId]: "" }));
    }
  };

  const rounds = Math.max(1, Math.log2(bracketSize) || 1);
  const roundNames: Record<number, string> = {};
  for (let r = 1; r <= rounds; r++) {
    if (r === rounds) roundNames[r] = "🏆 Final";
    else if (r === rounds - 1) roundNames[r] = "Semifinals";
    else if (r === rounds - 2) roundNames[r] = "Quarterfinals";
    else roundNames[r] = `Round ${r}`;
  }

  if (matches.length === 0) {
    return (
      <>
        <FloatingHowItWorks title="How IQTournament Bracket works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <Card className="border-dashed bg-muted/20">
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Bracket will appear once an admin starts the tournament.
        </CardContent>
      </Card>
      </>
      );
  }

  return (
    <div className="space-y-4">
      {finalizedAt && payouts.length > 0 && (
        <Card className="border-yellow-500/40 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Gift className="h-5 w-5 text-yellow-500" />
              <p className="font-bold">Tournament Complete — Prizes Awarded</p>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {payouts.map((p) => (
                <div key={p.id} className="bg-background/60 rounded-lg p-3 text-center">
                  <div className="flex justify-center mb-1">
                    {p.rank === 1 ? <Crown className="h-5 w-5 text-yellow-500" /> :
                     p.rank === 2 ? <Medal className="h-5 w-5 text-gray-400" /> :
                     <Medal className="h-5 w-5 text-orange-600" />}
                  </div>
                  <p className="text-xs font-bold">{profiles[p.user_id]?.name ?? "Player"}</p>
                  <p className="text-xs text-green-500">+{p.credits_awarded} CR</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-4 min-w-max">
          {Array.from({ length: rounds }, (_, idx) => idx + 1).map((round) => {
            const roundMatches = matches.filter((m) => m.round === round);
            return (
              <div key={round} className="flex flex-col gap-3 min-w-[220px]">
                <p className="text-xs font-bold text-center text-muted-foreground uppercase tracking-wide">
                  {roundNames[round]}
                </p>
                {roundMatches.map((m) => {
                  const isP1 = userId && userId === m.player1_id;
                  const isP2 = userId && userId === m.player2_id;
                  const myMatch = isP1 || isP2;
                  const mySubmitted = (isP1 && m.player1_score !== null) || (isP2 && m.player2_score !== null);
                  const playable = m.status === "active" && myMatch && !mySubmitted && !finalizedAt;

                  const renderPlayer = (id: string | null, score: number | null, isWinner: boolean) => (
                    <div className={`flex items-center justify-between p-2 rounded ${isWinner ? "bg-green-500/15 border border-green-500/30" : "bg-background/40"}`}>
                      <span className="text-xs truncate">
                        {id ? (profiles[id]?.name ?? "Player") : <span className="text-muted-foreground italic">— bye —</span>}
                      </span>
                      <span className="text-xs font-bold ml-2">{score ?? "-"}</span>
                    </div>
                  );

                  return (
                    <Card key={m.id} className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-pink-500/5">
                      <CardContent className="p-2 space-y-1">
                        {renderPlayer(m.player1_id, m.player1_score, m.winner_id === m.player1_id && !!m.winner_id)}
                        <div className="text-center text-[9px] text-muted-foreground">vs</div>
                        {renderPlayer(m.player2_id, m.player2_score, m.winner_id === m.player2_id && !!m.winner_id)}

                        {m.status === "completed" && (
                          <Badge variant="secondary" className="w-full justify-center text-[9px] mt-1">
                            <Trophy className="h-3 w-3 mr-1" /> Decided
                          </Badge>
                        )}
                        {m.status === "bye" && (
                          <Badge variant="outline" className="w-full justify-center text-[9px] mt-1">Auto-advance</Badge>
                        )}
                        {playable && (
                          <div className="flex gap-1 mt-2">
                            <input
                              type="number"
                              min={0}
                              max={200}
                              placeholder="Your IQ"
                              className="flex-1 text-xs px-2 py-1 rounded border bg-background"
                              value={scoreInput[m.id] ?? ""}
                              onChange={(e) => setScoreInput((s) => ({ ...s, [m.id]: e.target.value }))}
                            />
                            <Button
                              size="sm"
                              className="h-7 px-2 bg-gradient-to-r from-purple-600 to-pink-600"
                              disabled={submitting === m.id}
                              onClick={() => submitScore(m.id)}
                            >
                              {submitting === m.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Swords className="h-3 w-3" />}
                            </Button>
                          </div>
                        )}
                        {myMatch && mySubmitted && m.status === "active" && (
                          <p className="text-[9px] text-center text-muted-foreground italic mt-1">Waiting for opponent…</p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-border/50">
        <IQMatchBetting competitionId={competitionId} />
      </div>
    </div>
  );
}
