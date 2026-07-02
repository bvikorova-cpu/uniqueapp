import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Route, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_trailmaking_best_ms";
// Trail B: alternate 1-A-2-B-3-C-4-D-5-E
const SEQ = ["1", "A", "2", "B", "3", "C", "4", "D", "5", "E"];

const make = () => {
  const positions = Array.from({ length: 10 }, (_, i) => i).sort(() => Math.random() - 0.5);
  return SEQ.map((label, i) => ({ label, slot: positions[i] }));
};

const IQTrailMaking = () => {
  const [nodes, setNodes] = useState(make);
  const [step, setStep] = useState(0);
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
    tRef.current = window.setInterval(() => setNow(performance.now()), 100);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, [done]);

  const tap = (label: string) => {
    if (done) return;
    if (label !== SEQ[step]) return;
    const ns = step + 1; setStep(ns);
    if (ns === SEQ.length) {
      setDone(true);
      const ms = Math.round(performance.now() - start);
      if (best === 0 || ms < best) { setBest(ms); localStorage.setItem(KEY, String(ms)); }
    }
  };

  const reset = () => { setNodes(make()); setStep(0); setStart(performance.now()); setNow(performance.now()); setDone(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQTrail Making works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="w-5 h-5 text-primary" /> Trail Making B
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best/1000).toFixed(1)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {((now-start)/1000).toFixed(1)}s</span>
          <span>Next: <strong className="text-primary">{SEQ[step] || "✓"}</strong></span>
        </div>
        <div className="grid grid-cols-5 gap-2 max-w-[280px] mx-auto">
          {Array.from({ length: 10 }).map((_, slot) => {
            const node = nodes.find(n => n.slot === slot);
            if (!node) return <div key={slot} />;
            const idx = SEQ.indexOf(node.label);
            const passed = idx < step;
            return (
              <button key={slot} onClick={() => tap(node.label)}
                className={`aspect-square rounded-full font-bold text-lg transition-all ${passed ? "bg-emerald-500/30 text-emerald-300" : "bg-primary/20 hover:bg-primary/40"}`}>
                {node.label}
              </button>
            );
          })}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 Done in {((now-start)/1000).toFixed(1)}s!</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Restart</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQTrailMaking;
