import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Binary, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_binary_best_streak";

const gen = () => {
  const dir = Math.random() < 0.5 ? "tobin" : "todec";
  const n = 1 + Math.floor(Math.random() * 255);
  return { dir, n, bin: n.toString(2) };
};

const IQBinaryConvert = () => {
  const [q, setQ] = useState(gen);
  const [v, setV] = useState("");
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [fb, setFb] = useState<"" | "ok" | "bad">("");

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const submit = () => {
    const ok = q.dir === "tobin" ? v.replace(/\s/g, "") === q.bin : parseInt(v, 10) === q.n;
    if (ok) {
      const ns = streak + 1; setStreak(ns); setFb("ok");
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setTimeout(() => { setQ(gen()); setV(""); setFb(""); }, 400);
    } else { setFb("bad"); setStreak(0); setTimeout(() => setFb(""), 600); }
  };

  return (
    <>
      <FloatingHowItWorks title="How IQBinary Convert works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Binary className="w-5 h-5 text-primary" /> Binary Convert
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Streak: <strong>{streak}</strong></div>
        <div className={`p-4 rounded-lg text-center font-mono ${fb === "ok" ? "bg-emerald-500/20" : fb === "bad" ? "bg-rose-500/20" : "bg-background/40"}`}>
          <div className="text-xs text-muted-foreground mb-1">{q.dir === "tobin" ? "Decimal → Binary" : "Binary → Decimal"}</div>
          <div className="text-2xl font-bold">{q.dir === "tobin" ? q.n : q.bin}</div>
        </div>
        <div className="flex gap-2">
          <Input value={v} onChange={e => setV(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="Answer" />
          <Button onClick={submit} size="sm">OK</Button>
        </div>
        <Button onClick={() => { setStreak(0); setQ(gen()); setV(""); }} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQBinaryConvert;
