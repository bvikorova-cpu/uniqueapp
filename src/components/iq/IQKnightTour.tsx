import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_knight_best_moves";
const N = 5;
const MOVES = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

const IQKnightTour = () => {
  const [pos, setPos] = useState<[number, number]>([0, 0]);
  const [visited, setVisited] = useState<Set<string>>(new Set(["0-0"]));
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0); }, []);

  const move = (r: number, c: number) => {
    if (done) return;
    const dr = r - pos[0], dc = c - pos[1];
    const valid = MOVES.some(([a, b]) => a === dr && b === dc);
    if (!valid) return;
    const k = `${r}-${c}`;
    if (visited.has(k)) return;
    const nv = new Set(visited); nv.add(k);
    setVisited(nv); setPos([r, c]);
    if (nv.size === N * N) {
      setDone(true);
      if (best === 0 || nv.size < best) { setBest(nv.size); localStorage.setItem(KEY, String(nv.size)); }
    }
  };

  const reset = () => { setPos([0, 0]); setVisited(new Set(["0-0"])); setDone(false); };

  const canReach = (r: number, c: number) => {
    const dr = r - pos[0], dc = c - pos[1];
    return MOVES.some(([a, b]) => a === dr && b === dc) && !visited.has(`${r}-${c}`);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQKnight Tour works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary" /> Knight's Tour 5×5
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}/{N*N}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Visit every square · {visited.size}/{N*N}</div>
        <div className="grid grid-cols-5 gap-1 max-w-[240px] mx-auto">
          {Array.from({ length: N * N }).map((_, idx) => {
            const r = Math.floor(idx / N), c = idx % N;
            const k = `${r}-${c}`;
            const isPos = pos[0] === r && pos[1] === c;
            const isV = visited.has(k);
            const reach = canReach(r, c);
            return (
              <button key={k} onClick={() => move(r, c)}
                className={`aspect-square rounded text-lg flex items-center justify-center transition-all ${
                  isPos ? "bg-primary text-primary-foreground" :
                  isV ? "bg-primary/30" :
                  reach ? "bg-emerald-500/20 border border-emerald-500/40" :
                  "bg-background/40 border border-border/40"
                }`}>
                {isPos ? "♞" : isV ? "·" : ""}
              </button>
            );
          })}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Tour complete!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQKnightTour;
