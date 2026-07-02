import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Triangle, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_geometry_best_streak";

const gen = () => {
  const t = Math.floor(Math.random() * 3);
  if (t === 0) {
    // Triangle: two angles given, find third
    const a = 20 + Math.floor(Math.random() * 60);
    const b = 20 + Math.floor(Math.random() * (160 - a));
    return { q: `Triangle angles: ${a}° + ${b}° + ? = 180°`, ans: 180 - a - b };
  } else if (t === 1) {
    // Rectangle area
    const w = 2 + Math.floor(Math.random() * 12), h = 2 + Math.floor(Math.random() * 12);
    return { q: `Rectangle area: ${w} × ${h} = ?`, ans: w * h };
  } else {
    // Circle: circumference rounded (use π=3.14)
    const r = 1 + Math.floor(Math.random() * 10);
    return { q: `Circle circumference (π=3.14, r=${r}) = ?`, ans: Math.round(2 * 3.14 * r) };
  }
};

const IQGeometry = () => {
  const [q, setQ] = useState(gen);
  const [v, setV] = useState("");
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const submit = () => {
    if (parseInt(v, 10) === q.ans) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(gen()); setV(""); setFb(""); }, 400);
    } else {
      setFb("bad"); setStreak(0);
      setTimeout(() => setFb(""), 600);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQGeometry works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Triangle className="w-5 h-5 text-primary" /> Geometry
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Streak: <strong>{streak}</strong></div>
        <div className={`p-4 rounded-lg text-center text-base font-medium ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : "bg-background/40"}`}>
          {q.q}
        </div>
        <div className="flex gap-2">
          <Input type="number" value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Answer" />
          <Button onClick={submit} size="sm">OK</Button>
        </div>
        <Button onClick={() => { setQ(gen()); setStreak(0); setV(""); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQGeometry;
