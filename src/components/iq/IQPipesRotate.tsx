import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pipette, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_pipes_best_ms";
const N = 4;

// Each pipe encoded as 4-bit mask: top=1, right=2, bottom=4, left=8
// Solution: a connected loop. We use a fixed solvable layout then scramble rotations.
const SOL: number[] = [
  6, 12, 6, 12,
  3, 9, 3, 9,
  6, 12, 6, 12,
  3, 9, 3, 9,
];

const rotate = (m: number, times: number) => {
  let v = m;
  for (let i = 0; i < times; i++) v = ((v << 1) | (v >> 3)) & 15;
  return v;
};

const IQPipesRotate = () => {
  const [tiles, setTiles] = useState<number[]>(() => SOL.map(() => Math.floor(Math.random() * 4)));
  const [start, setStart] = useState(performance.now());
  const [now, setNow] = useState(performance.now());
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  useEffect(() => {
    if (done) { if (tRef.current) window.clearInterval(tRef.current); return; }
    tRef.current = window.setInterval(() => setNow(performance.now()), 100);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, [done]);

  const tap = (i: number) => {
    if (done) return;
    const nt = [...tiles]; nt[i] = (nt[i] + 1) % 4; setTiles(nt);
    const ok = nt.every((rot, idx) => rotate(SOL[idx], rot) === SOL[idx] || rotate(SOL[idx], rot) === SOL[idx]);
    // Simpler check: all rotations are 0
    if (nt.every(r => r === 0)) {
      setDone(true);
      const ms = Math.round(performance.now() - start);
      if (best === 0 || ms < best) { setBest(ms); localStorage.setItem(KEY, String(ms)); }
    }
  };

  const reset = () => { setTiles(SOL.map(() => Math.floor(Math.random() * 4))); setStart(performance.now()); setNow(performance.now()); setDone(false); };

  const elapsed = ((now - start) / 1000).toFixed(1);
  const renderPipe = (mask: number, rot: number) => {
    const m = rotate(mask, rot);
    return (
      <>
        <FloatingHowItWorks title="How IQPipes Rotate works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <svg viewBox="0 0 40 40" className="w-full h-full">
        {(m & 1) ? <line x1="20" y1="0" x2="20" y2="20" stroke="hsl(var(--primary))" strokeWidth="6" /> : null}
        {(m & 2) ? <line x1="20" y1="20" x2="40" y2="20" stroke="hsl(var(--primary))" strokeWidth="6" /> : null}
        {(m & 4) ? <line x1="20" y1="20" x2="20" y2="40" stroke="hsl(var(--primary))" strokeWidth="6" /> : null}
        {(m & 8) ? <line x1="0" y1="20" x2="20" y2="20" stroke="hsl(var(--primary))" strokeWidth="6" /> : null}
        <circle cx="20" cy="20" r="3" fill="hsl(var(--primary))" />
      </svg>
      </>
      );
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Pipette className="w-5 h-5 text-primary" /> Pipes Rotate
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best/1000).toFixed(1)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {elapsed}s</span>
          <span>Click to rotate · align all pipes</span>
        </div>
        <div className="grid grid-cols-4 gap-1 max-w-[200px] mx-auto">
          {tiles.map((rot, i) => (
            <button key={i} onClick={() => tap(i)} className="aspect-square bg-background/60 border border-border/40 rounded p-0.5">
              {renderPipe(SOL[i], rot)}
            </button>
          ))}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Aligned in {elapsed}s!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> New puzzle</Button>
      </CardContent>
    </Card>
  );
};

export default IQPipesRotate;
