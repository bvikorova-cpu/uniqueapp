import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Keyboard, Trophy, RotateCcw } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const SAMPLES = [
  "the quick brown fox jumps over the lazy dog",
  "practice makes perfect when you focus daily",
  "intelligence grows with consistent challenge",
  "a sharp mind is built one habit at a time",
  "logic patterns reveal themselves to patient minds",
];
const KEY = "iq_typing_best_wpm";

const IQTypingSpeed = () => {
  const [phase, setPhase] = useState<"idle"|"play"|"done">("idle");
  const [text, setText] = useState(SAMPLES[0]);
  const [typed, setTyped] = useState("");
  const [start, setStart] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [acc, setAcc] = useState(100);
  const [best, setBest] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = localStorage.getItem(KEY); if (s) setBest(parseInt(s, 10) || 0);
  }, []);

  const begin = () => {
    setText(SAMPLES[Math.floor(Math.random() * SAMPLES.length)]);
    setTyped(""); setWpm(0); setAcc(100); setStart(performance.now()); setPhase("play");
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const onChange = (v: string) => {
    setTyped(v);
    if (v.length === text.length || (v.length > 0 && v === text)) {
      const mins = (performance.now() - start) / 60000;
      const words = text.split(" ").length;
      const w = Math.round(words / mins);
      let correct = 0;
      for (let i = 0; i < text.length; i++) if (v[i] === text[i]) correct++;
      const a = Math.round((correct / text.length) * 100);
      setWpm(w); setAcc(a); setPhase("done");
      if (w > best) { setBest(w); localStorage.setItem(KEY, String(w)); }
    }
  };

  const reset = () => { setPhase("idle"); setTyped(""); setWpm(0); setAcc(100); };

  return (
    <>
      <FloatingHowItWorks title="How IQTyping Speed works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-primary" /> Typing Speed
          {best > 0 && <Badge variant="outline" className="ml-auto text-xs"><Trophy className="w-3 h-3 mr-1 text-yellow-500" /> {best} WPM</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {phase === "idle" && (
          <div className="h-32 flex flex-col items-center justify-center gap-2 rounded-xl border border-border/40 bg-background/40">
            <div className="text-xs text-muted-foreground">Type the sentence as fast & accurate as you can</div>
            <Button onClick={begin}>Start</Button>
          </div>
        )}
        {phase === "play" && (
          <div className="rounded-xl border border-border/40 bg-background/40 p-4">
            <div className="font-mono text-sm leading-relaxed mb-3">
              {text.split("").map((c, i) => {
                let cls = "text-muted-foreground";
                if (i < typed.length) cls = typed[i] === c ? "text-emerald-400" : "text-rose-400 underline";
                return <span key={i} className={cls}>{c}</span>;
              })}
            </div>
            <input ref={inputRef} value={typed} onChange={e => onChange(e.target.value)} className="w-full bg-background/60 border border-border/40 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:border-primary" />
          </div>
        )}
        {phase === "done" && (
          <div className="h-32 flex flex-col items-center justify-center gap-1 rounded-xl border border-border/40 bg-background/40">
            <div className="text-3xl font-bold">{wpm} <span className="text-sm text-muted-foreground">WPM</span></div>
            <div className="text-xs text-muted-foreground">Accuracy: {acc}%{wpm >= best && wpm > 0 && " · 🏆 New best!"}</div>
            <div className="flex gap-2 mt-1">
              <Button onClick={begin} size="sm">Again</Button>
              <Button onClick={reset} variant="outline" size="sm"><RotateCcw className="w-3 h-3 mr-1" /> Reset</Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    </>
    );
};

export default IQTypingSpeed;
