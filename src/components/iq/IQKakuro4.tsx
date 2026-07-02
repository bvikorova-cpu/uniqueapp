import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calculator, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_kakuro4_best_ms";
// 4x4 with simple row/col sums, cells 1-9 unique per run
// Layout: H = clue cell, . = number cell. Two simple runs per board.
type Cell = { type: "clue" | "num"; rs?: number; cs?: number; val?: number };

const PUZZLES: { board: Cell[][]; sol: number[][] }[] = [
  {
    board: [
      [{ type: "clue" }, { type: "clue", cs: 17 }, { type: "clue", cs: 11 }, { type: "clue" }],
      [{ type: "clue", rs: 11 }, { type: "num" }, { type: "num" }, { type: "clue" }],
      [{ type: "clue", rs: 17 }, { type: "num" }, { type: "num" }, { type: "clue" }],
      [{ type: "clue" }, { type: "clue" }, { type: "clue" }, { type: "clue" }],
    ],
    sol: [[0,0,0,0],[0,8,3,0],[0,9,8,0],[0,0,0,0]],
  },
];

const IQKakuro4 = () => {
  const [puzzle] = useState(PUZZLES[0]);
  const [vals, setVals] = useState<Record<string, number>>({});
  const [start, setStart] = useState(performance.now());
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0); }, []);

  const set = (r: number, c: number, v: number) => {
    if (done) return;
    const nv = { ...vals, [`${r}-${c}`]: v };
    setVals(nv);
    let ok = true;
    for (let r2 = 0; r2 < 4; r2++) for (let c2 = 0; c2 < 4; c2++) {
      if (puzzle.board[r2][c2].type === "num" && nv[`${r2}-${c2}`] !== puzzle.sol[r2][c2]) ok = false;
    }
    if (ok) {
      setDone(true);
      const ms = Math.round(performance.now() - start);
      if (best === 0 || ms < best) { setBest(ms); localStorage.setItem(KEY, String(ms)); }
    }
  };

  const reset = () => { setVals({}); setStart(performance.now()); setDone(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQKakuro4 works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-primary" /> Kakuro 4×4
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best/1000).toFixed(1)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Fill cells 1-9 so rows/cols match clue sums</div>
        <div className="grid grid-cols-4 gap-1 max-w-[240px] mx-auto">
          {puzzle.board.map((row, r) => row.map((cell, c) => {
            const k = `${r}-${c}`;
            if (cell.type === "clue") {
              return (
                <div key={k} className="aspect-square bg-muted/30 border border-border/40 rounded text-[9px] flex flex-col items-end justify-end p-0.5">
                  {cell.cs && <span className="text-amber-400">{cell.cs}↓</span>}
                  {cell.rs && <span className="text-sky-400">{cell.rs}→</span>}
                </div>
              );
            }
            return (
              <select key={k} value={vals[k] ?? 0} onChange={e => set(r, c, parseInt(e.target.value, 10))}
                className="aspect-square bg-background/60 border border-border/40 rounded text-center text-sm">
                <option value={0}>·</option>
                {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            );
          }))}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Solved!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQKakuro4;
