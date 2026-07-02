import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Phase = "idle" | "show" | "input" | "result";
const KEY = "iq_visual_memory_best";
const GRID = 5;

const pickCells = (n: number) => {
  const set = new Set<number>();
  while (set.size < n) set.add(Math.floor(Math.random() * GRID * GRID));
  return set;
};

const IQVisualMemory = () => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [level, setLevel] = useState(3);
  const [target, setTarget] = useState<Set<number>>(new Set());
  const [picked, setPicked] = useState<Set<number>>(new Set());
  const [best, setBest] = useState(0);
  const [lastOk, setLastOk] = useState<boolean | null>(null);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY);
    if (s) setBest(parseInt(s, 10) || 0);
    return () => { if (tRef.current) window.clearTimeout(tRef.current); };
  }, []);

  const start = (lvl = level) => {
    const t = pickCells(lvl);
    setTarget(t); setPicked(new Set()); setLastOk(null);
    setPhase("show");
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => setPhase("input"), 1500);
  };

  const tap = (i: number) => {
    if (phase !== "input") return;
    const next = new Set(picked); next.add(i); setPicked(next);
    if (next.size === target.size) {
      const ok = [...next].every(x => target.has(x));
      setLastOk(ok);
      setPhase("result");
      if (ok) {
        const newLvl = level + 1;
        setLevel(newLvl);
        if (newLvl > best) { setBest(newLvl); localStorage.setItem(KEY, String(newLvl)); }
      } else {
        setLevel(3);
      }
    }
  };

  const reset = () => { setPhase("idle"); setLevel(3); setTarget(new Set()); setPicked(new Set()); setLastOk(null); };

  return (
    <>
      <FloatingHowItWorks title="How IQVisual Memory works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" /> Visual Memory
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Lv {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Level: <strong>{level}</strong> ({level} cells)</span>
          {phase === "show" && <span>Memorize…</span>}
          {phase === "input" && <span>Tap them ({picked.size}/{target.size})</span>}
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {Array.from({ length: GRID * GRID }).map((_, i) => {
            const isTarget = target.has(i);
            const isPicked = picked.has(i);
            let cls = "bg-background/40 border-border/40";
            if (phase === "show" && isTarget) cls = "bg-primary border-primary";
            else if (phase === "input" && isPicked) cls = "bg-primary/60 border-primary";
            else if (phase === "result") {
              if (isTarget && isPicked) cls = "bg-emerald-500 border-emerald-400";
              else if (isTarget) cls = "bg-amber-500/60 border-amber-400";
              else if (isPicked) cls = "bg-rose-500 border-rose-400";
            }
            return (
              <button key={i} onClick={() => tap(i)} disabled={phase !== "input"} className={`aspect-square rounded-md border transition-colors ${cls}`} />
            );
          })}
        </div>
        {phase === "idle" && <Button onClick={() => start(3)} className="w-full">Start</Button>}
        {phase === "result" && (
          <div className="flex gap-2">
            <Button onClick={() => start()} className="flex-1">{lastOk ? "Next level" : "Retry"}</Button>
            <Button onClick={reset} variant="outline" size="icon"><RotateCcw className="w-4 h-4" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQVisualMemory;
