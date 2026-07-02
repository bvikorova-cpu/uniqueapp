import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hand, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_gonogo_best_score";

const IQGoNoGo = () => {
  const [stim, setStim] = useState<"go" | "nogo" | null>(null);
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45000);
  const [best, setBest] = useState(0);
  const [feedback, setFeedback] = useState<"" | "ok" | "bad">("");
  const sRef = useRef<number | null>(null);
  const tRef = useRef<number | null>(null);
  const responded = useRef(false);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  useEffect(() => {
    if (!running) return;
    sRef.current = window.setInterval(() => {
      if (stim === "go" && !responded.current) setScore(s => Math.max(0, s - 1));
      const next = Math.random() < 0.7 ? "go" : "nogo";
      setStim(next); responded.current = false;
    }, 1100);
    tRef.current = window.setInterval(() => setTimeLeft(t => Math.max(0, t - 100)), 100);
    return () => { if (sRef.current) window.clearInterval(sRef.current); if (tRef.current) window.clearInterval(tRef.current); };
  }, [running, stim]);

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false);
      if (score > best) { setBest(score); localStorage.setItem(KEY, String(score)); }
    }
  }, [timeLeft, running, score, best]);

  const start = () => { setScore(0); setTimeLeft(45000); setRunning(true); setStim(null); };

  const tap = () => {
    if (!running || responded.current) return;
    responded.current = true;
    if (stim === "go") {
      setScore(s => s + 1); setFeedback("ok");
    } else if (stim === "nogo") {
      setScore(s => Math.max(0, s - 2)); setFeedback("bad");
    }
    setTimeout(() => setFeedback(""), 200);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQGo No Go works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hand className="w-5 h-5 text-primary" /> Go / No-Go
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Score: <strong>{score}</strong></span>
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {(timeLeft/1000).toFixed(1)}s</span>
        </div>
        <button onClick={tap} disabled={!running}
          className={`w-full h-32 rounded-lg text-2xl font-bold transition-colors ${
            feedback === "ok" ? "bg-emerald-500/40" :
            feedback === "bad" ? "bg-rose-500/40" :
            stim === "go" ? "bg-emerald-500/30 text-emerald-300" :
            stim === "nogo" ? "bg-rose-500/30 text-rose-300" :
            "bg-background/60 border border-border/40"
          }`}>
          {running ? (stim === "go" ? "GO ✋" : stim === "nogo" ? "NO-GO ✋" : "...") : "Press start"}
        </button>
        <div className="text-[10px] text-muted-foreground text-center">Tap GREEN, ignore RED</div>
        <Button onClick={start} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> {running ? "Restart" : "Start 45s"}</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQGoNoGo;
