import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_hanoi_best_moves";
const DISKS = 4;
const OPTIMAL = Math.pow(2, DISKS) - 1;

const IQHanoi = () => {
  const [towers, setTowers] = useState<number[][]>([[4,3,2,1],[],[]]);
  const [selected, setSelected] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
  }, []);

  useEffect(() => {
    if (towers[2].length === DISKS) {
      setDone(true);
      if (best === 0 || moves < best) { setBest(moves); localStorage.setItem(KEY, String(moves)); }
    }
  }, [towers, moves, best]);

  const tap = (i: number) => {
    if (done) return;
    if (selected === null) {
      if (towers[i].length > 0) setSelected(i);
    } else {
      if (selected === i) { setSelected(null); return; }
      const from = towers[selected], to = towers[i];
      const top = from[from.length-1];
      if (to.length === 0 || top < to[to.length-1]) {
        const nt = towers.map(t => [...t]);
        nt[i].push(nt[selected].pop()!);
        setTowers(nt); setMoves(moves+1);
      }
      setSelected(null);
    }
  };

  const reset = () => { setTowers([[4,3,2,1],[],[]]); setSelected(null); setMoves(0); setDone(false); };

  const colors = ["","bg-rose-500","bg-amber-500","bg-emerald-500","bg-sky-500"];
  const widths = ["","w-6","w-10","w-14","w-18"];

  return (
    <>
      <FloatingHowItWorks title="How IQHanoi works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" /> Tower of Hanoi
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} moves</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Moves: <strong>{moves}</strong> · Optimal: {OPTIMAL}</span>
          <span>Move all disks to the right pole</span>
        </div>
        <div className="grid grid-cols-3 gap-2 h-40 items-end">
          {towers.map((t, i) => (
            <button key={i} onClick={()=>tap(i)} className={`h-full rounded-lg border-2 transition-colors flex flex-col-reverse items-center justify-start gap-0.5 p-2 ${selected===i?"border-primary bg-primary/10":"border-border/40 bg-background/40"}`}>
              {t.map((d, j) => (
                <div key={j} className={`h-4 rounded ${colors[d]} ${widths[d]} max-w-full`} style={{width:`${d*22}px`}} />
              ))}
            </button>
          ))}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Solved in {moves} moves! {moves===OPTIMAL&&"(optimal!)"}</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQHanoi;
