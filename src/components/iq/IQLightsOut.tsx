import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_lightsout_best_moves";
const N = 4;

const scramble = (): boolean[] => {
  const g = Array(N * N).fill(false);
  for (let k = 0; k < 8; k++) {
    const i = Math.floor(Math.random() * N * N);
    toggle(g, i);
  }
  return g;
};

function toggle(g: boolean[], i: number) {
  const r = Math.floor(i / N), c = i % N;
  const idx = [[r, c], [r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]];
  idx.forEach(([nr, nc]) => {
    if (nr >= 0 && nr < N && nc >= 0 && nc < N) g[nr * N + nc] = !g[nr * N + nc];
  });
}

const IQLightsOut = () => {
  const [grid, setGrid] = useState<boolean[]>(scramble);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const tap = (i: number) => {
    if (done) return;
    const ng = [...grid]; toggle(ng, i); setGrid(ng);
    const m = moves + 1; setMoves(m);
    if (ng.every(x => !x)) {
      setDone(true);
      if (best === 0 || m < best) { setBest(m); localStorage.setItem(KEY, String(m)); }
    }
  };

  const reset = () => { setGrid(scramble()); setMoves(0); setDone(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQLights Out works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-primary" /> Lights Out 4×4
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} moves</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Turn off all lights · Moves: <strong>{moves}</strong></div>
        <div className="grid grid-cols-4 gap-1 max-w-[240px] mx-auto">
          {grid.map((on, i) => (
            <button key={i} onClick={() => tap(i)}
              className={`aspect-square rounded-md transition-colors ${on ? "bg-amber-400 shadow-[0_0_12px_hsl(var(--primary))]" : "bg-background/60 border border-border/40"}`} />
          ))}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 All off in {moves} moves!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> New puzzle</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQLightsOut;
