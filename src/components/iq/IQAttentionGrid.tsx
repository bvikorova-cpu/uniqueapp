import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crosshair, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_attngrid_best_score";
const N = 8;
const DURATION = 30000;

const make = () => {
  const targetIdx = Math.floor(Math.random() * N * N);
  return targetIdx;
};

const IQAttentionGrid = () => {
  const [target, setTarget] = useState(make);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [best, setBest] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  useEffect(() => {
    if (!running) return;
    tRef.current = window.setInterval(() => setTimeLeft(t => Math.max(0, t - 100)), 100);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, [running]);

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false);
      if (score > best) { setBest(score); localStorage.setItem(KEY, String(score)); }
    }
  }, [timeLeft, running, score, best]);

  const start = () => { setScore(0); setTimeLeft(DURATION); setRunning(true); setTarget(make()); };
  const tap = (i: number) => { if (!running) return; if (i === target) { setScore(score + 1); setTarget(make()); } };

  return (
    <>
      <FloatingHowItWorks title="How IQAttention Grid works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crosshair className="w-5 h-5 text-primary" /> Attention Grid
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Score: <strong>{score}</strong></span>
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {(timeLeft/1000).toFixed(1)}s</span>
        </div>
        <div className="text-xs text-center text-amber-400">Tap the ⭐ as fast as possible</div>
        <div className="grid gap-1 mx-auto" style={{ gridTemplateColumns: `repeat(${N}, 1fr)`, maxWidth: 280 }}>
          {Array.from({ length: N * N }).map((_, i) => (
            <button key={i} onClick={() => tap(i)} disabled={!running}
              className="aspect-square bg-background/40 border border-border/30 rounded text-xs flex items-center justify-center hover:bg-primary/20">
              {i === target && running ? "⭐" : "·"}
            </button>
          ))}
        </div>
        <Button onClick={start} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> {running ? "Restart" : "Start 30s"}</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQAttentionGrid;
