import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Swords, Bot, Loader2, Trophy, Shuffle, MessageCircle, Flame, Crown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Round { round: number; a: string; b: string }

interface BattleResult {
  winner: string;
  winnerSide: "user" | "opponent";
  topic: string;
  rounds: Round[];
  verdict?: string;
  userScore: number;
  opponentScore: number;
  myClone: { id: string; name: string };
  opponent: { id: string; name: string; userId: string | null; owner: string };
}

interface HistoryRow {
  id: string;
  topic: string | null;
  winner: string;
  user_clone_name: string;
  opponent_clone_name: string;
  user_score: number;
  opponent_score: number;
  created_at: string;
}

const TOPICS = [
  "Random topic",
  "Is it better to be brutally honest or kindly diplomatic?",
  "Would you rather be famous or free?",
  "What matters more: talent or relentless consistency?",
  "Should AI clones be allowed to date on your behalf?",
  "Money, meaning, or mischief - pick one to live by.",
];

const STAGES = ["Scanning the arena", "Matching a rival clone", "Round 1", "Round 2", "Round 3", "Judges scoring"];

export function CloneBattles() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isMatching, setIsMatching] = useState(false);
  const [stage, setStage] = useState(0);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [result, setResult] = useState<BattleResult | null>(null);
  const [visibleRounds, setVisibleRounds] = useState(0);
  const [history, setHistory] = useState<HistoryRow[]>([]);
  const [record, setRecord] = useState({ wins: 0, losses: 0, streak: 0 });

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("clone_battles")
      .select("id, topic, winner, user_clone_name, opponent_clone_name, user_score, opponent_score, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);
    const rows = (data ?? []) as HistoryRow[];
    setHistory(rows);
    const wins = rows.filter((r) => r.winner === "user").length;
    let streak = 0;
    for (const r of rows) { if (r.winner === "user") streak++; else break; }
    setRecord({ wins, losses: rows.length - wins, streak });
  };

  useEffect(() => { loadHistory(); }, []);

  // Reveal rounds one by one for a live-duel feel.
  useEffect(() => {
    if (!result) return;
    setVisibleRounds(0);
    const timers = result.rounds.map((_, i) => setTimeout(() => setVisibleRounds(i + 1), 700 * (i + 1)));
    return () => timers.forEach(clearTimeout);
  }, [result]);

  const startBattle = async () => {
    setIsMatching(true);
    setResult(null);
    setStage(0);
    const ticker = setInterval(() => setStage((s) => Math.min(s + 1, STAGES.length - 1)), 900);
    try {
      const { data, error } = await supabase.functions.invoke("clone-battle", {
        body: { topic: topic === TOPICS[0] ? undefined : topic },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as BattleResult);
      loadHistory();
    } catch (err: any) {
      toast({ title: "Battle failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      clearInterval(ticker);
      setIsMatching(false);
    }
  };

  const total = result ? Math.max(1, result.userScore + result.opponentScore) : 1;

  return (
    <>
      <FloatingHowItWorks
        title="Clone Battles - How it works"
        steps={[
          { title: "Pick a topic", desc: "Choose a debate topic or let the arena pick a random one." },
          { title: "Get matched", desc: "The arena picks a random active clone from another real user." },
          { title: "Watch the duel", desc: "Three AI rounds play out live, in each clone's own personality." },
          { title: "Judge scores", desc: "Scores decide the winner and your win record and streak update." },
          { title: "Follow up", desc: "Message the rival clone's owner directly from the result card." },
        ]}
      />
      <div className="space-y-6">
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Swords className="h-5 w-5 text-primary" /> Clone Arena
            </CardTitle>
            <CardDescription>
              Your clone duels a randomly matched clone belonging to another user on the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-border/50 bg-background/50 p-3 text-center">
                <p className="text-xl font-black text-primary">{record.wins}</p>
                <p className="text-[10px] text-muted-foreground">Wins</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/50 p-3 text-center">
                <p className="text-xl font-black">{record.losses}</p>
                <p className="text-[10px] text-muted-foreground">Losses</p>
              </div>
              <div className="rounded-xl border border-border/50 bg-background/50 p-3 text-center">
                <p className="text-xl font-black flex items-center justify-center gap-1">
                  <Flame className="h-4 w-4 text-accent" />{record.streak}
                </p>
                <p className="text-[10px] text-muted-foreground">Win streak</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {TOPICS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    topic === t ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {t === TOPICS[0] ? <span className="flex items-center gap-1"><Shuffle className="h-3 w-3" /> {t}</span> : t}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-center gap-6">
              <motion.div animate={{ x: isMatching ? [0, -6, 0] : 0 }} transition={{ duration: 0.9, repeat: isMatching ? Infinity : 0 }} className="text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/40 bg-primary/20">
                  <Bot className="h-8 w-8 text-primary" />
                </div>
                <span className="text-xs font-medium">{result?.myClone.name ?? "Your clone"}</span>
              </motion.div>
              <Swords className="h-8 w-8 text-muted-foreground" />
              <motion.div animate={{ x: isMatching ? [0, 6, 0] : 0 }} transition={{ duration: 0.9, repeat: isMatching ? Infinity : 0 }} className="text-center">
                <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent/40 bg-accent/20">
                  <Bot className="h-8 w-8 text-accent" />
                </div>
                <span className="text-xs font-medium">{result?.opponent.name ?? "Random rival"}</span>
              </motion.div>
            </div>

            <div className="text-center">
              <Button onClick={startBattle} disabled={isMatching} size="lg">
                {isMatching ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {STAGES[stage]}...</>
                ) : (
                  <><Swords className="mr-2 h-4 w-4" /> Find rival & battle</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
                <CardHeader>
                  <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                    <Trophy className="h-5 w-5 text-yellow-400" /> Winner: {result.winner}
                    <Badge variant={result.winnerSide === "user" ? "default" : "outline"}>
                      {result.winnerSide === "user" ? "You won" : "Rival won"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Topic: {result.topic} · Rival owned by {result.opponent.owner}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="font-medium">{result.myClone.name} · {result.userScore}</span>
                      <span className="font-medium">{result.opponent.name} · {result.opponentScore}</span>
                    </div>
                    <Progress value={(result.userScore / total) * 100} />
                  </div>

                  <div className="space-y-3">
                    {result.rounds.slice(0, visibleRounds).map((r) => (
                      <motion.div key={r.round} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/50 bg-background/50 p-3">
                        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Round {r.round}</p>
                        <p className="mb-2 text-sm"><span className="text-primary">▸</span> {r.a}</p>
                        <p className="text-sm text-muted-foreground"><span className="text-accent">▸</span> {r.b}</p>
                      </motion.div>
                    ))}
                    {visibleRounds < result.rounds.length && (
                      <p className="text-center text-xs text-muted-foreground">
                        <Loader2 className="mr-1 inline h-3 w-3 animate-spin" /> next round incoming...
                      </p>
                    )}
                  </div>

                  {result.verdict && visibleRounds >= result.rounds.length && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                      <span className="font-semibold">Judge: </span>{result.verdict}
                    </div>
                  )}

                  {result.opponent.userId && (
                    <Button variant="outline" className="w-full" onClick={() => navigate(`/messenger?user=${result.opponent.userId}`)}>
                      <MessageCircle className="mr-2 h-4 w-4" /> Message {result.opponent.owner}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {history.length > 0 && (
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Crown className="h-4 w-4 text-primary" /> Your recent battles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-background/50 p-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{h.user_clone_name} vs {h.opponent_clone_name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {h.topic ?? "Random topic"} · {formatDistanceToNow(new Date(h.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Badge variant={h.winner === "user" ? "default" : "outline"} className="shrink-0">
                    {h.user_score}–{h.opponent_score}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
