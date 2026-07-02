import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_visualsearch_best_ms";
const TARGET = "🐱";
const DISTRACTORS = ["🐶", "🐭", "🐹", "🦊", "🐻", "🐼", "🐨"];
const N = 80;

const make = () => {
  const arr = Array.from({ length: N }, () => DISTRACTORS[Math.floor(Math.random() * DISTRACTORS.length)]);
  arr[Math.floor(Math.random() * N)] = TARGET;
  return arr;
};

const IQVisualSearch = () => {
  const [grid, setGrid] = useState<string[]>(make);
  const [start, setStart] = useState(performance.now());
  const [now, setNow] = useState(performance.now());
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  useEffect(() => {
    if (done) { if (tRef.current) window.clearInterval(tRef.current); return; }
    tRef.current = window.setInterval(() => setNow(performance.now()), 50);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, [done]);

  const tap = (i: number) => {
    if (done) return;
    if (grid[i] === TARGET) {
      setDone(true);
      const ms = Math.round(performance.now() - start);
      if (best === 0 || ms < best) { setBest(ms); localStorage.setItem(KEY, String(ms)); }
    }
  };

  const reset = () => { setGrid(make()); setStart(performance.now()); setNow(performance.now()); setDone(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQVisual Search works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" /> Visual Search
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best/1000).toFixed(2)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {((now-start)/1000).toFixed(2)}s</span>
          <span>Find the {TARGET}</span>
        </div>
        <div className="grid grid-cols-10 gap-px max-w-[280px] mx-auto bg-border/30 p-px rounded">
          {grid.map((e, i) => (
            <button key={i} onClick={() => tap(i)} className="aspect-square text-base bg-background/60 hover:bg-primary/20">{e}</button>
          ))}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Found in {((now-start)/1000).toFixed(2)}s!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> New search</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQVisualSearch;
