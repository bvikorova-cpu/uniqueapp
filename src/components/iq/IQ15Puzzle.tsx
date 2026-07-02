import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Move3d, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_15puzzle_best_moves";
const N = 4;

const isSolvable = (a: number[]) => {
  let inv = 0;
  for (let i=0;i<a.length;i++) for (let j=i+1;j<a.length;j++) if (a[i]&&a[j]&&a[i]>a[j]) inv++;
  const blankRow = N - Math.floor(a.indexOf(0)/N);
  return (N%2===1) ? inv%2===0 : (blankRow%2===0) ? inv%2===1 : inv%2===0;
};

const newBoard = (): number[] => {
  while (true) {
    const a = Array.from({length:N*N},(_,i)=>i);
    for (let i=a.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; }
    if (a.some((v,i)=>v!==(i+1)%(N*N)) && isSolvable(a)) return a;
  }
};

const IQ15Puzzle = () => {
  const [board, setBoard] = useState<number[]>(newBoard());
  const [moves, setMoves] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const tap = (i: number) => {
    if (done) return;
    const z = board.indexOf(0);
    const r1 = Math.floor(i/N), c1 = i%N, r2 = Math.floor(z/N), c2 = z%N;
    if ((Math.abs(r1-r2) + Math.abs(c1-c2)) !== 1) return;
    if (start === null) {
      const t = performance.now(); setStart(t); setNow(t);
      if (tRef.current) window.clearInterval(tRef.current);
      tRef.current = window.setInterval(() => setNow(performance.now()), 100);
    }
    const nb = [...board]; [nb[i], nb[z]] = [nb[z], nb[i]]; setBoard(nb);
    setMoves(m => m+1);
    if (nb.every((v,idx)=>v===(idx+1)%(N*N))) {
      if (tRef.current) window.clearInterval(tRef.current);
      setDone(true);
      if (best === 0 || moves+1 < best) { setBest(moves+1); localStorage.setItem(KEY, String(moves+1)); }
    }
  };

  const reset = () => { if (tRef.current) window.clearInterval(tRef.current); setBoard(newBoard()); setMoves(0); setStart(null); setNow(0); setDone(false); };
  const elapsed = start ? ((now - start) / 1000).toFixed(1) : "0.0";

  return (
    <>
      <FloatingHowItWorks title="How IQ15Puzzle works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Move3d className="w-5 h-5 text-primary" /> 15-Puzzle
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {elapsed}s</span>
          <span>Moves: <strong>{moves}</strong></span>
        </div>
        <div className="grid grid-cols-4 gap-1 max-w-[260px] mx-auto">
          {board.map((v, i) => (
            <button key={i} onClick={()=>tap(i)} disabled={v===0||done}
              className={`aspect-square rounded-lg text-lg font-bold font-mono transition-all ${v===0?"bg-transparent":"bg-primary/20 border border-primary/40 hover:bg-primary/30"}`}>
              {v || ""}
            </button>
          ))}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Solved in {moves} moves!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Shuffle</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQ15Puzzle;
