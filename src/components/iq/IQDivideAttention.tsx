import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Split, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_divattn_best";

// Two streams: left shows letters (press when vowel), right shows digits (press when even)
const VOWELS = "AEIOU";

const IQDivideAttention = () => {
  const [left, setLeft] = useState("A");
  const [right, setRight] = useState("0");
  const [running, setRunning] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30000);
  const [best, setBest] = useState(0);
  const sRef = useRef<number | null>(null);
  const tRef = useRef<number | null>(null);
  const respondedRef = useRef({ l: false, r: false });

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  useEffect(() => {
    if (!running) return;
    sRef.current = window.setInterval(() => {
      // Penalize missed targets
      if (VOWELS.includes(left) && !respondedRef.current.l) setScore(s => Math.max(0, s - 1));
      if ((parseInt(right, 10) % 2 === 0) && !respondedRef.current.r) setScore(s => Math.max(0, s - 1));
      const letters = "BCDFGHAEIOULMN";
      setLeft(letters[Math.floor(Math.random() * letters.length)]);
      setRight(String(Math.floor(Math.random() * 10)));
      respondedRef.current = { l: false, r: false };
    }, 1500);
    tRef.current = window.setInterval(() => setTimeLeft(t => Math.max(0, t - 100)), 100);
    return () => { if (sRef.current) window.clearInterval(sRef.current); if (tRef.current) window.clearInterval(tRef.current); };
  }, [running, left, right]);

  useEffect(() => {
    if (running && timeLeft === 0) {
      setRunning(false);
      if (score > best) { setBest(score); localStorage.setItem(KEY, String(score)); }
    }
  }, [timeLeft, running, score, best]);

  const start = () => { setScore(0); setTimeLeft(30000); setRunning(true); };

  const tapL = () => {
    if (!running || respondedRef.current.l) return;
    respondedRef.current.l = true;
    setScore(s => VOWELS.includes(left) ? s + 1 : Math.max(0, s - 1));
  };
  const tapR = () => {
    if (!running || respondedRef.current.r) return;
    respondedRef.current.r = true;
    setScore(s => parseInt(right, 10) % 2 === 0 ? s + 1 : Math.max(0, s - 1));
  };

  return (
    <>
      <FloatingHowItWorks title="How IQDivide Attention works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Split className="w-5 h-5 text-primary" /> Divide Attention
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Score: <strong>{score}</strong></span><span>{(timeLeft/1000).toFixed(1)}s</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={tapL} disabled={!running} className="h-24 rounded-lg bg-rose-500/20 text-5xl font-bold text-rose-300 disabled:opacity-50">{running ? left : "?"}</button>
          <button onClick={tapR} disabled={!running} className="h-24 rounded-lg bg-sky-500/20 text-5xl font-bold text-sky-300 disabled:opacity-50">{running ? right : "?"}</button>
        </div>
        <div className="text-[10px] text-muted-foreground text-center">Tap LEFT for vowels · Tap RIGHT for even digits</div>
        <Button onClick={start} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> {running ? "Restart" : "Start 30s"}</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQDivideAttention;
