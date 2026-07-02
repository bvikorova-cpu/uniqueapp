import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Square, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_odd_one_best";

type Item = { color: string; shape: "square"|"circle"|"triangle"; size: number };
const COLORS = ["bg-rose-500","bg-sky-500","bg-emerald-500","bg-amber-500","bg-purple-500"];

const shapes: Array<Item["shape"]> = ["square","circle","triangle"];

const gen = (lvl: number) => {
  const n = 4;
  const baseColor = COLORS[Math.floor(Math.random()*COLORS.length)];
  const baseShape = shapes[Math.floor(Math.random()*shapes.length)];
  const baseSize = 8;
  const items: Item[] = Array.from({length:n}, () => ({color: baseColor, shape: baseShape, size: baseSize}));
  const oddIdx = Math.floor(Math.random()*n);
  const diffType = lvl < 3 ? Math.floor(Math.random()*2) : Math.floor(Math.random()*3);
  if (diffType === 0) {
    let c = COLORS[Math.floor(Math.random()*COLORS.length)]; while (c===baseColor) c=COLORS[Math.floor(Math.random()*COLORS.length)];
    items[oddIdx].color = c;
  } else if (diffType === 1) {
    let s = shapes[Math.floor(Math.random()*shapes.length)]; while (s===baseShape) s=shapes[Math.floor(Math.random()*shapes.length)];
    items[oddIdx].shape = s;
  } else {
    items[oddIdx].size = baseSize - 2;
  }
  return { items, oddIdx };
};

const renderShape = (it: Item) => {
  const sz = `w-${it.size} h-${it.size}`;
  if (it.shape === "circle") return <div className={`${sz} ${it.color} rounded-full`} />;
  if (it.shape === "triangle") return <div className="w-0 h-0" style={{borderLeft:`${it.size*2}px solid transparent`,borderRight:`${it.size*2}px solid transparent`,borderBottom:`${it.size*4}px solid currentColor`}}><span className={it.color.replace("bg-","text-")} /></div>;
  return <div className={`${sz} ${it.color} rounded-sm`} />;
};

const IQOddOneOut = () => {
  const [puzzle, setPuzzle] = useState(() => gen(1));
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<"ok"|"err"|null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
  }, []);

  const tap = (i: number) => {
    if (i === puzzle.oddIdx) {
      const ns = score+1; setScore(ns); setFlash("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setPuzzle(gen(ns));
    } else { setScore(0); setFlash("err"); setPuzzle(gen(0)); }
    setTimeout(()=>setFlash(null), 200);
  };

  const reset = () => { setScore(0); setPuzzle(gen(1)); };

  return (
    <>
      <FloatingHowItWorks title="How IQOdd One Out works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Square className="w-5 h-5 text-primary" /> Odd One Out
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Streak: <strong>{score}</strong></span>
          <span>Tap the different one</span>
        </div>
        <div className={`grid grid-cols-2 gap-2 p-3 rounded-xl border border-border/40 transition-colors ${flash==="ok"?"bg-emerald-500/10":flash==="err"?"bg-rose-500/10":"bg-background/40"}`}>
          {puzzle.items.map((it, i) => (
            <button key={i} onClick={()=>tap(i)} className="aspect-square rounded-lg bg-background/60 border border-border/40 flex items-center justify-center hover:border-primary/60 transition-colors">
              {renderShape(it)}
            </button>
          ))}
        </div>
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQOddOneOut;
