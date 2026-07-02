import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Music, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_audiomem_best_level";
const TONES = [261.63, 329.63, 392.0, 523.25]; // C E G C
const COLORS = ["bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500"];

const IQAudioMemory = () => {
  const [seq, setSeq] = useState<number[]>([]);
  const [user, setUser] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "play" | "input" | "fail">("idle");
  const [active, setActive] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [best, setBest] = useState(0);
  const ctxRef = useRef<AudioContext | null>(null);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const beep = (i: number) => {
    if (!ctxRef.current) ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    const ctx = ctxRef.current;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.frequency.value = TONES[i]; osc.type = "sine";
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc.connect(gain).connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime + 0.4);
  };

  const playSeq = async (s: number[]) => {
    setPhase("play");
    for (const i of s) {
      setActive(i); beep(i);
      await new Promise(r => setTimeout(r, 500));
      setActive(null);
      await new Promise(r => setTimeout(r, 200));
    }
    setPhase("input"); setUser([]);
  };

  const start = () => {
    const ns = [Math.floor(Math.random() * 4)];
    setSeq(ns); setLevel(1); playSeq(ns);
  };

  const tap = (i: number) => {
    if (phase !== "input") return;
    beep(i);
    const nu = [...user, i]; setUser(nu);
    if (seq[nu.length - 1] !== i) {
      setPhase("fail");
      if (level - 1 > best) { setBest(level - 1); localStorage.setItem(KEY, String(level - 1)); }
      return;
    }
    if (nu.length === seq.length) {
      const ns = [...seq, Math.floor(Math.random() * 4)];
      setTimeout(() => { setSeq(ns); setLevel(level + 1); playSeq(ns); }, 400);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQAudio Memory works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" /> Audio Memory
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> L{best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Listen, then repeat the tones · Level {level}</div>
        <div className="grid grid-cols-2 gap-2 max-w-[200px] mx-auto">
          {COLORS.map((c, i) => (
            <button key={i} onClick={() => tap(i)} disabled={phase !== "input"}
              className={`aspect-square rounded-lg ${c} transition-opacity ${active === i ? "opacity-100 ring-2 ring-white" : "opacity-60"} hover:opacity-100`} />
          ))}
        </div>
        {phase === "fail" && <div className="text-center text-rose-400 font-bold">❌ Reached level {level}</div>}
        <Button onClick={start} variant="outline" size="sm" className="w-full">
          <RotateCcw className="w-3 h-3 mr-1" /> {phase === "idle" ? "Start" : "Restart"}
        </Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQAudioMemory;
