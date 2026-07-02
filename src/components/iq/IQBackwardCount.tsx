import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Minus, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_backcount_best_streak";

const IQBackwardCount = () => {
  const [start, setStart] = useState(0);
  const [step, setStep] = useState(7);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [streak, setStreak] = useState(0);
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
      if (streak > best) { setBest(streak); localStorage.setItem(KEY, String(streak)); }
    }
  }, [timeLeft, running, streak, best]);

  const begin = () => {
    const s = 100 + Math.floor(Math.random() * 200);
    const st = [3, 7, 9][Math.floor(Math.random() * 3)];
    setStart(s); setStep(st); setCurrent(s);
    setInput(""); setStreak(0); setTimeLeft(60000); setRunning(true);
  };

  const submit = () => {
    if (!running) return;
    const v = parseInt(input, 10);
    if (v === current - step) {
      setCurrent(v); setStreak(streak + 1); setInput("");
    } else {
      if (streak > best) { setBest(streak); localStorage.setItem(KEY, String(streak)); }
      setStreak(0); setInput("");
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQBackward Count works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Minus className="w-5 h-5 text-primary" /> Backward Count
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Streak: <strong>{streak}</strong></span>
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {(timeLeft/1000).toFixed(1)}s</span>
        </div>
        <div className="bg-background/60 border border-border/40 rounded-lg p-3 text-center">
          <div className="text-xs text-muted-foreground">Subtract <strong className="text-primary">{step}</strong> from</div>
          <div className="text-3xl font-bold text-primary">{running ? current : "?"}</div>
        </div>
        <div className="flex gap-2">
          <Input type="number" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()} disabled={!running} placeholder="Answer" />
          <Button onClick={submit} size="sm" disabled={!running}>OK</Button>
        </div>
        <Button onClick={begin} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> {running ? "Restart" : "Start 60s"}</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQBackwardCount;
