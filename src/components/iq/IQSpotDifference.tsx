import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_spotdiff_best_streak";
const ICONS = ["★", "♥", "♦", "♣", "♠", "●", "■", "▲"];
const N = 5;

const make = () => {
  const left = Array.from({ length: N * N }, () => ICONS[Math.floor(Math.random() * ICONS.length)]);
  const right = [...left];
  const diffs = new Set<number>();
  while (diffs.size < 3) diffs.add(Math.floor(Math.random() * N * N));
  diffs.forEach(idx => {
    let v = ICONS[Math.floor(Math.random() * ICONS.length)];
    while (v === left[idx]) v = ICONS[Math.floor(Math.random() * ICONS.length)];
    right[idx] = v;
  });
  return { left, right, diffs: Array.from(diffs) };
};

const IQSpotDifference = () => {
  const [puzzle, setPuzzle] = useState(make);
  const [found, setFound] = useState<number[]>([]);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [wrong, setWrong] = useState<number | null>(null);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const tap = (i: number) => {
    if (found.includes(i)) return;
    if (puzzle.diffs.includes(i)) {
      const nf = [...found, i]; setFound(nf);
      if (nf.length === 3) {
        const ns = streak + 1; setStreak(ns);
        if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
        setTimeout(() => { setPuzzle(make()); setFound([]); }, 800);
      }
    } else {
      setWrong(i); setTimeout(() => setWrong(null), 400);
    }
  };

  const reset = () => { setStreak(0); setPuzzle(make()); setFound([]); };

  const renderGrid = (arr: string[], side: "L" | "R") => (
    <div className="grid grid-cols-5 gap-px bg-border/40 p-px rounded">
      {arr.map((c, i) => {
        const ok = side === "R" && found.includes(i);
        const bad = side === "R" && wrong === i;
        return (
          <>
            <FloatingHowItWorks title="How IQSpot Difference works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
            <button key={i} onClick={() => side === "R" && tap(i)} disabled={side === "L"}
            className={`aspect-square text-sm flex items-center justify-center ${ok ? "bg-emerald-500/40" : bad ? "bg-rose-500/40" : "bg-background/60"}`}>
            {c}
          </button>
          </>
          );
      })}
    </div>
  );

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5 text-primary" /> Spot Difference
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} streak</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Find 3 differences (right grid) · Streak: <strong>{streak}</strong></div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[10px] text-muted-foreground text-center mb-1">REFERENCE</div>
            {renderGrid(puzzle.left, "L")}
          </div>
          <div>
            <div className="text-[10px] text-muted-foreground text-center mb-1">FIND DIFFS · {found.length}/3</div>
            {renderGrid(puzzle.right, "R")}
          </div>
        </div>
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
  );
};

export default IQSpotDifference;
