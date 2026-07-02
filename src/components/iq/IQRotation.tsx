import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCw, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_rotation_best";

// L-shape encoded as cells in a 3x3 grid; rotations precomputed
type Shape = boolean[][];
const baseShapes: Shape[] = [
  [[true,false,false],[true,false,false],[true,true,false]],
  [[true,true,false],[false,true,false],[false,true,false]],
  [[true,true,true],[false,false,true],[false,false,false]],
  [[true,true,false],[true,false,false],[true,false,false]],
];

const rotate = (s: Shape): Shape => {
  const n = s.length;
  return Array.from({length:n}, (_, i) => Array.from({length:n}, (_, j) => s[n-1-j][i]));
};

const eq = (a: Shape, b: Shape) => a.every((row,i)=>row.every((v,j)=>v===b[i][j]));

const gen = () => {
  const base = baseShapes[Math.floor(Math.random()*baseShapes.length)];
  const rots = Math.floor(Math.random()*4);
  let target = base; for (let i=0;i<rots;i++) target = rotate(target);
  // 3 options: target + 2 different
  const options: Shape[] = [target];
  while (options.length < 4) {
    const cand = baseShapes[Math.floor(Math.random()*baseShapes.length)];
    let r = cand; const rr = Math.floor(Math.random()*4);
    for (let i=0;i<rr;i++) r = rotate(r);
    if (!options.some(o => eq(o, r))) options.push(r);
  }
  for (let i = options.length-1;i>0;i--) { const j = Math.floor(Math.random()*(i+1)); [options[i],options[j]] = [options[j],options[i]]; }
  return { base, target, options, correctIdx: options.findIndex(o => eq(o, target)) };
};

const ShapeView = ({ s, size=10 }: { s: Shape; size?: number }) => (
  <div className="inline-grid grid-cols-3 gap-0.5">
    {s.flat().map((v,i) => <div key={i} className={`w-${size} h-${size} ${v?"bg-primary":"bg-background/30 border border-border/20"}`} style={{width:size*4,height:size*4}} />)}
  </div>
);

const IQRotation = () => {
  const [puzzle, setPuzzle] = useState(gen());
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<"ok"|"err"|null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
  }, []);

  const tap = (i: number) => {
    if (i === puzzle.correctIdx) {
      const ns = score+1; setScore(ns); setFlash("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
    } else { setScore(0); setFlash("err"); }
    setPuzzle(gen()); setTimeout(()=>setFlash(null), 200);
  };

  const reset = () => { setScore(0); setPuzzle(gen()); };

  return (
    <>
      <FloatingHowItWorks title="How IQRotation works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RotateCw className="w-5 h-5 text-primary" /> Mental Rotation
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Streak: <strong>{score}</strong></span>
          <span>Find a rotated copy of the target</span>
        </div>
        <div className={`rounded-xl border border-border/40 p-4 text-center transition-colors ${flash==="ok"?"bg-emerald-500/10":flash==="err"?"bg-rose-500/10":"bg-background/40"}`}>
          <div className="text-xs text-muted-foreground mb-2">Target</div>
          <div className="flex justify-center"><ShapeView s={puzzle.target} size={10} /></div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {puzzle.options.map((o, i) => (
            <button key={i} onClick={()=>tap(i)} className="rounded-lg border border-border/40 bg-background/60 p-3 hover:border-primary/60 flex items-center justify-center transition-colors">
              <ShapeView s={o} size={8} />
            </button>
          ))}
        </div>
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQRotation;
