import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid3x3, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_schulte_best_ms";
const N = 25;

const shuffle = () => {
  const a = Array.from({ length: N }, (_, i) => i + 1);
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

const IQSchulte = () => {
  const [phase, setPhase] = useState<"idle"|"play"|"done">("idle");
  const [grid, setGrid] = useState<number[]>(shuffle());
  const [next, setNext] = useState(1);
  const [start, setStart] = useState(0);
  const [now, setNow] = useState(0);
  const [best, setBest] = useState(0);
  const [errors, setErrors] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const begin = () => {
    setGrid(shuffle()); setNext(1); setErrors(0);
    const t = performance.now(); setStart(t); setNow(t); setPhase("play");
    if (tRef.current) window.clearInterval(tRef.current);
    tRef.current = window.setInterval(() => setNow(performance.now()), 50);
  };

  const tap = (n: number) => {
    if (phase !== "play") return;
    if (n === next) {
      if (n === N) {
        if (tRef.current) window.clearInterval(tRef.current);
        const elapsed = Math.round(performance.now() - start);
        setPhase("done");
        if (best === 0 || elapsed < best) { setBest(elapsed); localStorage.setItem(KEY, String(elapsed)); }
      } else setNext(next + 1);
    } else setErrors(e => e + 1);
  };

  const reset = () => { if (tRef.current) window.clearInterval(tRef.current); setPhase("idle"); setNext(1); setErrors(0); };
  const elapsed = phase === "play" ? Math.round((now - start) / 100) / 10 : 0;

  return (
    <>
      <FloatingHowItWorks title="How IQSchulte works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-primary" /> Schulte Table
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best/1000).toFixed(1)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {phase === "idle" && (
          <div className="h-32 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/40">
            <div className="text-xs text-muted-foreground text-center px-4">Tap numbers 1 → 25 in order, as fast as you can</div>
            <Button onClick={begin}>Start</Button>
          </div>
        )}
        {(phase === "play" || phase === "done") && (
          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {phase === "play" ? `${elapsed}s` : `${(((performance.now()-start) || best)/1000).toFixed(1)}s`}</span>
              <span>Next: <strong className="text-primary">{phase === "done" ? "✓" : next}</strong></span>
              <span>Errors: {errors}</span>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {grid.map((n) => (
                <button key={n} onClick={() => tap(n)} disabled={phase === "done"}
                  className={`aspect-square rounded-md border text-sm font-mono font-bold transition-colors ${n < next ? "bg-emerald-500/20 border-emerald-400/40 text-muted-foreground" : "bg-background/60 border-border/40 hover:bg-primary/10"}`}>
                  {n}
                </button>
              ))}
            </div>
            {phase === "done" && (
              <div className="flex gap-2 mt-3">
                <Button onClick={begin} className="flex-1" size="sm">Again</Button>
                <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-3 h-3" /></Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQSchulte;
