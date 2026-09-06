import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, ScanLine, Mic, ShieldAlert, Image as ImageIcon, Layers, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brainDuelCall } from "@/hooks/useBrainDuelRouter";
import { useBrainDuelCredits } from "@/hooks/useBrainDuelCredits";
import { useQueryClient } from "@tanstack/react-query";
import { handleEdgeError } from "@/lib/handleEdgeError";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type Feature = {
  id: string;
  title: string;
  desc: string;
  icon: any;
  credits?: number;
  ai?: boolean;
  action?: string;
};

type DeckQuestionDraft = {
  q: string;
  options: string[];
  correct_index: number;
};

const createEmptyDeckQuestion = (): DeckQuestionDraft => ({
  q: "",
  options: ["", "", "", ""],
  correct_index: 0,
});

const FEATURES: Feature[] = [
  { id: "ai.generateQuiz", title: "AI Question Generator", desc: "Any topic, any difficulty — 10 fresh MCQs", icon: Sparkles, credits: 5, ai: true, action: "ai.generateQuiz" },
  { id: "ai.ocrScan", title: "Scan → Quiz (OCR)", desc: "Photograph notes; AI builds a deck", icon: ScanLine, credits: 5, ai: true, action: "ai.ocrScan" },
  { id: "ai.voiceQuiz", title: "Quiz Battle", desc: "Type your answer, AI scores it", icon: Mic, credits: 3, ai: true, action: "ai.voiceQuiz" },
  { id: "ai.cheatScan", title: "AI Cheat Detection", desc: "Anomaly scan on duel patterns", icon: ShieldAlert, credits: 2, ai: true, action: "ai.cheatScan" },
  { id: "ai.shareCard", title: "Share Result Card", desc: "Instagram story copy for your win", icon: ImageIcon, credits: 2, ai: true, action: "ai.shareCard" },
  { id: "deck.publish", title: "Publish Custom Deck", desc: "Author + monetize your quiz", icon: Layers, credits: 4, ai: false, action: "deck.publish" },
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
  const [recentDuels, setRecentDuels] = useState<any[]>([]);
  const [loadingDuels, setLoadingDuels] = useState(false);
  const [deckQuestions, setDeckQuestions] = useState<DeckQuestionDraft[]>([createEmptyDeckQuestion()]);

  const updateDeckQuestion = (index: number, patch: Partial<DeckQuestionDraft>) => {
    setDeckQuestions((questions) => questions.map((question, i) => i === index ? { ...question, ...patch } : question));
  };

  const updateDeckOption = (questionIndex: number, optionIndex: number, value: string) => {
    setDeckQuestions((questions) => questions.map((question, i) => {
      if (i !== questionIndex) return question;
      const options = [...question.options];
      options[optionIndex] = value;
      return { ...question, options };
    }));
  };

  const removeDeckQuestion = (index: number) => {
    setDeckQuestions((questions) => questions.length > 1 ? questions.filter((_, i) => i !== index) : [createEmptyDeckQuestion()]);
  };

  useEffect(() => {
    if (!active) return;
    setOutput(null);
    if (active.id === "ai.cheatScan" || active.id === "ai.shareCard") {
      setLoadingDuels(true);
      brainDuelCall<any>("duels.recent")
        .then((r) => setRecentDuels(r?.duels ?? []))
        .catch(() => setRecentDuels([]))
        .finally(() => setLoadingDuels(false));
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
        if (!input.duelId) { toast.error("Please select a duel first."); return; }
        const r = await brainDuelCall<any>("ai.cheatScan", { duelId: input.duelId });
        setOutput(r); refetch(); toast.success("Cheat report ready");
      } else if (active.id === "ai.shareCard") {
        const r = await brainDuelCall<any>("ai.shareCard", { duelId: input.duelId, winner: input.winner, loser: input.loser, score: input.score, topic: input.topic });
        setOutput(r); refetch(); toast.success("Share card generated!");
      } else if (active.id === "deck.publish") {
        if (!input.title?.trim()) { toast.error("Please enter a deck title."); return; }
        if (!input.topic?.trim()) { toast.error("Please enter a topic."); return; }
        const questions = deckQuestions.map((question) => ({
          q: question.q.trim(),
          options: question.options.map((option) => option.trim()),
          correct_index: question.correct_index,
        })).filter((question) => question.q && question.options.filter(Boolean).length >= 2);
        if (questions.length === 0) { toast.error("Add at least one complete question with two answers."); return; }
        const r = await brainDuelCall<any>("deck.publish", { title: input.title, topic: input.topic, questions });
        setOutput(r); refetch(); toast.success("Deck published!");
      } else {
        const payload: any = {};
        Object.entries(input).forEach(([k, v]) => (payload[k] = v));
        await brainDuelCall("records.create", { kind: active.id, payload, is_public: true });
        toast.success("Saved!");
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
        intro="Premium Brain Duel features — AI tools and paid tournaments."
        steps={[
          { title: "Pick a feature", desc: "Tap any card to launch that tool (AI tools show a credit cost)." },
          { title: "Spend credits", desc: "AI actions and premium features cost 2–10 credits." },
          { title: "Play & compete", desc: "Join tournaments, generate quizzes and share your wins." },
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
          <p className="text-muted-foreground mt-2">Premium paid features. AI tools cost credits.</p>
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
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-primary-foreground"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 4 * 1024 * 1024) { toast.error("Image too large (max 4 MB)"); return; }
                      const reader = new FileReader();
                      reader.onload = () => setInput((s) => ({ ...s, imageUrl: String(reader.result) }));
                      reader.readAsDataURL(f);
                    }}
                  />
                  {input.imageUrl?.startsWith("data:image") && (
                    <img src={input.imageUrl} alt="Scanned notes preview" className="max-h-40 rounded-md border" />
                  )}
                  <Input placeholder="…or paste an image URL" value={input.imageUrl?.startsWith("data:") ? "" : (input.imageUrl ?? "")} onChange={(e) => setInput({ ...input, imageUrl: e.target.value })} />
                </div>
              )}

              {active.id === "ai.voiceQuiz" && (
                <>
                  <Input placeholder="Topic" value={input.topic ?? ""} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                  <Textarea placeholder="Type your answer" value={input.transcript ?? ""} onChange={(e) => setInput({ ...input, transcript: e.target.value })} />
                </>
              )}

              {active.id === "ai.cheatScan" && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Pick one of your duels — timings and accuracy are read from the server automatically.
                  </p>
                  {loadingDuels ? (
                    <p className="text-sm text-muted-foreground">Loading your duels…</p>
                  ) : recentDuels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No duels found yet. Play a duel first, then scan it here.</p>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {recentDuels.map((d) => (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setInput({ ...input, duelId: d.id })}
                          className={`w-full text-left rounded-md border p-3 text-sm transition-colors ${
                            input.duelId === d.id ? "border-primary bg-primary/10" : "hover:bg-muted"
                          }`}
                        >
                          <div className="font-medium capitalize">{d.category ?? "General"}</div>
                          <div className="text-xs text-muted-foreground">
                            Score {d.player1_score ?? 0}–{d.player2_score ?? 0} ·{" "}
                            {new Date(d.finished_at ?? d.created_at).toLocaleString()}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {active.id === "ai.shareCard" && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Pick a finished duel to create a card from real names, score and topic.</p>
                    {loadingDuels ? (
                      <p className="text-sm text-muted-foreground">Loading your duels…</p>
                    ) : recentDuels.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No finished duels found yet. You can still fill the card manually below.</p>
                    ) : (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {recentDuels.map((d) => (
                          <Button
                            key={d.id}
                            type="button"
                            variant={input.duelId === d.id ? "secondary" : "outline"}
                            className="h-auto w-full justify-start p-3 text-left"
                            onClick={() => setInput({
                              ...input,
                              duelId: d.id,
                              winner: d.winner_name ?? "",
                              loser: d.loser_name ?? "",
                              score: d.score_label ?? `${d.player1_score ?? 0}-${d.player2_score ?? 0}`,
                              topic: d.category ?? "Brain Duel",
                            })}
                          >
                            <span className="block">
                              <span className="block font-medium normal-case">{d.result_label ?? "Finished duel"}</span>
                              <span className="block text-xs text-muted-foreground normal-case">
                                {d.category ?? "General"} · {new Date(d.finished_at ?? d.created_at).toLocaleString()}
                              </span>
                            </span>
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="Winner" value={input.winner ?? ""} onChange={(e) => setInput({ ...input, winner: e.target.value })} />
                    <Input placeholder="Loser" value={input.loser ?? ""} onChange={(e) => setInput({ ...input, loser: e.target.value })} />
                    <Input placeholder="Score (e.g. 8-5)" value={input.score ?? ""} onChange={(e) => setInput({ ...input, score: e.target.value })} />
                    <Input placeholder="Topic" value={input.topic ?? ""} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                  </div>
                </div>
              )}
              {active.id === "deck.publish" && (
                <div className="space-y-4">
                  <Input placeholder="Deck title" value={input.title ?? ""} onChange={(e) => setInput({ ...input, title: e.target.value })} />
                  <Input placeholder="Topic" value={input.topic ?? ""} onChange={(e) => setInput({ ...input, topic: e.target.value })} />
                  <div className="space-y-3">
                    {deckQuestions.map((question, questionIndex) => (
                      <div key={questionIndex} className="rounded-md border bg-muted/20 p-3 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline">Question {questionIndex + 1}</Badge>
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeDeckQuestion(questionIndex)} aria-label="Remove question">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <Textarea
                          placeholder="Question"
                          value={question.q}
                          onChange={(e) => updateDeckQuestion(questionIndex, { q: e.target.value })}
                        />
                        <div className="grid gap-2 sm:grid-cols-2">
                          {question.options.map((option, optionIndex) => (
                            <Input
                              key={optionIndex}
                              placeholder={`Answer ${optionIndex + 1}`}
                              value={option}
                              onChange={(e) => updateDeckOption(questionIndex, optionIndex, e.target.value)}
                            />
                          ))}
                        </div>
                        <Select
                          value={String(question.correct_index)}
                          onValueChange={(value) => updateDeckQuestion(questionIndex, { correct_index: Number(value) })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Correct answer" />
                          </SelectTrigger>
                          <SelectContent>
                            {question.options.map((_, optionIndex) => (
                              <SelectItem key={optionIndex} value={String(optionIndex)}>Correct answer: {optionIndex + 1}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <Button type="button" variant="outline" className="w-full" onClick={() => setDeckQuestions((questions) => [...questions, createEmptyDeckQuestion()])}>
                      <Plus className="h-4 w-4 mr-2" /> Add question
                    </Button>
                  </div>
                </div>
              )}

              <Button onClick={run} disabled={busy} className="w-full">
                {busy ? "Working…" : `Run (${active.credits} credits)`}
              </Button>

              {output && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 space-y-3">
                    {output?.round ? (
                      <div className="text-sm space-y-2">
                        <p className="font-medium">{output.round.question}</p>
                        <p className={output.round.user_correct ? "text-green-600 font-semibold" : "text-destructive font-semibold"}>
                          {output.round.user_correct ? "Correct!" : "Not quite."}
                          {typeof output.round.score === "number" ? ` (${output.round.score}/100)` : ""}
                        </p>
                        {output.round.correct_answer && (
                          <p className="text-muted-foreground">Correct answer: {output.round.correct_answer}</p>
                        )}
                        {output.round.feedback && <p className="text-xs italic text-muted-foreground">{output.round.feedback}</p>}
                      </div>
                    ) : output?.report ? (
                      <div className="space-y-2 text-sm">
                        <p className={output.report.suspicious ? "text-destructive font-semibold" : "text-green-600 font-semibold"}>
                          {output.report.suspicious ? "Suspicious patterns detected" : "No cheating detected"}
                          {typeof output.report.score === "number" ? ` · risk ${output.report.score}/100` : ""}
                        </p>
                        {output.stats && (
                          <p className="text-xs text-muted-foreground">
                            {output.stats.answers} answers · {output.stats.accuracy}% accuracy
                          </p>
                        )}
                        {Array.isArray(output.report.reasons) && output.report.reasons.length > 0 && (
                          <ul className="list-disc pl-5 text-muted-foreground text-xs">
                            {output.report.reasons.map((r: string, i: number) => <li key={i}>{r}</li>)}
                          </ul>
                        )}
                      </div>
                    ) : output?.card ? (
                      <div className="space-y-2 text-sm">
                        {output.card.headline && <p className="font-semibold text-base">{output.card.headline}</p>}
                        {output.source && (
                          <p className="text-xs text-muted-foreground">
                            {output.source.winner} vs {output.source.loser} · {output.source.score} · {output.source.topic}
                          </p>
                        )}
                        {output.card.caption && <p className="whitespace-pre-wrap">{output.card.caption}</p>}
                        {Array.isArray(output.card.hashtags) && output.card.hashtags.length > 0 && (
                          <p className="text-primary text-xs">{output.card.hashtags.join(" ")}</p>
                        )}
                      </div>
                    ) : output?.deck ? (
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-base">Deck published</p>
                        <p className="text-muted-foreground">
                          {output.deck.payload?.title ?? "Custom deck"} · {output.deck.payload?.topic ?? "Brain Duel"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(output.deck.payload?.questions ?? []).length} questions saved and ready to use.
                        </p>
                      </div>
                    ) : Array.isArray(output?.quiz?.questions) ? (
                      output.quiz.questions.map((q: any, i: number) => (
                        <div key={i} className="text-sm space-y-1">
                          <p className="font-medium">{i + 1}. {q.q ?? q.question}</p>
                          <ul className="list-disc pl-5 text-muted-foreground">
                            {(q.options ?? []).map((o: string, oi: number) => (
                              <li key={oi} className={oi === q.correct_index ? "text-foreground font-semibold" : ""}>{o}</li>
                            ))}
                          </ul>
                          {q.explanation && <p className="text-xs text-muted-foreground italic">{q.explanation}</p>}
                        </div>
                      ))
                    ) : (
                      <pre className="text-xs overflow-auto whitespace-pre-wrap">
                        {typeof output === "string" ? output : JSON.stringify(output, null, 2)}
                      </pre>
                    )}
                  </CardContent>
                </Card>
              )}

            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
