import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Grid2x2, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_sudoku4_best_solved";

// 4x4 sudoku solutions, then mask cells
const SOLUTIONS = [
  [1,2,3,4, 3,4,1,2, 2,1,4,3, 4,3,2,1],
  [2,1,4,3, 4,3,2,1, 1,2,3,4, 3,4,1,2],
  [3,4,1,2, 1,2,3,4, 4,3,2,1, 2,1,4,3],
];

const makePuzzle = () => {
  const sol = SOLUTIONS[Math.floor(Math.random()*SOLUTIONS.length)];
  const mask = Array(16).fill(false);
  let removed = 0; while (removed < 8) { const i = Math.floor(Math.random()*16); if (!mask[i]) { mask[i] = true; removed++; } }
  return { sol, given: sol.map((v,i) => mask[i] ? 0 : v), board: sol.map((v,i) => mask[i] ? 0 : v) };
};

const IQSudoku4 = () => {
  const [puzzle, setPuzzle] = useState(makePuzzle());
  const [board, setBoard] = useState<number[]>(puzzle.board);
  const [sel, setSel] = useState<number | null>(null);
  const [solved, setSolved] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
  }, []);

  const set = (v: number) => {
    if (sel === null || puzzle.given[sel] !== 0) return;
    const nb = [...board]; nb[sel] = v; setBoard(nb);
    if (nb.every((x,i) => x === puzzle.sol[i])) {
      const ns = solved+1; setSolved(ns);
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { const np = makePuzzle(); setPuzzle(np); setBoard(np.board); setSel(null); }, 800);
    }
  };

  const reset = () => { const np = makePuzzle(); setPuzzle(np); setBoard(np.board); setSel(null); setSolved(0); };

  return (
    <>
      <FloatingHowItWorks title="How IQSudoku4 works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Grid2x2 className="w-5 h-5 text-primary" /> Sudoku 4×4
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Solved: <strong>{solved}</strong> · Each row/col/2×2 box must contain 1-4</div>
        <div className="grid grid-cols-4 gap-0.5 max-w-[240px] mx-auto bg-border/40 p-0.5 rounded">
          {board.map((v, i) => {
            const given = puzzle.given[i] !== 0;
            const isCorrect = v !== 0 && v === puzzle.sol[i];
            const borderR = (i%4===1)?"border-r-2 border-r-primary/40":"";
            const borderB = (Math.floor(i/4)===1)?"border-b-2 border-b-primary/40":"";
            return (
              <button key={i} onClick={()=>!given&&setSel(i)} disabled={given}
                className={`aspect-square text-xl font-bold rounded-sm ${borderR} ${borderB} ${given?"bg-background/80 text-muted-foreground":sel===i?"bg-primary/30":isCorrect?"bg-emerald-500/20":"bg-background/40"}`}>
                {v || ""}
              </button>
            );
          })}
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[1,2,3,4].map(n => (
            <Button key={n} onClick={()=>set(n)} disabled={sel===null} variant="outline" size="sm" className="font-mono font-bold">{n}</Button>
          ))}
        </div>
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> New puzzle</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQSudoku4;
