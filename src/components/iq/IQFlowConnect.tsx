import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Waypoints, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_flowconnect_best_moves";
const N = 5;
// Endpoints: pairs of cells that need to be connected by orthogonal paths, no overlap
type Pair = { color: string; a: [number, number]; b: [number, number] };
const PAIRS: Pair[] = [
  { color: "bg-rose-500", a: [0, 0], b: [4, 4] },
  { color: "bg-sky-500", a: [0, 4], b: [4, 0] },
  { color: "bg-emerald-500", a: [2, 1], b: [2, 3] },
];

const eq = (a: [number, number], b: [number, number]) => a[0] === b[0] && a[1] === b[1];
const adj = (a: [number, number], b: [number, number]) => Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;

const IQFlowConnect = () => {
  const [paths, setPaths] = useState<Record<number, [number, number][]>>({});
  const [active, setActive] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0); }, []);

  const cellOwner = (r: number, c: number, exceptIdx?: number): number | null => {
    for (const i in paths) {
      if (Number(i) === exceptIdx) continue;
      if (paths[i].some(p => eq(p, [r, c]))) return Number(i);
    }
    for (let i = 0; i < PAIRS.length; i++) if (eq(PAIRS[i].a, [r, c]) || eq(PAIRS[i].b, [r, c])) return i;
    return null;
  };

  const click = (r: number, c: number) => {
    if (done) return;
    const owner = cellOwner(r, c);
    if (active === null) {
      if (owner !== null) { setActive(owner); setPaths({ ...paths, [owner]: [[r, c]] }); }
      return;
    }
    const path = paths[active] || [];
    const last = path[path.length - 1];
    if (!last || !adj(last, [r, c])) return;
    if (owner !== null && owner !== active) return;
    const np = [...path, [r, c] as [number, number]];
    setPaths({ ...paths, [active]: np });
    setMoves(moves + 1);
    if (eq([r, c], PAIRS[active].b) || eq([r, c], PAIRS[active].a)) setActive(null);
    // Check completion
    setTimeout(() => {
      const allDone = PAIRS.every((p, i) => {
        const pp = (i === active ? np : paths[i]) || [];
        return pp.some(x => eq(x, p.a)) && pp.some(x => eq(x, p.b));
      });
      const totalCells = Object.values({ ...paths, [active]: np }).reduce((s, p) => s + p.length, 0);
      if (allDone && totalCells >= N * N - 4) {
        setDone(true);
        const m = moves + 1;
        if (best === 0 || m < best) { setBest(m); localStorage.setItem(KEY, String(m)); }
      }
    }, 0);
  };

  const reset = () => { setPaths({}); setActive(null); setMoves(0); setDone(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQFlow Connect works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waypoints className="w-5 h-5 text-primary" /> Flow Connect
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} mv</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Connect matching dots · Moves: <strong>{moves}</strong></div>
        <div className="grid grid-cols-5 gap-1 max-w-[240px] mx-auto">
          {Array.from({ length: N * N }).map((_, idx) => {
            const r = Math.floor(idx / N), c = idx % N;
            let bg = "bg-background/40";
            let isEndpoint = false;
            for (let i = 0; i < PAIRS.length; i++) {
              if (eq(PAIRS[i].a, [r, c]) || eq(PAIRS[i].b, [r, c])) { bg = PAIRS[i].color; isEndpoint = true; break; }
            }
            if (!isEndpoint) {
              for (const i in paths) if (paths[i].some(p => eq(p, [r, c]))) { bg = PAIRS[Number(i)].color + "/60"; break; }
            }
            return <button key={idx} onClick={() => click(r, c)}
              className={`aspect-square rounded ${bg} ${isEndpoint ? "ring-1 ring-white/50" : "border border-border/40"}`} />;
          })}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 All connected in {moves} moves!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQFlowConnect;
