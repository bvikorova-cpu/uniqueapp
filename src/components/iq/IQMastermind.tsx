import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_mastermind_best_attempts";
const COLORS = ["bg-rose-500", "bg-amber-500", "bg-emerald-500", "bg-sky-500", "bg-violet-500", "bg-pink-500"];
const LEN = 4;
const MAX = 8;

const makeCode = () => Array.from({ length: LEN }, () => Math.floor(Math.random() * COLORS.length));

const IQMastermind = () => {
  const [code, setCode] = useState<number[]>(makeCode);
  const [guess, setGuess] = useState<number[]>([]);
  const [history, setHistory] = useState<{ g: number[]; b: number; w: number }[]>([]);
  const [phase, setPhase] = useState<"play" | "won" | "lost">("play");
  const [best, setBest] = useState(0);

  useEffect(() => { const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0); }, []);

  const pick = (c: number) => { if (phase === "play" && guess.length < LEN) setGuess([...guess, c]); };
  const undo = () => setGuess(guess.slice(0, -1));

  const submit = () => {
    if (guess.length !== LEN) return;
    let b = 0, w = 0;
    const cc = [...code], gg = [...guess];
    for (let i = 0; i < LEN; i++) if (gg[i] === cc[i]) { b++; cc[i] = -1; gg[i] = -2; }
    for (let i = 0; i < LEN; i++) {
      if (gg[i] < 0) continue;
      const idx = cc.indexOf(gg[i]);
      if (idx >= 0) { w++; cc[idx] = -1; }
    }
    const h = [...history, { g: guess, b, w }];
    setHistory(h); setGuess([]);
    if (b === LEN) {
      setPhase("won");
      if (best === 0 || h.length < best) { setBest(h.length); localStorage.setItem(KEY, String(h.length)); }
    } else if (h.length >= MAX) setPhase("lost");
  };

  const reset = () => { setCode(makeCode()); setGuess([]); setHistory([]); setPhase("play"); };

  return (
    <>
      <FloatingHowItWorks title="How IQMastermind works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-primary" /> Mastermind
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} tries</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-xs text-muted-foreground text-center">Crack the 4-color code in {MAX} tries · ⬤ exact · ○ wrong spot</div>
        <div className="space-y-1 max-h-40 overflow-y-auto">
          {history.map((h, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-4">{i + 1}</span>
              <div className="flex gap-1">{h.g.map((c, j) => <div key={j} className={`w-5 h-5 rounded-full ${COLORS[c]}`} />)}</div>
              <span className="text-xs font-mono ml-2">{"⬤".repeat(h.b)}<span className="opacity-60">{"○".repeat(h.w)}</span></span>
            </div>
          ))}
        </div>
        {phase === "play" && (
          <>
            <div className="flex gap-1 justify-center min-h-[28px]">
              {Array.from({ length: LEN }).map((_, i) => (
                <div key={i} className={`w-7 h-7 rounded-full border-2 border-border/50 ${guess[i] !== undefined ? COLORS[guess[i]] : ""}`} />
              ))}
            </div>
            <div className="flex gap-1 justify-center flex-wrap">
              {COLORS.map((c, i) => <button key={i} onClick={() => pick(i)} className={`w-7 h-7 rounded-full ${c} hover:scale-110 transition-transform`} />)}
            </div>
            <div className="flex gap-2">
              <Button onClick={undo} variant="outline" size="sm" className="flex-1" disabled={!guess.length}>Undo</Button>
              <Button onClick={submit} size="sm" className="flex-1" disabled={guess.length !== LEN}>Guess</Button>
            </div>
          </>
        )}
        {phase === "won" && <div className="text-center text-emerald-400 font-bold">🏆 Cracked in {history.length} tries!</div>}
        {phase === "lost" && (
          <div className="text-center">
            <div className="text-rose-400 font-bold mb-2">Out of tries!</div>
            <div className="flex justify-center gap-1">{code.map((c, i) => <div key={i} className={`w-6 h-6 rounded-full ${COLORS[c]}`} />)}</div>
          </div>
        )}
        <Button onClick={reset} variant="outline" size="sm" className="w-full"><RotateCcw className="w-3 h-3 mr-1" /> New code</Button>
      </CardContent>
    </Card>
    </>
    );
};

export default IQMastermind;
