import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type State = "idle" | "waiting" | "ready" | "result" | "early";
const KEY = "iq_reaction_best";

const IQReactionTime = () => {
  const [state, setState] = useState<State>("idle");
  const [time, setTime] = useState<number | null>(null);
  const [best, setBest] = useState<number | null>(null);
  const [attempts, setAttempts] = useState<number[]>([]);
  const startRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(KEY);
    if (stored) setBest(parseInt(stored, 10));
    return () => { if (timeoutRef.current) window.clearTimeout(timeoutRef.current); };
  }, []);

  const begin = () => {
    setTime(null);
    setState("waiting");
    const delay = 1000 + Math.random() * 3000;
    timeoutRef.current = window.setTimeout(() => {
      startRef.current = performance.now();
      setState("ready");
    }, delay);
  };

  const click = () => {
    if (state === "idle" || state === "result" || state === "early") {
      begin();
      return;
    }
    if (state === "waiting") {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      setState("early");
      return;
    }
    if (state === "ready") {
      const elapsed = Math.round(performance.now() - startRef.current);
      setTime(elapsed);
      setAttempts(a => [elapsed, ...a].slice(0, 5));
      if (best === null || elapsed < best) {
        setBest(elapsed);
        localStorage.setItem(KEY, String(elapsed));
      }
      setState("result");
    }
  };

  const reset = () => {
    setAttempts([]);
    setState("idle");
    setTime(null);
  };

  const avg = attempts.length ? Math.round(attempts.reduce((a, b) => a + b, 0) / attempts.length) : null;

  const bg = {
    idle: "bg-primary/10 hover:bg-primary/20",
    waiting: "bg-rose-500/30",
    ready: "bg-emerald-500/40 animate-pulse",
    result: "bg-primary/20",
    early: "bg-amber-500/30",
  }[state];

  const message = {
    idle: "Click to start",
    waiting: "Wait for green…",
    ready: "CLICK NOW!",
    result: `${time}ms`,
    early: "Too early! Click to retry",
  }[state];

  const tier = time === null ? "" :
    time < 200 ? "Lightning" :
    time < 270 ? "Excellent" :
    time < 350 ? "Good" :
    time < 450 ? "Average" : "Slow";

  return (
    <>
      <FloatingHowItWorks title="How IQReaction Time works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" /> Reaction Time
          {best !== null && (
            <Badge variant="outline" className="ml-auto text-xs">
              <Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Best {best}ms
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <button
          onClick={click}
          className={`w-full h-48 rounded-xl border border-border/40 transition-colors flex flex-col items-center justify-center text-center ${bg}`}
        >
          <div className="text-2xl font-bold mb-1">{message}</div>
          {state === "result" && tier && (
            <div className="text-sm text-muted-foreground">{tier} reflexes</div>
          )}
          {state === "idle" && (
            <div className="text-xs text-muted-foreground mt-2">Wait for green, then click as fast as you can</div>
          )}
        </button>

        {attempts.length > 0 && (
          <div className="flex items-center justify-between text-xs">
            <div className="flex gap-2">
              {attempts.map((a, i) => (
                <span key={i} className="px-2 py-1 rounded bg-background/40 font-mono">{a}ms</span>
              ))}
            </div>
            {avg !== null && <span className="text-muted-foreground">Avg: {avg}ms</span>}
          </div>
        )}

        {attempts.length > 0 && (
          <Button variant="ghost" size="sm" onClick={reset} className="w-full">
            <RotateCcw className="w-3 h-3 mr-1" /> Reset
          </Button>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQReactionTime;
