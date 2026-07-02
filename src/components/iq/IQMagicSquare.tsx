import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_magicsq_best_ms";
// 3x3 with sums = 15. Two cells given, fill rest with 1-9 unique.
const HINTS: (number | null)[] = [null, null, 6, null, 5, null, 8, null, null];

const IQMagicSquare = () => {
  const [vals, setVals] = useState<(number | null)[]>(HINTS);
  const [start, setStart] = useState(performance.now());
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0); }, []);

  const set = (i: number, v: number) => {
    if (done || HINTS[i] !== null) return;
    const nv = [...vals]; nv[i] = v || null; setVals(nv);
    if (nv.every(x => x !== null)) {
      const used = new Set(nv);
      if (used.size !== 9) return;
      const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
      if (lines.every(l => l.reduce((s, idx) => s + (nv[idx] || 0), 0) === 15)) {
        setDone(true);
        const ms = Math.round(performance.now() - start);
        if (best === 0 || ms < best) { setBest(ms); localStorage.setItem(KEY, String(ms)); }
      }
    }
  };

  const reset = () => { setVals([...HINTS]); setStart(performance.now()); setDone(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQMagic Square works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Magic Square 3×3
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best/1000).toFixed(1)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Use 1-9 once · all rows/cols/diagonals sum to 15</div>
        <div className="grid grid-cols-3 gap-1 max-w-[180px] mx-auto">
          {vals.map((v, i) => (
            <select key={i} value={v ?? 0} onChange={e => set(i, parseInt(e.target.value, 10))}
              disabled={HINTS[i] !== null}
              className={`aspect-square text-center text-lg font-bold rounded border ${HINTS[i] !== null ? "bg-primary/20 border-primary/40 text-primary" : "bg-background/60 border-border/40"}`}>
              <option value={0}>·</option>
              {[1,2,3,4,5,6,7,8,9].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          ))}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Magic!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQMagicSquare;
