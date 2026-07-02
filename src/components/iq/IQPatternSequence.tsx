import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sigma, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const KEY = "iq_pattern_seq_best";

type Puzzle = { seq: number[]; answer: number; rule: string };

const gen = (lvl: number): Puzzle => {
  const r = Math.random();
  if (r < 0.25 || lvl < 2) {
    const a = Math.floor(Math.random() * 5) + 1, d = Math.floor(Math.random() * 6) + 2;
    return { seq: [a, a+d, a+2*d, a+3*d], answer: a + 4*d, rule: "arithmetic" };
  }
  if (r < 0.5) {
    const a = Math.floor(Math.random() * 4) + 2, q = Math.floor(Math.random() * 3) + 2;
    return { seq: [a, a*q, a*q*q, a*q*q*q], answer: a*q*q*q*q, rule: "geometric" };
  }
  if (r < 0.75) {
    const a = Math.floor(Math.random() * 3) + 1, b = Math.floor(Math.random() * 3) + 1;
    const s = [a, b]; for (let i = 0; i < 3; i++) s.push(s[i] + s[i+1]);
    return { seq: s.slice(0, 4), answer: s[2] + s[3], rule: "fibonacci-like" };
  }
  const a = Math.floor(Math.random() * 4) + 1;
  return { seq: [a, a*a, a*a*a, a*a*a*a].slice(0,4), answer: Math.pow(a, 5), rule: "powers" };
};

const IQPatternSequence = () => {
  const [puzzle, setPuzzle] = useState<Puzzle>(() => gen(1));
  const [guess, setGuess] = useState("");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [reveal, setReveal] = useState(false);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
  }, []);

  const submit = () => {
    if (parseInt(guess, 10) === puzzle.answer) {
      const ns = score + 1; setScore(ns);
      if (ns > best) { setBest(ns); localStorage.setItem(KEY, String(ns)); }
      setPuzzle(gen(ns)); setGuess(""); setReveal(false);
    } else {
      setReveal(true);
    }
  };

  const skip = () => { setPuzzle(gen(score)); setGuess(""); setReveal(false); };
  const reset = () => { setScore(0); setPuzzle(gen(1)); setGuess(""); setReveal(false); };

  return (
    <>
      <FloatingHowItWorks title="How IQPattern Sequence works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sigma className="w-5 h-5 text-primary" /> Pattern Sequence
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="rounded-xl border border-border/40 bg-background/40 p-4">
          <div className="text-xs text-muted-foreground mb-2">Find the next number — Streak: <strong>{score}</strong></div>
          <div className="text-3xl font-mono font-bold text-center my-4 tracking-wide">
            {puzzle.seq.join(", ")}, <span className="text-primary">?</span>
          </div>
          <Input autoFocus value={guess} onChange={e => setGuess(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} placeholder="?" className="text-center text-xl font-mono" inputMode="numeric" />
          {reveal && <div className="text-xs text-rose-400 text-center mt-2">Answer: <strong>{puzzle.answer}</strong> ({puzzle.rule})</div>}
          <div className="flex gap-2 mt-3">
            <Button onClick={submit} className="flex-1" size="sm">Submit</Button>
            <Button onClick={skip} variant="outline" size="sm">Skip</Button>
            <Button onClick={reset} variant="outline" size="icon"><RotateCcw className="w-4 h-4" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
    );
};

export default IQPatternSequence;
