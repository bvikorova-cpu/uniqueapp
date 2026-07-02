import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_digitsymbol_best";
const SYMBOLS = ["★", "♥", "♦", "♣", "●", "■", "▲", "◆", "✦"];
// Map: digit 1-9 → symbol index. Random per session.

const IQDigitSymbol = () => {
  const [map, setMap] = useState<string[]>([]);
  const [target, setTarget] = useState(1);
  const [score, setScore] = useState(0);
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60000);
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

  const start = () => {
    setMap([...SYMBOLS].sort(() => Math.random() - 0.5));
    setTarget(1 + Math.floor(Math.random() * 9));
    setScore(0); setTimeLeft(60000); setRunning(true);
  };

  const tap = (i: number) => {
    if (!running) return;
    if (SYMBOLS[i] === map[target - 1]) {
      setScore(score + 1);
      setTarget(1 + Math.floor(Math.random() * 9));
    } else setScore(Math.max(0, score - 1));
  };

  return (
    <>
      <FloatingHowItWorks title="How IQDigit Symbol works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-primary" /> Digit Symbol
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Score: <strong>{score}</strong></span><span>{(timeLeft/1000).toFixed(1)}s</span>
        </div>
        {map.length > 0 && (
          <div className="grid grid-cols-9 gap-px text-xs bg-border/30 p-px rounded">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-background/60 text-center py-1">
                <div className="font-bold">{i + 1}</div>
                <div className="text-primary">{map[i]}</div>
              </div>
            ))}
          </div>
        )}
        {running && <div className="text-center text-4xl font-bold text-primary">{target}</div>}
        <div className="grid grid-cols-9 gap-1">
          {SYMBOLS.map((s, i) => (
            <button key={i} onClick={() => tap(i)} disabled={!running}
              className="aspect-square text-lg bg-background/60 border border-border/40 rounded hover:bg-primary/20 disabled:opacity-50">{s}</button>
          ))}
        </div>
        <Button onClick={start} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> {running ? "Restart" : "Start 60s"}</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQDigitSymbol;
