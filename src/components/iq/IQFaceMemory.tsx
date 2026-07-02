import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Smile, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_facemem_best_streak";
const FACES = ["😀", "😎", "🤓", "🥳", "🤠", "🧐", "🤖", "👻", "👽", "🐱", "🐶", "🦊"];

const IQFaceMemory = () => {
  const [study, setStudy] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [phase, setPhase] = useState<"idle" | "study" | "quiz" | "result">("idle");
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const start = async () => {
    const shuf = [...FACES].sort(() => Math.random() - 0.5);
    const set = shuf.slice(0, 4);
    setStudy(set); setPhase("study");
    await new Promise(r => setTimeout(r, 3000));
    const t = set[Math.floor(Math.random() * set.length)];
    const distractors = shuf.slice(4, 7);
    setTarget(t); setOptions([t, ...distractors].sort(() => Math.random() - 0.5));
    setPhase("quiz");
  };

  const pick = (f: string) => {
    if (phase !== "quiz") return;
    if (f === target) {
      const ns = streak + 1; setStreak(ns);
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      start();
    } else {
      setPhase("result");
    }
  };

  const reset = () => { setStreak(0); setPhase("idle"); };

  return (
    <>
      <FloatingHowItWorks title="How IQFace Memory works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-primary" /> Face Memory
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} streak</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Streak: <strong>{streak}</strong></div>
        {phase === "study" && (
          <>
            <div className="text-xs text-amber-400 text-center">Memorize these faces</div>
            <div className="flex justify-center gap-2 text-4xl">{study.map((f, i) => <span key={i}>{f}</span>)}</div>
          </>
        )}
        {phase === "quiz" && (
          <>
            <div className="text-xs text-emerald-400 text-center">Which face was shown?</div>
            <div className="grid grid-cols-2 gap-2">
              {options.map((f, i) => <button key={i} onClick={() => pick(f)} className="text-4xl bg-background/60 border border-border/40 rounded-lg p-3 hover:bg-primary/20">{f}</button>)}
            </div>
          </>
        )}
        {phase === "result" && <div className="text-center text-rose-400 font-bold">❌ Final streak: {streak}</div>}
        {phase !== "study" && phase !== "quiz" && (
          <Button onClick={phase === "result" ? reset : start} variant="outline" size="sm" className="w-full">
            <RotateCcw className="w-3 h-3 mr-1" /> {phase === "result" ? "Try again" : "Start"}
          </Button>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQFaceMemory;
