import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ArrowLeft, Sparkles, ScanLine, Mic, ShieldAlert, Share2, BookOpen,
  Trophy, Globe2, Layers, Hourglass, Swords, Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { brainDuelCall } from "@/hooks/useBrainDuelRouter";
import { useBrainDuelCredits } from "@/hooks/useBrainDuelCredits";
import { useQueryClient } from "@tanstack/react-query";
import { handleEdgeError } from "@/lib/handleEdgeError";

type Feature = {
  id: string;
  title: string;
  desc: string;
  icon: any;
  credits?: number;
  ai?: boolean;
  action?: string;
};

const FEATURES: Feature[] = [
  { id: "ai.generateQuiz", title: "AI Question Generator", desc: "Any topic, any difficulty — 10 fresh MCQs", icon: Sparkles, credits: 5, ai: true, action: "ai.generateQuiz" },
  { id: "ai.ocrScan", title: "Scan → Quiz (OCR)", desc: "Photograph notes; AI builds a deck", icon: ScanLine, credits: 5, ai: true, action: "ai.ocrScan" },
  { id: "ai.voiceQuiz", title: "Voice Quiz Battle", desc: "Speak your answer, AI scores it", icon: Mic, credits: 3, ai: true, action: "ai.voiceQuiz" },
  { id: "ai.cheatScan", title: "AI Cheat Detection", desc: "Anomaly scan on duel patterns", icon: ShieldAlert, credits: 2, ai: true, action: "ai.cheatScan" },
  { id: "ai.shareCard", title: "Share Result Card", desc: "Instagram story copy for your win", icon: ImageIcon, credits: 2, ai: true, action: "ai.shareCard" },
  { id: "srs", title: "Spaced Repetition", desc: "3-stage SRS — actually remember it", icon: BookOpen },
  { id: "elo", title: "ELO Ranked Ladder", desc: "Iron → Phoenix, transparent rating", icon: Trophy },
  { id: "topics", title: "Topic Communities", desc: "QuizUp-style topic hubs", icon: Globe2 },
  { id: "deck.publish", title: "Publish Custom Deck", desc: "Author + monetize your quiz", icon: Layers, credits: 4, ai: false, action: "deck.publish" },
  { id: "tournament.enter", title: "Real-Money Tournament", desc: "10-credit entry, EUR payout", icon: Trophy, credits: 10, ai: false, action: "tournament.enter" },
  { id: "async", title: "Async Turn-Based", desc: "Play a round, opponent has 24h", icon: Hourglass },
  { id: "team", title: "Team / Clan Battles", desc: "5v5 with collective ELO", icon: Swords },
];

