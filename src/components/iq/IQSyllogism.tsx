import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_syllogism_best_streak";

const POOL: { p1: string; p2: string; valid: boolean; concl: string }[] = [
  { p1: "All cats are mammals.", p2: "All mammals breathe air.", concl: "All cats breathe air.", valid: true },
  { p1: "Some birds are pets.", p2: "All pets need food.", concl: "Some birds need food.", valid: true },
  { p1: "No fish are mammals.", p2: "All whales are mammals.", concl: "No whales are fish.", valid: true },
  { p1: "All squares are rectangles.", p2: "Some rectangles are red.", concl: "All squares are red.", valid: false },
  { p1: "All dogs bark.", p2: "Some animals bark.", concl: "All animals are dogs.", valid: false },
  { p1: "Some cars are blue.", p2: "All blue things are cold.", concl: "Some cars are cold.", valid: true },
  { p1: "No reptiles are warm-blooded.", p2: "All snakes are reptiles.", concl: "All snakes are warm-blooded.", valid: false },
  { p1: "All artists are creative.", p2: "Some creative people are rich.", concl: "All artists are rich.", valid: false },
];

const IQSyllogism = () => {
  const [q, setQ] = useState(POOL[Math.floor(Math.random() * POOL.length)]);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const pick = (v: boolean) => {
    if (v === q.valid) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(POOL[Math.floor(Math.random() * POOL.length)]); setFb(""); }, 400);
    } else { setFb("bad"); setStreak(0); setTimeout(() => setFb(""), 600); }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQSyllogism works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" /> Syllogism
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Streak: <strong>{streak}</strong></div>
        <div className={`p-3 rounded-lg text-sm space-y-1 ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : "bg-background/40"}`}>
          <div>P1: {q.p1}</div>
          <div>P2: {q.p2}</div>
          <div className="pt-1 border-t border-border/40 font-medium">∴ {q.concl}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button onClick={() => pick(true)} variant="outline" className="text-emerald-400">Valid</Button>
          <Button onClick={() => pick(false)} variant="outline" className="text-rose-400">Invalid</Button>
        </div>
        <Button onClick={() => { setStreak(0); setQ(POOL[Math.floor(Math.random() * POOL.length)]); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQSyllogism;
