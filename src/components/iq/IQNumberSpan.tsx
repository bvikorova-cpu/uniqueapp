import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Brain, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Phase = "idle" | "show" | "input" | "result";
const KEY = "iq_number_span_best";

const IQNumberSpan = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(3);
  const [sequence, setSequence] = useState<number[]>([]);
  const [shownIdx, setShownIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [best, setBest] = useState<number>(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) setBest(parseInt(stored, 10) || 0);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, []);

  const start = (lvl: number) => {
    const seq = Array.from({ length: lvl }, () => Math.floor(Math.random() * 10));
    setSequence(seq);
    setShownIdx(0);
    setAnswer("");
    setLastCorrect(null);
    setPhase("show");
    let i = 0;
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      i++;
      if (i >= seq.length) {
        if (tickRef.current) window.clearInterval(tickRef.current);
        setShownIdx(seq.length);
        setTimeout(() => setPhase("input"), 600);
      } else {
        setShownIdx(i);
      }
    }, 800);
  };

  const submit = () => {
    const guess = answer.replace(/\D/g, "");
    const correct = guess === sequence.join("");
    setLastCorrect(correct);
    setPhase("result");
    if (correct) {
      const newLvl = level + 1;
      if (newLvl - 1 > best) {
        setBest(newLvl - 1);
        localStorage.setItem(KEY, String(newLvl - 1));
      }
      setLevel(newLvl);
    }
  };

  const reset = () => {
    setLevel(3);
    setPhase("idle");
    setAnswer("");
    setSequence([]);
    setLastCorrect(null);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQNumber Span works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" /> Number Span
          {best > 0 && (
            <Badge variant="outline" className="ml-auto text-xs">
              <Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Best {best} digits
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="w-full h-40 rounded-xl border border-border/40 bg-background/40 flex items-center justify-center">
          {phase === "idle" && (
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Memorize the digit sequence, then type it back.</div>
              <Button onClick={() => start(level)}>Start at level {level}</Button>
            </div>
          )}
          {phase === "show" && (
            <div className="text-6xl font-bold font-mono">
              {sequence[shownIdx] ?? ""}
            </div>
          )}
          {phase === "input" && (
            <div className="w-full px-6 space-y-2">
              <div className="text-xs text-muted-foreground text-center">Type {sequence.length} digits</div>
              <Input
                autoFocus
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder="…"
                className="text-center text-2xl font-mono tracking-widest"
                inputMode="numeric"
              />
              <Button onClick={submit} className="w-full" size="sm">Submit</Button>
            </div>
          )}
          {phase === "result" && (
            <div className="text-center">
              <div className={`text-2xl font-bold mb-1 ${lastCorrect ? "text-emerald-500" : "text-rose-500"}`}>
                {lastCorrect ? `✓ Correct! Level ${level}` : "✗ Wrong"}
              </div>
              <div className="text-xs text-muted-foreground mb-3 font-mono">
                Was: {sequence.join(" ")}
              </div>
              {lastCorrect ? (
                <Button onClick={() => start(level)} size="sm">Next level →</Button>
              ) : (
                <Button onClick={reset} size="sm" variant="outline">
                  <RotateCcw className="w-3 h-3 mr-1" /> Try again
                </Button>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
    </>
    );
};

export default IQNumberSpan;