export default function BrainDuelHub() {
  const navigate = useNavigate();
  const { credits } = useBrainDuelCredits();
  const qc = useQueryClient();
  const refetch = () => qc.invalidateQueries({ queryKey: ["brain-duel-credits"] });
  const [active, setActive] = useState<Feature | null>(null);
  const [input, setInput] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [output, setOutput] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [elo, setElo] = useState<any>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [srsDue, setSrsDue] = useState<any[]>([]);

  useEffect(() => {
    if (!active) return;
    setOutput(null);
    setRecords([]);
    if (active.id === "elo") {
      brainDuelCall("elo.getMine").then((r: any) => setElo(r.elo)).catch(() => {});
      brainDuelCall("elo.leaderboard", { limit: 10 }).then((r: any) => setRecords(r.leaderboard ?? [])).catch(() => {});
    } else if (active.id === "topics") {
      brainDuelCall("topics.list").then((r: any) => setTopics(r.topics ?? [])).catch(() => {});
    } else if (active.id === "srs") {
      brainDuelCall("srs.due").then((r: any) => setSrsDue(r.cards ?? [])).catch(() => {});
    } else if (!active.ai) {
      brainDuelCall("records.list", { kind: active.id, limit: 12 })
        .then((r: any) => setRecords(r.records ?? []))
        .catch(() => {});
    }
  }, [active]);

  const run = async () => {
    if (!active) return;
    setBusy(true);
    try {
      if (active.id === "ai.generateQuiz") {
        const r = await brainDuelCall<any>("ai.generateQuiz", { topic: input.topic, count: Number(input.count) || 10, difficulty: input.difficulty || "medium" });
        setOutput(r); refetch(); toast.success("Quiz generated!");
      } else if (active.id === "ai.ocrScan") {
        const r = await brainDuelCall<any>("ai.ocrScan", { imageUrl: input.imageUrl, count: 8 });
        setOutput(r); refetch(); toast.success("Deck created from image!");
      } else if (active.id === "ai.voiceQuiz") {
        const r = await brainDuelCall<any>("ai.voiceQuiz", { topic: input.topic, transcript: input.transcript });
        setOutput(r); refetch(); toast.success("Round scored!");
      } else if (active.id === "ai.cheatScan") {
        const r = await brainDuelCall<any>("ai.cheatScan", { duelId: input.duelId, responseTimes: (input.responseTimes || "").split(",").map(Number).filter(Boolean), accuracy: Number(input.accuracy) || 0 });
        setOutput(r); refetch(); toast.success("Cheat report ready");
      } else if (active.id === "ai.shareCard") {
        const r = await brainDuelCall<any>("ai.shareCard", { winner: input.winner, loser: input.loser, score: input.score, topic: input.topic });
        setOutput(r); refetch(); toast.success("Share card generated!");
      } else if (active.id === "deck.publish") {
        const questions = input.questions ? JSON.parse(input.questions) : [];
        const r = await brainDuelCall<any>("deck.publish", { title: input.title, topic: input.topic, questions });
        setOutput(r); refetch(); toast.success("Deck published!");
      } else if (active.id === "tournament.enter") {
        const r = await brainDuelCall<any>("tournament.enter", { tournamentId: input.tournamentId });
        setOutput(r); refetch(); toast.success("You're in!");
      } else if (active.id === "srs") {
        if (input.mode === "add") {
          const r = await brainDuelCall<any>("srs.addCard", { topic: input.topic, question: input.question, answer: input.answer });
          setOutput(r); toast.success("Card added!");
          const due = await brainDuelCall<any>("srs.due"); setSrsDue(due.cards ?? []);
        } else if (input.reviewId) {
          const r = await brainDuelCall<any>("srs.review", { id: input.reviewId, quality: Number(input.quality) || 4 });
          setOutput(r); toast.success("Reviewed!");
          const due = await brainDuelCall<any>("srs.due"); setSrsDue(due.cards ?? []);
        }
      } else if (active.id === "elo") {
        // SECURITY: elo.report now requires a verified matchId; server derives won/opponent.
        const r = await brainDuelCall<any>("elo.report", { matchId: input.matchId });
        setOutput(r); toast.success(`New rating: ${r.newRating} (${r.newTier})`);
        const mine = await brainDuelCall<any>("elo.getMine"); setElo(mine.elo);
      } else if (active.id === "topics") {
        const r = await brainDuelCall<any>("topics.create", { slug: input.slug, name: input.name, description: input.description });
        setOutput(r); toast.success("Topic created!");
        const t = await brainDuelCall<any>("topics.list"); setTopics(t.topics ?? []);
      } else if (active.id === "async") {
        const r = await brainDuelCall<any>("async.move", { matchId: input.matchId, move: { answer: input.answer, time: Number(input.time) || 0 } });
        setOutput(r); toast.success("Move recorded!");
      } else {
        const payload: any = {};
        Object.entries(input).forEach(([k, v]) => (payload[k] = v));
        await brainDuelCall("records.create", { kind: active.id, payload, is_public: true });
        toast.success("Saved!");
        const r = await brainDuelCall<any>("records.list", { kind: active.id, limit: 12 });
        setRecords(r.records ?? []);
        setInput({});
      }
    } catch (err) {
      if (!handleEdgeError(err, { navigate, context: active.title })) {
        toast.error((err as Error).message);
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <FloatingHowItWorks
        title="Brain Duel Hub"
        intro="12 next-gen Brain Duel features — AI quizzes, tournaments and more."
        steps={[
          { title: "Pick a feature", desc: "Tap any card to launch that tool (AI tools show a credit cost)." },
          { title: "Spend credits for AI", desc: "AI actions like quiz generation cost 3–5 credits." },
          { title: "Play & compete", desc: "Battle friends, join tournaments and climb the leaderboard." },
          { title: "Track progress", desc: "Wins, XP and badges are saved to your profile." },
        ]}
      />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => navigate("/brain-duel")}>
            <ArrowLeft className="h-4 w-4 mr-2" />Back to Brain Duel
          </Button>
          <Badge variant="outline" className="text-sm">{credits ?? 0} credits</Badge>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Brain Duel Hub
          </h1>
          <p className="text-muted-foreground mt-2">12 next-gen features. AI tools cost credits.</p>
        </div>

        {!active && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
              >
                <Card
                  className="cursor-pointer hover:border-primary/50 transition-all h-full"
                  onClick={() => setActive(f)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <f.icon className="h-6 w-6 text-primary" />
                      {f.credits && (
                        <Badge variant="secondary" className="text-xs">{f.credits} CR</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base mt-2">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{f.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {active && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <active.icon className="h-6 w-6 text-primary" />
                  <CardTitle>{active.title}</CardTitle>
                  {active.credits && <Badge variant="secondary">{active.credits} credits</Badge>}
                </div>
                <Button variant="ghost" size="sm" onClick={() => setActive(null)}>Close</Button>
              </div>
              <p className="text-sm text-muted-foreground">{active.desc}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {active.id === "ai.generateQuiz" && (
                <>
                  <Input placeholder="Topic (e.g. Tesla Model S history)" value={input.topic ?? ""} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                  <div className="grid grid-cols-2 gap-2">
                    <Input type="number" placeholder="Count (10)" value={input.count ?? ""} onChange={(e) => setInput({ ...input, count: e.target.value })} />
                    <Input placeholder="Difficulty (easy/medium/hard)" value={input.difficulty ?? ""} onChange={(e) => setInput({ ...input, difficulty: e.target.value })} />
                  </div>
                </>
              )}
              {active.id === "ai.ocrScan" && (
                <Input placeholder="Image URL (notes/textbook page)" value={input.imageUrl ?? ""} onChange={(e) => setInput({ ...input, imageUrl: e.target.value })} />
              )}
              {active.id === "ai.voiceQuiz" && (
                <>
                  <Input placeholder="Topic" value={input.topic ?? ""} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                  <Textarea placeholder="Your spoken answer (transcript)" value={input.transcript ?? ""} onChange={(e) => setInput({ ...input, transcript: e.target.value })} />
                </>
              )}
              {active.id === "ai.cheatScan" && (
                <>
                  <Input placeholder="Duel ID" value={input.duelId ?? ""} onChange={(e) => setInput({ ...input, duelId: e.target.value })} />
                  <Input placeholder="Response times ms (comma-separated)" value={input.responseTimes ?? ""} onChange={(e) => setInput({ ...input, responseTimes: e.target.value })} />
                  <Input type="number" placeholder="Accuracy %" value={input.accuracy ?? ""} onChange={(e) => setInput({ ...input, accuracy: e.target.value })} />
                </>
              )}
              {active.id === "ai.shareCard" && (
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Winner" value={input.winner ?? ""} onChange={(e) => setInput({ ...input, winner: e.target.value })} />
                  <Input placeholder="Loser" value={input.loser ?? ""} onChange={(e) => setInput({ ...input, loser: e.target.value })} />
                  <Input placeholder="Score (e.g. 8-5)" value={input.score ?? ""} onChange={(e) => setInput({ ...input, score: e.target.value })} />
                  <Input placeholder="Topic" value={input.topic ?? ""} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                </div>
              )}
              {active.id === "deck.publish" && (
                <>
                  <Input placeholder="Deck title" value={input.title ?? ""} onChange={(e) => setInput({ ...input, title: e.target.value })} />
                  <Input placeholder="Topic" value={input.topic ?? ""} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                  <Textarea placeholder='Questions JSON [{q,options,correct_index}]' value={input.questions ?? ""} onChange={(e) => setInput({ ...input, questions: e.target.value })} />
                </>
              )}
              {active.id === "tournament.enter" && (
                <Input placeholder="Tournament ID" value={input.tournamentId ?? ""} onChange={(e) => setInput({ ...input, tournamentId: e.target.value })} />
              )}
              {active.id === "srs" && (
                <>
                  <div className="flex gap-2">
                    <Button size="sm" variant={input.mode === "add" ? "default" : "outline"} onClick={() => setInput({ ...input, mode: "add" })}>Add card</Button>
                    <Button size="sm" variant={input.mode !== "add" ? "default" : "outline"} onClick={() => setInput({ ...input, mode: "review" })}>Review due</Button>
                  </div>
                  {input.mode === "add" ? (
                    <>
                      <Input placeholder="Topic" value={input.topic ?? ""} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                      <Input placeholder="Question" value={input.question ?? ""} onChange={(e) => setInput({ ...input, question: e.target.value })} />
                      <Input placeholder="Answer" value={input.answer ?? ""} onChange={(e) => setInput({ ...input, answer: e.target.value })} />
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">{srsDue.length} cards due</p>
                      <Input placeholder="Card ID to review" value={input.reviewId ?? ""} onChange={(e) => setInput({ ...input, reviewId: e.target.value })} />
                      <Input type="number" placeholder="Quality 0-5 (0=again, 5=easy)" value={input.quality ?? ""} onChange={(e) => setInput({ ...input, quality: e.target.value })} />
                      <div className="space-y-1 max-h-48 overflow-auto">
                        {srsDue.map((c) => (
                          <div key={c.id} className="text-xs p-2 bg-muted/30 rounded cursor-pointer" onClick={() => setInput({ ...input, reviewId: c.id })}>
                            <div className="font-mono text-[10px] text-muted-foreground">{c.id.slice(0, 8)} · {c.stage}</div>
                            <div>{c.question}</div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
              {active.id === "elo" && (
                <>
                  {elo && (
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-muted/30 rounded"><div className="text-xs text-muted-foreground">Rating</div><div className="text-xl font-bold">{elo.rating}</div></div>
                      <div className="p-2 bg-muted/30 rounded"><div className="text-xs text-muted-foreground">Tier</div><div className="text-xl font-bold capitalize">{elo.tier}</div></div>
                      <div className="p-2 bg-muted/30 rounded"><div className="text-xs text-muted-foreground">W/L</div><div className="text-xl font-bold">{elo.wins}/{elo.losses}</div></div>
                    </div>
                  )}
                  <Input placeholder="Opponent user ID" value={input.opponentId ?? ""} onChange={(e) => setInput({ ...input, opponentId: e.target.value })} />
                  <Input placeholder="Won? (true / false)" value={input.won ?? ""} onChange={(e) => setInput({ ...input, won: e.target.value })} />
                </>
              )}
              {active.id === "topics" && (
                <>
                  <Input placeholder="Slug (e.g. quantum-physics)" value={input.slug ?? ""} onChange={(e) => setInput({ ...input, slug: e.target.value })} />
                  <Input placeholder="Name" value={input.name ?? ""} onChange={(e) => setInput({ ...input, name: e.target.value })} />
                  <Textarea placeholder="Description" value={input.description ?? ""} onChange={(e) => setInput({ ...input, description: e.target.value })} />
                  {topics.length > 0 && (
                    <div className="space-y-1 max-h-48 overflow-auto">
                      {topics.map((t) => (
                        <div key={t.id} className="text-xs p-2 bg-muted/30 rounded">
                          <span className="font-semibold">{t.name}</span> <span className="text-muted-foreground">/topic/{t.slug} · {t.member_count} members</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              {active.id === "async" && (
                <>
                  <Input placeholder="Match ID" value={input.matchId ?? ""} onChange={(e) => setInput({ ...input, matchId: e.target.value })} />
                  <Input placeholder="Your answer" value={input.answer ?? ""} onChange={(e) => setInput({ ...input, answer: e.target.value })} />
                  <Input type="number" placeholder="Time (ms)" value={input.time ?? ""} onChange={(e) => setInput({ ...input, time: e.target.value })} />
                </>
              )}
              {active.id === "team" && (
                <>
                  <Input placeholder="Clan name" value={input.clan ?? ""} onChange={(e) => setInput({ ...input, clan: e.target.value })} />
                  <Input placeholder="Roster (comma-separated usernames)" value={input.roster ?? ""} onChange={(e) => setInput({ ...input, roster: e.target.value })} />
                </>
              )}

              <Button onClick={run} disabled={busy} className="w-full">
                {busy ? "Working…" : active.credits ? `Run (${active.credits} credits)` : "Submit"}
              </Button>

              {output && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
                      {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {records.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold mb-2">{active.id === "elo" ? "Top players" : "Recent"}</h3>
                  <div className="space-y-2">
                    {records.map((r: any) => (
                      <div key={r.id ?? r.user_id} className="text-xs p-2 bg-muted/30 rounded border border-border/30">
                        <pre className="whitespace-pre-wrap">{JSON.stringify(r.payload ?? r, null, 2)}</pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
