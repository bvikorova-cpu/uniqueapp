import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRightLeft, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_analogies_best_streak";

const POOL: { a: string; b: string; c: string; ans: string; opts: string[] }[] = [
  { a: "bird", b: "sky", c: "fish", ans: "water", opts: ["water", "tree", "rock", "fire"] },
  { a: "hot", b: "cold", c: "tall", ans: "short", opts: ["short", "wide", "deep", "soft"] },
  { a: "doctor", b: "hospital", c: "teacher", ans: "school", opts: ["school", "office", "store", "garden"] },
  { a: "puppy", b: "dog", c: "kitten", ans: "cat", opts: ["cat", "lion", "mouse", "rabbit"] },
  { a: "pen", b: "write", c: "knife", ans: "cut", opts: ["cut", "eat", "throw", "draw"] },
  { a: "wheel", b: "car", c: "wing", ans: "bird", opts: ["bird", "fish", "ant", "snake"] },
  { a: "happy", b: "smile", c: "sad", ans: "cry", opts: ["cry", "laugh", "yell", "sleep"] },
  { a: "sun", b: "day", c: "moon", ans: "night", opts: ["night", "star", "sky", "cloud"] },
];

const IQAnalogies = () => {
  const pick = () => POOL[Math.floor(Math.random() * POOL.length)];
  const [q, setQ] = useState(pick);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const choose = (o: string) => {
    if (o === q.ans) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(pick()); setFb(""); }, 400);
    } else { setFb("bad"); setStreak(0); setTimeout(() => setFb(""), 600); }
  };

  const opts = [...q.opts].sort(() => Math.random() - 0.5);

  return (
    <>
      <FloatingHowItWorks title="How IQAnalogies works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ArrowRightLeft className="w-5 h-5 text-primary" /> Analogies
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Streak: <strong>{streak}</strong></div>
        <div className={`p-3 rounded-lg text-center text-base font-mono ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : "bg-background/40"}`}>
          {q.a} : {q.b} :: {q.c} : <strong className="text-primary">?</strong>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {opts.map((o, i) => <Button key={i} onClick={() => choose(o)} variant="outline" size="sm">{o}</Button>)}
        </div>
        <Button onClick={() => { setStreak(0); setQ(pick()); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQAnalogies;
