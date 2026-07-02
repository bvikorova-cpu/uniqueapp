import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Palette, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_colorrecall_best";
const COLORS = ["bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-pink-500"];

const IQColorRecall = () => {
  const [seq, setSeq] = useState<number[]>([]);
  const [user, setUser] = useState<number[]>([]);
  const [phase, setPhase] = useState<"idle" | "show" | "input" | "fail">("idle");
  const [shown, setShown] = useState<number | null>(null);
  const [level, setLevel] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const showSeq = async (s: number[]) => {
    setPhase("show");
    for (const i of s) { setShown(i); await new Promise(r => setTimeout(r, 600)); setShown(null); await new Promise(r => setTimeout(r, 250)); }
    setPhase("input"); setUser([]);
  };

  const start = () => { const ns = [Math.floor(Math.random() * COLORS.length)]; setSeq(ns); setLevel(1); showSeq(ns); };

  const tap = (i: number) => {
    if (phase !== "input") return;
    const nu = [...user, i]; setUser(nu);
    if (seq[nu.length - 1] !== i) {
      setPhase("fail");
      if (level - 1 > best) { setBest(level - 1); localStorage.setItem(KEY, String(level - 1)); }
      return;
    }
    if (nu.length === seq.length) {
      const ns = [...seq, Math.floor(Math.random() * COLORS.length)];
      setTimeout(() => { setSeq(ns); setLevel(level + 1); showSeq(ns); }, 400);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQColor Recall works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" /> Color Recall
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> L{best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Memorize the color sequence · Level {level}</div>
        <div className="h-16 rounded-lg flex items-center justify-center bg-background/40 border border-border/40">
          {shown !== null ? <div className={`w-12 h-12 rounded-full ${COLORS[shown]}`} /> : <span className="text-xs text-muted-foreground">{phase === "input" ? "Now repeat" : "—"}</span>}
        </div>
        <div className="grid grid-cols-3 gap-1">
          {COLORS.map((c, i) => (
            <button key={i} onClick={() => tap(i)} disabled={phase !== "input"}
              className={`aspect-square rounded ${c} hover:scale-105 transition-transform disabled:opacity-50`} />
          ))}
        </div>
        {phase === "fail" && <div className="text-center text-rose-400 font-bold">❌ Reached level {level}</div>}
        <Button onClick={start} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> {phase === "idle" ? "Start" : "Restart"}</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQColorRecall;
