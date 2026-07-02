import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_nqueens4_solved";
const N = 4;

const safe = (q: number[], r: number, c: number) => {
  for (let i = 0; i < r; i++) {
    if (q[i] === c || Math.abs(q[i] - c) === r - i) return false;
  }
  return true;
};

const IQNQueens4 = () => {
  const [q, setQ] = useState<number[]>(Array(N).fill(-1));
  const [done, setDone] = useState(false);
  const [solved, setSolved] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setSolved(parseInt(s, 10) || 0); }, []);

  const place = (r: number, c: number) => {
    if (done) return;
    const nq = [...q];
    nq[r] = nq[r] === c ? -1 : c;
    setQ(nq);
    if (nq.every(v => v >= 0)) {
      const ok = nq.every((c2, r2) => safe(nq.slice(0, r2), r2, c2));
      if (ok) {
        setDone(true);
        const n = solved + 1; setSolved(n); localStorage.setItem(KEY, String(n));
      }
    }
  };

  const reset = () => { setQ(Array(N).fill(-1)); setDone(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQNQueens4 works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" /> 4-Queens
          {solved > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {solved}×</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Place 4 queens with no attacks</div>
        <div className="grid grid-cols-4 gap-1 max-w-[200px] mx-auto">
          {Array.from({ length: N * N }).map((_, idx) => {
            const r = Math.floor(idx / N), c = idx % N;
            const has = q[r] === c;
            const dark = (r + c) % 2 === 1;
            return (
              <button key={idx} onClick={() => place(r, c)}
                className={`aspect-square rounded text-2xl flex items-center justify-center ${dark ? "bg-muted/40" : "bg-background/40"} ${has ? "ring-2 ring-primary" : ""}`}>
                {has ? "♛" : ""}
              </button>
            );
          })}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Valid solution!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQNQueens4;
