import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Layers, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_dualtask_best";

const IQDualTask = () => {
  const [num, setNum] = useState(0);
  const [color, setColor] = useState<"red" | "blue">("red");
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30000);
  const [best, setBest] = useState(0);
  const tRef = useRef<number | null>(null);
  const sRef = useRef<number | null>(null);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  useEffect(() => {
    if (!running) return;
    sRef.current = window.setInterval(() => {
      setNum(Math.floor(Math.random() * 10));
      setColor(Math.random() < 0.5 ? "red" : "blue");
    }, 1500);
    tRef.current = window.setInterval(() => setTimeLeft(t => Math.max(0, t - 100)), 100);
    return () => { if (sRef.current) window.clearInterval(sRef.current); if (tRef.current) window.clearInterval(tRef.current); };
  }, [running]);

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false);
      if (score > best) { setBest(score); localStorage.setItem(KEY, String(score)); }
    }
  }, [timeLeft, running, score, best]);

  const start = () => { setScore(0); setTimeLeft(30000); setRunning(true); setNum(0); };

  const respond = (action: "even" | "odd" | "red" | "blue") => {
    if (!running) return;
    const isEven = num % 2 === 0;
    if ((action === "even" && isEven) || (action === "odd" && !isEven) || action === color) setScore(score + 1);
    else setScore(Math.max(0, score - 1));
    setNum(Math.floor(Math.random() * 10));
    setColor(Math.random() < 0.5 ? "red" : "blue");
  };

  return (
    <>
      <FloatingHowItWorks title="How IQDual Task works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" /> Dual Task
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Score: <strong>{score}</strong></span><span>{(timeLeft/1000).toFixed(1)}s</span>
        </div>
        <div className={`h-24 rounded-lg flex items-center justify-center text-6xl font-bold ${color === "red" ? "bg-rose-500/20 text-rose-400" : "bg-sky-500/20 text-sky-400"}`}>
          {running ? num : "?"}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" onClick={() => respond("even")} disabled={!running}>Even</Button>
          <Button size="sm" variant="outline" onClick={() => respond("odd")} disabled={!running}>Odd</Button>
          <Button size="sm" variant="outline" onClick={() => respond("red")} disabled={!running} className="text-rose-400">Red</Button>
          <Button size="sm" variant="outline" onClick={() => respond("blue")} disabled={!running} className="text-sky-400">Blue</Button>
        </div>
        <div className="text-[10px] text-muted-foreground text-center">Pick parity OR color matching what you see</div>
        <Button onClick={start} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> {running ? "Restart" : "Start 30s"}</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQDualTask;
