import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, Sparkles, ScanLine, Mic, ShieldAlert, Image as ImageIcon, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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

const FEATURES: Feature[] = [
  { id: "ai.generateQuiz", title: "AI Question Generator", desc: "Any topic, any difficulty — 10 fresh MCQs", icon: Sparkles, credits: 5, ai: true, action: "ai.generateQuiz" },
  { id: "ai.ocrScan", title: "Scan → Quiz (OCR)", desc: "Photograph notes; AI builds a deck", icon: ScanLine, credits: 5, ai: true, action: "ai.ocrScan" },
  { id: "ai.voiceQuiz", title: "Voice Quiz Battle", desc: "Speak your answer, AI scores it", icon: Mic, credits: 3, ai: true, action: "ai.voiceQuiz" },
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

  useEffect(() => {
    if (!active) return;
    setOutput(null);
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

              <Button onClick={run} disabled={busy} className="w-full">
                {busy ? "Working…" : `Run (${active.credits} credits)`}
              </Button>

              {output && (
                <Card className="bg-muted/30">
                  <CardContent className="pt-4 space-y-3">
                    {Array.isArray(output?.quiz?.questions) ? (
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
