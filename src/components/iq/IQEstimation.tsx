import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sparkles, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_estimation_best";

const IQEstimation = () => {
  const [count, setCount] = useState(() => Math.floor(Math.random()*80)+20);
  const [seed, setSeed] = useState(0);
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [last, setLast] = useState<{ guess: number; actual: number; pts: number } | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
  }, []);

  const dots = useMemo(() => {
    void seed;
    return Array.from({length: count}, () => ({ x: Math.random()*100, y: Math.random()*100 }));
  }, [count, seed]);

  const submit = () => {
    const g = parseInt(guess, 10); if (!Number.isFinite(g)) return;
    const diff = Math.abs(g - count);
    const pts = Math.max(0, 20 - diff);
    const ns = score + pts; setScore(ns);
    if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
    setLast({ guess: g, actual: count, pts });
    setCount(Math.floor(Math.random()*100)+20); setSeed(s=>s+1); setGuess("");
  };

  const reset = () => { setScore(0); setLast(null); setCount(Math.floor(Math.random()*80)+20); setSeed(s=>s+1); setGuess(""); };

  return (
    <>
      <FloatingHowItWorks title="How IQEstimation works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" /> Dot Estimation
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Score: <strong>{score}</strong></span>
          <span>Estimate dots (no counting!)</span>
        </div>
        <div className="relative h-48 rounded-xl border border-border/40 bg-background/60 overflow-hidden">
          {dots.map((d, i) => (
            <div key={i} className="absolute w-1.5 h-1.5 rounded-full bg-primary" style={{left:`${d.x}%`,top:`${d.y}%`}} />
          ))}
        </div>
        <Input autoFocus value={guess} onChange={e=>setGuess(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} className="text-center text-lg font-mono" inputMode="numeric" placeholder="How many?" />
        {last && (
          <div className="text-xs text-center text-muted-foreground">
            Last: guessed <strong>{last.guess}</strong>, actual <strong className="text-primary">{last.actual}</strong>, +{last.pts} pts
          </div>
        )}
        <div className="flex gap-2">
          <Button onClick={submit} className="flex-1">Submit</Button>
          <Button onClick={reset} variant="outline" size="icon"><RotateCcw className="w-4 h-4" /></Button>
        </div>
      </CardContent>
    </Card>
    </>
    );
};

export default IQEstimation;
