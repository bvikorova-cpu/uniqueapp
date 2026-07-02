import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Clock, Loader2, Trophy, X, ChevronLeft, ChevronRight, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Question {
  id: string;
  question: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  category: string;
  difficulty: string;
}

interface Result {
  iq_score: number;
  correct: number;
  total: number;
  percentile: number;
  sub_scores: Record<string, number>;
}

interface Props {
  open: boolean;
  onClose: () => void;
  category: string;
  title: string;
  timeLimitMinutes: number;
}

export default function IQTestRunner({ open, onClose, category, title, timeLimitMinutes }: Props) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [idx, setIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(timeLimitMinutes * 60);
  const [result, setResult] = useState<Result | null>(null);
  const startedAtRef = useRef<number>(0);
  const { toast } = useToast();
  const qc = useQueryClient();

  const reset = () => {
    setSessionId(null); setQuestions([]); setAnswers({});
    setIdx(0); setResult(null); setSecondsLeft(timeLimitMinutes * 60);
  };

  useEffect(() => {
    if (!open) return;
    reset();
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.rpc("start_iq_test", { _category: category });
      setLoading(false);
      if (error) {
        toast({ title: "Cannot start test", description: error.message.replace(/_/g, " "), variant: "destructive" });
        onClose();
        return;
      }
      const row = (data as any[])?.[0];
      if (!row) { toast({ title: "No questions returned", variant: "destructive" }); onClose(); return; }
      setSessionId(row.session_id);
      setQuestions(row.questions ?? []);
      startedAtRef.current = Date.now();
      qc.invalidateQueries({ queryKey: ["iq-credits"] });
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  // Countdown
  useEffect(() => {
    if (!sessionId || result) return;
    const t = setInterval(() => setSecondsLeft(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [sessionId, result]);

  useEffect(() => {
    if (sessionId && !result && secondsLeft === 0) handleSubmit(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft]);

  const current = questions[idx];
  const answeredCount = Object.keys(answers).length;
  const progress = questions.length ? ((idx + 1) / questions.length) * 100 : 0;

  const choose = (letter: string) => {
    if (!current) return;
    setAnswers(a => ({ ...a, [current.id]: letter }));
  };

  const handleSubmit = async (auto = false) => {
    if (!sessionId || submitting) return;
    if (!auto && answeredCount < questions.length) {
      const ok = window.confirm(`You answered ${answeredCount}/${questions.length}. Submit anyway?`);
      if (!ok) return;
    }
    setSubmitting(true);
    const elapsed = Math.round((Date.now() - startedAtRef.current) / 1000);
    const { data, error } = await supabase.rpc("submit_iq_test", {
      _session_id: sessionId, _answers: answers, _time_taken: elapsed,
    });
    setSubmitting(false);
    if (error) { toast({ title: "Submit failed", description: error.message, variant: "destructive" }); return; }
    const row = (data as any[])?.[0];
    setResult(row as Result);
    qc.invalidateQueries({ queryKey: ["iq-user-stats"] });
    qc.invalidateQueries({ queryKey: ["iq-progress"] });
    qc.invalidateQueries({ queryKey: ["iq-global-counts"] });

    // Battle Pass — award Season XP based on IQ score (capped server-side at 500)
    const xp = Math.min(500, Math.max(50, Math.round((row?.iq_score ?? 100) * 1.5)));
    const { error: xpErr } = await supabase.rpc("award_iq_season_xp", { amount: xp });
    if (!xpErr) {
      toast({ title: `+${xp} Season XP`, description: "Battle Pass progress updated" });
      qc.invalidateQueries({ queryKey: ["iq-battle-pass"] });
    }
  };

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const tier = useMemo(() => {
    const iq = result?.iq_score ?? 0;
    if (iq >= 150) return { label: "Legend", color: "text-orange-400" };
    if (iq >= 140) return { label: "Grandmaster", color: "text-red-400" };
    if (iq >= 130) return { label: "Master", color: "text-purple-400" };
    if (iq >= 120) return { label: "Diamond", color: "text-blue-400" };
    if (iq >= 110) return { label: "Platinum", color: "text-cyan-400" };
    if (iq >= 100) return { label: "Gold", color: "text-yellow-500" };
    if (iq >= 90)  return { label: "Silver", color: "text-gray-400" };
    return { label: "Bronze", color: "text-amber-700" };
  }, [result]);

  return (
    <>
      <FloatingHowItWorks title="How IQTest Runner works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" /> {title}
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="py-16 text-center">
            <Loader2 className="h-8 w-8 mx-auto animate-spin text-purple-500" />
            <p className="text-sm text-muted-foreground mt-3">Loading questions…</p>
          </div>
        )}

        {!loading && !result && current && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <Badge variant="outline" className="text-xs">{idx + 1} / {questions.length}</Badge>
              <div className="flex items-center gap-2 text-sm font-mono">
                <Clock className="h-4 w-4" />
                <span className={secondsLeft < 60 ? "text-red-500" : ""}>
                  {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                </span>
              </div>
            </div>
            <Progress value={progress} className="h-1.5" />

            <Card className="border-purple-500/20">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Badge className="text-[10px] capitalize bg-purple-500/10 text-purple-400 border-purple-500/30">{current.category}</Badge>
                  <Badge className="text-[10px] capitalize bg-pink-500/10 text-pink-400 border-pink-500/30">{current.difficulty}</Badge>
                </div>
                <p className="text-base sm:text-lg font-semibold leading-relaxed">{current.question}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(["a","b","c","d"] as const).map(letter => {
                    const text = (current as any)[`option_${letter}`];
                    const selected = answers[current.id] === letter;
                    return (
                      <button
                        key={letter}
                        onClick={() => choose(letter)}
                        className={`text-left p-3 rounded-lg border transition-all ${selected ? "border-purple-500 bg-purple-500/15 ring-1 ring-purple-500" : "border-border hover:border-purple-500/40 hover:bg-muted/40"}`}
                      >
                        <span className="font-bold uppercase text-xs text-purple-400 mr-2">{letter}.</span>
                        <span className="text-sm">{text}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="flex items-center justify-between gap-2">
              <Button variant="outline" size="sm" disabled={idx === 0} onClick={() => setIdx(i => i - 1)}>
                <ChevronLeft className="h-4 w-4 mr-1" /> Prev
              </Button>
              <p className="text-xs text-muted-foreground">{answeredCount}/{questions.length} answered</p>
              {idx < questions.length - 1 ? (
                <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600" onClick={() => setIdx(i => i + 1)}>
                  Next <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <Button size="sm" className="bg-gradient-to-r from-emerald-600 to-teal-600" onClick={() => handleSubmit(false)} disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Check className="h-4 w-4 mr-1" /> Submit</>}
                </Button>
              )}
            </div>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 py-2">
              <div className="text-center space-y-2">
                <Trophy className="h-12 w-12 mx-auto text-amber-400" />
                <p className="text-sm text-muted-foreground">Your IQ Score</p>
                <p className="text-6xl font-black bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">{result.iq_score}</p>
                <p className={`text-sm font-bold ${tier.color}`}>{tier.label} tier</p>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <Card className="p-3"><p className="text-[10px] text-muted-foreground">Correct</p><p className="font-bold">{result.correct}/{result.total}</p></Card>
                <Card className="p-3"><p className="text-[10px] text-muted-foreground">Accuracy</p><p className="font-bold">{Math.round(100 * result.correct / Math.max(1, result.total))}%</p></Card>
                <Card className="p-3"><p className="text-[10px] text-muted-foreground">Percentile</p><p className="font-bold">{Number(result.percentile).toFixed(1)}</p></Card>
              </div>
              {result.sub_scores && Object.keys(result.sub_scores).length > 0 && (
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-xs font-semibold">Cognitive breakdown</p>
                    {Object.entries(result.sub_scores).map(([k, v]) => (
                      <div key={k}>
                        <div className="flex justify-between text-xs mb-1"><span className="capitalize">{k}</span><span>{Math.round(Number(v))}</span></div>
                        <Progress value={Number(v)} className="h-1.5" />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
              <Button className="w-full" onClick={onClose}>Close</Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
    </>
    );
}
