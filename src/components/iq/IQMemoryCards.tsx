import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, Trophy, RotateCcw, Timer } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_memory_cards_best_ms";
const EMOJIS = ["🌟","🔥","💎","🎯","🚀","🎨","🧠","⚡"];

const shuffle = <T,>(a: T[]) => { const c = [...a]; for (let i=c.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[c[i],c[j]]=[c[j],c[i]];} return c; };

type Card = { id: number; emoji: string; flipped: boolean; matched: boolean };

const newDeck = (): Card[] => shuffle([...EMOJIS, ...EMOJIS]).map((e,i) => ({ id:i, emoji:e, flipped:false, matched:false }));

const IQMemoryCards = () => {
  const [deck, setDeck] = useState<Card[]>(newDeck());
  const [picked, setPicked] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [start, setStart] = useState<number | null>(null);
  const [now, setNow] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState(0);
  const tRef = useRef<number | null>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s,10)||0);
    return () => { if (tRef.current) window.clearInterval(tRef.current); };
  }, []);

  const tap = (i: number) => {
    if (done || deck[i].flipped || deck[i].matched || picked.length === 2) return;
    if (start === null) {
      const t = performance.now(); setStart(t); setNow(t);
      if (tRef.current) window.clearInterval(tRef.current);
      tRef.current = window.setInterval(() => setNow(performance.now()), 100);
    }
    const nd = [...deck]; nd[i] = { ...nd[i], flipped: true }; setDeck(nd);
    const np = [...picked, i]; setPicked(np);
    if (np.length === 2) {
      setMoves(m => m+1);
      const [a,b] = np;
      if (nd[a].emoji === nd[b].emoji) {
        setTimeout(() => {
          const md = [...nd]; md[a].matched = true; md[b].matched = true; setDeck(md); setPicked([]);
          if (md.every(c => c.matched)) {
            const elapsed = Math.round(performance.now() - (start || performance.now()));
            if (tRef.current) window.clearInterval(tRef.current);
            setDone(true);
            if (best === 0 || elapsed < best) { setBest(elapsed); localStorage.setItem(KEY, String(elapsed)); }
          }
        }, 300);
      } else {
        setTimeout(() => {
          const md = [...nd]; md[a].flipped = false; md[b].flipped = false; setDeck(md); setPicked([]);
        }, 700);
      }
    }
  };

  const reset = () => { if (tRef.current) window.clearInterval(tRef.current); setDeck(newDeck()); setPicked([]); setMoves(0); setStart(null); setNow(0); setDone(false); };
  const elapsed = start ? ((now - start) / 1000).toFixed(1) : "0.0";

  return (
    <>
      <FloatingHowItWorks title="How IQMemory Cards works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-primary" /> Memory Cards
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {(best/1000).toFixed(1)}s</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> {elapsed}s</span>
          <span>Moves: <strong>{moves}</strong></span>
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {deck.map((c, i) => (
            <button key={c.id} onClick={()=>tap(i)} className={`aspect-square rounded-lg border text-2xl transition-all ${c.matched?"bg-emerald-500/20 border-emerald-400/40":c.flipped?"bg-primary/20 border-primary":"bg-background/60 border-border/40 hover:border-primary/40"}`}>
              {c.flipped || c.matched ? c.emoji : "?"}
            </button>
          ))}
        </div>
        {done && <div className="text-center text-emerald-400 font-bold">🏆 {(best/1000).toFixed(1)}s · {moves} moves</div>}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> New game</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQMemoryCards;
