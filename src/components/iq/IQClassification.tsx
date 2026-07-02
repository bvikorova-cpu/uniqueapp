import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_classify_best_streak";

const SETS = [
  { items: ["dog", "cat", "horse", "trout", "rabbit"], odd: "trout" },
  { items: ["red", "blue", "green", "circle", "yellow"], odd: "circle" },
  { items: ["apple", "pear", "carrot", "banana", "grape"], odd: "carrot" },
  { items: ["2", "3", "5", "7", "9"], odd: "9" },
  { items: ["piano", "violin", "guitar", "drum", "spoon"], odd: "spoon" },
  { items: ["square", "triangle", "circle", "cube", "pentagon"], odd: "cube" },
  { items: ["car", "bike", "boat", "tree", "plane"], odd: "tree" },
  { items: ["sun", "moon", "star", "cloud", "comet"], odd: "cloud" },
];

const IQClassification = () => {
  const pick = () => SETS[Math.floor(Math.random() * SETS.length)];
  const [q, setQ] = useState(pick);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const choose = (item: string) => {
    if (item === q.odd) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(pick()); setFb(""); }, 400);
    } else { setFb("bad"); setStreak(0); setTimeout(() => setFb(""), 600); }
  };

  const shuffled = [...q.items].sort(() => Math.random() - 0.5);

  return (
    <>
      <FloatingHowItWorks title="How IQClassification works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary" /> Classification
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Find the odd one out · Streak: <strong>{streak}</strong></div>
        <div className={`grid grid-cols-2 gap-2 p-2 rounded ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : ""}`}>
          {shuffled.map((it, i) => <Button key={i} onClick={() => choose(it)} variant="outline">{it}</Button>)}
        </div>
        <Button onClick={() => { setStreak(0); setQ(pick()); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQClassification;
