import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music2, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_simon_best";
const COLORS = [
  { id: 0, on: "bg-emerald-400", off: "bg-emerald-700/50" },
  { id: 1, on: "bg-rose-400", off: "bg-rose-700/50" },
  { id: 2, on: "bg-sky-400", off: "bg-sky-700/50" },
  { id: 3, on: "bg-amber-400", off: "bg-amber-700/50" },
];

const IQSimon = () => {
  const [phase, setPhase] = useState<"idle"|"show"|"input"|"fail">("idle");
  const [seq, setSeq] = useState<number[]>([]);
  const [step, setStep] = useState(-1);
  const [active, setActive] = useState<number | null>(null);
  const [best, setBest] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const playback = (s: number[]) => {
    setPhase("show"); setActive(null); let i = 0;
    if (tRef.current) window.clearInterval(tRef.current);
    tRef.current = window.setInterval(() => {
      if (i >= s.length) {
        if (tRef.current) window.clearInterval(tRef.current);
        setActive(null); setStep(0); setPhase("input"); return;
      }
      setActive(s[i]);
      window.setTimeout(() => setActive(null), 350);
      i++;
    }, 600);
  };

  const start = () => {
    const s = [Math.floor(Math.random()*4)];
    setSeq(s); playback(s);
  };

  const tap = (id: number) => {
    if (phase !== "input") return;
    if (id !== seq[step]) {
      setPhase("fail");
      if (seq.length - 1 > best) { setBest(seq.length-1); localStorage.setItem(KEY, String(seq.length-1)); }
      return;
    }
    if (step + 1 === seq.length) {
      const next = [...seq, Math.floor(Math.random()*4)];
      setSeq(next); window.setTimeout(() => playback(next), 500);
    } else setStep(step+1);
  };

  const reset = () => { if (tRef.current) window.clearInterval(tRef.current); setPhase("idle"); setSeq([]); setStep(-1); setActive(null); };

  return (
    <>
      <FloatingHowItWorks title="How IQSimon works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music2 className="w-5 h-5 text-primary" /> Simon Says
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Sequence: <strong>{seq.length}</strong></span>
          <span>{phase==="show"?"Watch…":phase==="input"?"Repeat":phase==="fail"?"Game over":"Ready"}</span>
        </div>
        <div className="grid grid-cols-2 gap-2 aspect-square">
          {COLORS.map(c => (
            <button key={c.id} onClick={()=>tap(c.id)} disabled={phase!=="input"}
              className={`rounded-2xl border-2 border-border/40 transition-all ${active===c.id?c.on+" scale-95 shadow-lg":c.off}`} />
          ))}
        </div>
        {phase === "idle" && <Button onClick={start} className="w-full">Start</Button>}
        {phase === "fail" && (
          <div className="flex gap-2">
            <Button onClick={start} className="flex-1">Try again</Button>
            <Button onClick={reset} variant="outline" size="icon"><RotateCcw className="w-4 h-4" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQSimon;
