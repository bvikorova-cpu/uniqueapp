import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calculator, Trophy, RotateCcw, Timer } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Phase = "idle" | "playing" | "done";
const KEY = "iq_mental_math_best";
const DURATION = 60;

type Q = { text: string; answer: number };

const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const genQuestion = (level: number): Q => {
  const ops = level < 5 ? ["+", "-"] : level < 10 ? ["+", "-", "×"] : ["+", "-", "×", "÷"];
  const op = ops[rand(0, ops.length - 1)];
  let a = rand(2, 10 + level * 2);
  let b = rand(2, 10 + level);
  if (op === "-") { if (b > a) [a, b] = [b, a]; return { text: `${a} − ${b}`, answer: a - b }; }
  if (op === "×") { a = rand(2, 12); b = rand(2, 12); return { text: `${a} × ${b}`, answer: a * b }; }
  if (op === "÷") { b = rand(2, 12); const r = rand(2, 12); return { text: `${b * r} ÷ ${b}`, answer: r }; }
  return { text: `${a} + ${b}`, answer: a + b };
};

const IQMentalMath = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [q, setQ] = useState<Q | null>(null);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<"ok" | "err" | null>(null);
  const tickRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) setBest(parseInt(stored, 10) || 0);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, []);

  const start = () => {
    setScore(0); setStreak(0); setTime(DURATION); setAnswer("");
    setQ(genQuestion(0));
    setPhase("playing");
    if (tickRef.current) window.clearInterval(tickRef.current);
    tickRef.current = window.setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          if (tickRef.current) window.clearInterval(tickRef.current);
          setPhase("done");
          setScore(s => {
            if (s > best) { setBest(s); localStorage.setItem(KEY, String(s)); }
            return s;
          });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const submit = () => {
    if (!q) return;
    const guess = parseInt(answer, 10);
    if (guess === q.answer) {
      setScore(s => s + 1 + Math.floor(streak / 3));
      setStreak(s => s + 1);
      setFlash("ok");
    } else {
      setStreak(0);
      setFlash("err");
    }
    setAnswer("");
    setQ(genQuestion(score));
    setTimeout(() => setFlash(null), 200);
  };

  const reset = () => {
    if (tickRef.current) window.clearInterval(tickRef.current);
    setPhase("idle"); setScore(0); setStreak(0); setTime(DURATION); setAnswer(""); setQ(null);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQMental Math works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" /> Mental Math Sprint
          {best > 0 && (
            <Badge variant="outline" className="ml-auto text-xs">
              <Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Best {best}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {phase === "idle" && (
          <div className="h-40 rounded-xl border border-border/40 bg-background/40 flex flex-col items-center justify-center text-center gap-2">
            <div className="text-sm text-muted-foreground">Solve as many as you can in {DURATION}s</div>
            <Button onClick={start}>Start Sprint</Button>
          </div>
        )}

        {phase === "playing" && q && (
          <div className={`rounded-xl border border-border/40 p-4 transition-colors ${flash === "ok" ? "bg-emerald-500/20" : flash === "err" ? "bg-rose-500/20" : "bg-background/40"}`}>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {time}s</span>
              <span>Score: <strong>{score}</strong></span>
              <span>Streak: <strong>{streak}</strong></span>
            </div>
            <div className="text-5xl font-bold text-center font-mono my-4">{q.text}</div>
            <Input
              autoFocus
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className="text-center text-2xl font-mono"
              inputMode="numeric"
              placeholder="?"
            />
          </div>
        )}

        {phase === "done" && (
          <div className="h-40 rounded-xl border border-border/40 bg-background/40 flex flex-col items-center justify-center text-center gap-2">
            <div className="text-3xl font-bold">Score: {score}</div>
            <div className="text-xs text-muted-foreground">{score >= best && score > 0 ? "🏆 New best!" : `Best: ${best}`}</div>
            <div className="flex gap-2">
              <Button onClick={start} size="sm">Play again</Button>
              <Button onClick={reset} size="sm" variant="outline"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQMentalMath;
