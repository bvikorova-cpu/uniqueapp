import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Type, Trophy, Timer, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_anagram_hunt_best";
const DUR = 90;

const POOLS = [
  { letters: "AERSTL", words: ["ALERTS","ALTERS","STALER","LASER","LATER","RATES","TEARS","STARE","TALES","ARTS","RATE","SEAT","TALE","RAT","ATE","SET","ARE","EAR"] },
  { letters: "AEINRT", words: ["RETAIN","RETINA","TRAINER","TRAIN","NEAT","RAIN","TEAR","RANT","TIER","TIRE","RITE","NEAR","EARN","ANT","ATE","ARE"] },
  { letters: "AEIPRS", words: ["PRAISE","PARIES","REPAIR","SPARE","PEARS","PAIRS","REAPS","RAISE","PAIR","RIPE","PEAR","REAP","SEAR","ASP","SIR"] },
];

const IQAnagramHunt = () => {
  const [pool, setPool] = useState(POOLS[0]);
  const [phase, setPhase] = useState<"idle"|"play"|"done">("idle");
  const [found, setFound] = useState<string[]>([]);
  const [guess, setGuess] = useState("");
  const [time, setTime] = useState(DUR);
  const [best, setBest] = useState(0);
  const [flash, setFlash] = useState<"ok"|"err"|"dup"|null>(null);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const start = () => {
    setPool(POOLS[Math.floor(Math.random()*POOLS.length)]);
    setFound([]); setGuess(""); setTime(DUR); setPhase("play");
    if (tRef.current) window.clearInterval(tRef.current);
    tRef.current = window.setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          if (tRef.current) window.clearInterval(tRef.current);
          setPhase("done");
          setFound(f => { if (f.length > best) { setBest(f.length); localStorage.setItem(KEY, String(f.length)); } return f; });
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const submit = () => {
    const w = guess.trim().toUpperCase();
    if (!w) return;
    if (found.includes(w)) setFlash("dup");
    else if (pool.words.includes(w)) { setFound([...found, w]); setFlash("ok"); }
    else setFlash("err");
    setGuess(""); setTimeout(()=>setFlash(null), 250);
  };

  const reset = () => { if (tRef.current) window.clearInterval(tRef.current); setPhase("idle"); setFound([]); setTime(DUR); setGuess(""); };

  return (
    <>
      <FloatingHowItWorks title="How IQAnagram Hunt works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Type className="w-5 h-5 text-primary" /> Anagram Hunt
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {phase === "idle" && (
          <div className="h-32 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/40">
            <div className="text-xs text-muted-foreground">Find as many words as you can in {DUR}s</div>
            <Button onClick={start}>Start</Button>
          </div>
        )}
        {phase === "play" && (
          <div className={`rounded-xl border border-border/40 p-4 transition-colors ${flash==="ok"?"bg-emerald-500/10":flash==="err"?"bg-rose-500/10":flash==="dup"?"bg-amber-500/10":"bg-background/40"}`}>
            <div className="flex justify-between text-xs mb-2">
              <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {time}s</span>
              <span>Found: <strong>{found.length}</strong>/{pool.words.length}</span>
            </div>
            <div className="text-3xl font-bold tracking-widest text-center my-3 font-mono">{pool.letters.split("").join(" ")}</div>
            <Input autoFocus value={guess} onChange={e=>setGuess(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} className="text-center uppercase" />
            <div className="mt-3 flex flex-wrap gap-1 max-h-24 overflow-y-auto">
              {found.map(w => <Badge key={w} variant="secondary" className="text-xs">{w}</Badge>)}
            </div>
          </div>
        )}
        {phase === "done" && (
          <div className="rounded-xl border border-border/40 bg-background/40 p-4 text-center">
            <div className="text-3xl font-bold">{found.length} <span className="text-sm text-muted-foreground">words</span></div>
            <div className="text-xs text-muted-foreground mt-1">Possible: {pool.words.length}</div>
            <div className="flex gap-2 mt-3 justify-center">
              <Button onClick={start} size="sm">Again</Button>
              <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-3 h-3" /></Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQAnagramHunt;
