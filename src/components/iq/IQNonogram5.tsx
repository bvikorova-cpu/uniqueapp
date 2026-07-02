import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid3x3, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_nonogram5_best_ms";
const N = 5;

const PUZZLES: number[][] = [
  [0,1,1,1,0, 1,0,0,0,1, 1,0,1,0,1, 1,0,0,0,1, 0,1,1,1,0], // smiley
  [1,0,0,0,1, 0,1,0,1,0, 0,0,1,0,0, 0,1,0,1,0, 1,0,0,0,1], // X
  [0,0,1,0,0, 0,1,1,1,0, 1,1,1,1,1, 0,0,1,0,0, 0,0,1,0,0], // arrow
  [1,1,1,1,1, 1,0,0,0,1, 1,0,1,0,1, 1,0,0,0,1, 1,1,1,1,1], // frame
];

const clues = (sol: number[]) => {
  const rows: number[][] = [], cols: number[][] = [];
  for (let r = 0; r < N; r++) {
    const arr: number[] = []; let run = 0;
    for (let c = 0; c < N; c++) {
      if (sol[r * N + c]) run++;
      else if (run) { arr.push(run); run = 0; }
    }
    if (run) arr.push(run);
    rows.push(arr.length ? arr : [0]);
  }
  for (let c = 0; c < N; c++) {
    const arr: number[] = []; let run = 0;
    for (let r = 0; r < N; r++) {
      if (sol[r * N + c]) run++;
      else if (run) { arr.push(run); run = 0; }
    }
    if (run) arr.push(run);
    cols.push(arr.length ? arr : [0]);
  }
  return { rows, cols };
};

const IQNonogram5 = () => {
  const [sol, setSol] = useState<number[]>(PUZZLES[0]);
  const [board, setBoard] = useState<number[]>(Array(N * N).fill(0)); // 0 empty, 1 fill, 2 mark
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
    const nb = [...board]; nb[i] = (nb[i] + 1) % 3; setBoard(nb);
    if (sol.every((v, idx) => (v === 1 ? nb[idx] === 1 : nb[idx] !== 1))) {
      setDone(true);
      const ms = Math.round(performance.now() - start);
      if (best === 0 || ms < best) { setBest(ms); localStorage.setItem(KEY, String(ms)); }
    }
  };

  const reset = () => {
    const p = PUZZLES[Math.floor(Math.random() * PUZZLES.length)];
    setSol(p); setBoard(Array(N * N).fill(0)); setStart(performance.now()); setNow(performance.now()); setDone(false);
  };

  const { rows, cols } = clues(sol);
  const elapsed = ((now - start) / 1000).toFixed(1);

  return (
    <>
      <FloatingHowItWorks title="How IQNonogram5 works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid3x3 className="w-5 h-5 text-primary" /> Nonogram 5×5
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best / 1000).toFixed(1)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {elapsed}s</span>
          <span>tap: empty → fill → mark</span>
        </div>
        <div className="inline-grid mx-auto" style={{ gridTemplateColumns: `40px repeat(${N}, 32px)` }}>
          <div />
          {cols.map((c, i) => (
            <div key={i} className="text-[10px] text-center text-muted-foreground font-mono">{c.join(" ")}</div>
          ))}
          {rows.map((r, ri) => (
            <>
              <div key={`r${ri}`} className="text-[10px] text-right pr-1 self-center text-muted-foreground font-mono">{r.join(" ")}</div>
              {Array.from({ length: N }).map((_, ci) => {
                const i = ri * N + ci, v = board[i];
                return (
                  <button key={`c${ri}-${ci}`} onClick={() => tap(i)}
                    className={`w-8 h-8 border border-border/40 rounded-sm text-xs ${v === 1 ? "bg-primary" : v === 2 ? "bg-background/40 text-rose-400" : "bg-background/40"}`}>
                    {v === 2 ? "✕" : ""}
                  </button>
                );
              })}
            </>
          ))}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Solved in {elapsed}s!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> New puzzle</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQNonogram5;
