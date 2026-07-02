import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bomb, Trophy, Timer, RotateCcw, Flag } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_minesweeper_best_ms";
const N = 6;
const MINES = 6;

type Cell = { mine: boolean; open: boolean; flag: boolean; n: number };

const build = (): Cell[] => {
  const cells: Cell[] = Array.from({ length: N * N }, () => ({ mine: false, open: false, flag: false, n: 0 }));
  let placed = 0;
  while (placed < MINES) {
    const i = Math.floor(Math.random() * N * N);
    if (!cells[i].mine) { cells[i].mine = true; placed++; }
  }
  for (let i = 0; i < N * N; i++) {
    if (cells[i].mine) continue;
    const r = Math.floor(i / N), c = i % N;
    let n = 0;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
      if (cells[nr * N + nc].mine) n++;
    }
    cells[i].n = n;
  }
  return cells;
};

const IQMinesweeper = () => {
  const [cells, setCells] = useState<Cell[]>(build);
  const [phase, setPhase] = useState<"play" | "won" | "lost">("play");
  const [start, setStart] = useState<number>(performance.now());
  const [now, setNow] = useState<number>(performance.now());
  const [best, setBest] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  useEffect(() => {
    if (phase !== "play") { if (tRef.current) window.clearInterval(tRef.current); return; }
    tRef.current = window.setInterval(() => setNow(performance.now()), 100);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, [phase]);

  const flood = (arr: Cell[], i: number) => {
    if (i < 0 || i >= N * N || arr[i].open || arr[i].flag) return;
    arr[i].open = true;
    if (arr[i].n !== 0) return;
    const r = Math.floor(i / N), c = i % N;
    for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr, nc = c + dc;
      if (nr < 0 || nr >= N || nc < 0 || nc >= N) continue;
      flood(arr, nr * N + nc);
    }
  };

  const click = (i: number) => {
    if (phase !== "play" || cells[i].flag) return;
    const arr = cells.map(c => ({ ...c }));
    if (arr[i].mine) {
      arr.forEach(c => { if (c.mine) c.open = true; });
      setCells(arr); setPhase("lost"); return;
    }
    flood(arr, i);
    const safeAll = arr.every(c => c.mine || c.open);
    setCells(arr);
    if (safeAll) {
      setPhase("won");
      const ms = Math.round(performance.now() - start);
      if (best === 0 || ms < best) { setBest(ms); localStorage.setItem(KEY, String(ms)); }
    }
  };

  const flag = (e: React.MouseEvent, i: number) => {
    e.preventDefault();
    if (phase !== "play" || cells[i].open) return;
    const arr = cells.map(c => ({ ...c }));
    arr[i].flag = !arr[i].flag;
    setCells(arr);
  };

  const reset = () => { setCells(build()); setPhase("play"); setStart(performance.now()); setNow(performance.now()); };

  const elapsed = ((now - start) / 1000).toFixed(1);

  return (
    <>
      <FloatingHowItWorks title="How IQMinesweeper works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bomb className="w-5 h-5 text-primary" /> Minesweeper 6×6
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best / 1000).toFixed(1)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {elapsed}s</span>
          <span>{MINES} mines · long-press = flag</span>
        </div>
        <div className="grid grid-cols-6 gap-0.5 max-w-[280px] mx-auto">
          {cells.map((c, i) => (
            <button key={i} onClick={() => click(i)} onContextMenu={(e) => flag(e, i)}
              className={`aspect-square text-sm font-bold rounded-sm transition-colors ${c.open ? (c.mine ? "bg-rose-500/30" : "bg-background/80") : "bg-primary/20 hover:bg-primary/30"}`}>
              {c.open ? (c.mine ? "💣" : c.n || "") : c.flag ? <Flag className="w-3 h-3 inline text-amber-400" /> : ""}
            </button>
          ))}
        </div>
        {phase === "won" && <div className="text-center text-emerald-400 font-bold">🏆 Cleared in {elapsed}s!</div>}
        {phase === "lost" && <div className="text-center text-rose-400 font-bold">💥 Boom!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> New game</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQMinesweeper;
