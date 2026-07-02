import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Rewind, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_reverse_span_best";

const IQReverseSpan = () => {
  const [phase, setPhase] = useState<"idle"|"show"|"input"|"result">("idle");
  const [level, setLevel] = useState(3);
  const [seq, setSeq] = useState<number[]>([]);
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [best, setBest] = useState(0);
  const [ok, setOk] = useState<boolean|null>(null);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const start = (lvl = level) => {
    const s = Array.from({length: lvl}, () => Math.floor(Math.random()*9)+1);
    setSeq(s); setIdx(0); setAnswer(""); setOk(null); setPhase("show");
    let i = 0;
    if (tRef.current) window.clearInterval(tRef.current);
    tRef.current = window.setInterval(() => {
      i++;
      if (i >= lvl) {
        if (tRef.current) window.clearInterval(tRef.current);
        setIdx(-1); setPhase("input");
      } else setIdx(i);
    }, 800);
  };

  const submit = () => {
    const reversed = [...seq].reverse().join("");
    const correct = answer === reversed;
    setOk(correct); setPhase("result");
    if (correct) {
      const nl = level+1; setLevel(nl);
      if (nl > best) { setBest(nl); localStorage.setItem(KEY, String(nl)); }
    } else setLevel(3);
  };

  const reset = () => { if (tRef.current) window.clearInterval(tRef.current); setPhase("idle"); setLevel(3); setAnswer(""); };

  return (
    <>
      <FloatingHowItWorks title="How IQReverse Span works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rewind className="w-5 h-5 text-primary" /> Reverse Number Span
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> Lv {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground">Memorize digits, then type them <strong>backwards</strong> — Level {level}</div>
        <div className="h-32 rounded-xl border border-border/40 bg-background/40 flex items-center justify-center">
          {phase === "idle" && <Button onClick={() => start(3)}>Start</Button>}
          {phase === "show" && <div className="text-6xl font-mono font-bold text-primary">{seq[idx]}</div>}
          {phase === "input" && (
            <div className="w-full px-4">
              <Input autoFocus value={answer} onChange={e=>setAnswer(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} className="text-center text-xl font-mono" inputMode="numeric" placeholder="reverse…" />
              <Button onClick={submit} size="sm" className="w-full mt-2">Submit</Button>
            </div>
          )}
          {phase === "result" && (
            <div className="text-center">
              <div className={`text-2xl font-bold ${ok?"text-emerald-400":"text-rose-400"}`}>{ok ? "✓ Correct!" : "✗ Wrong"}</div>
              <div className="text-xs text-muted-foreground mt-1">Sequence: {seq.join(" ")} · Reverse: {[...seq].reverse().join(" ")}</div>
            </div>
          )}
        </div>
        {phase === "result" && (
          <div className="flex gap-2">
            <Button onClick={() => start()} className="flex-1" size="sm">{ok?"Next level":"Retry"}</Button>
            <Button onClick={reset} variant="outline" size="icon"><RotateCcw className="w-4 h-4" /></Button>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQReverseSpan;
