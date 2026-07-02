import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Timer, Play, Pause, RotateCcw, Coffee, Brain } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
type Phase = "focus" | "break";
const PRESETS = [
  { focus: 15, brk: 3, label: "Quick" },
  { focus: 25, brk: 5, label: "Classic" },
  { focus: 50, brk: 10, label: "Deep" },
];

const STORAGE_KEY = "iq_focus_completed";

const fmt = (s: number) => {
  const m = Math.floor(s / 60).toString().padStart(2, "0");
  const ss = (s % 60).toString().padStart(2, "0");
  return `${m}:${ss}`;
};

const IQFocusTimer = () => {
  const [presetIdx, setPresetIdx] = useState(1);
  const [phase, setPhase] = useState<Phase>("focus");
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(PRESETS[1].focus * 60);
  const [completed, setCompleted] = useState(0);
  const tickRef = useRef<number | null>(null);

  const preset = PRESETS[presetIdx];
  const total = (phase === "focus" ? preset.focus : preset.brk) * 60;
  const pct = ((total - remaining) / total) * 100;

  useEffect(() => {
    const c = parseInt(localStorage.getItem(STORAGE_KEY) ?? "0", 10);
    setCompleted(Number.isFinite(c) ? c : 0);
  }, []);

  useEffect(() => {
    if (!running) return;
    tickRef.current = window.setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          window.clearInterval(tickRef.current!);
          if (phase === "focus") {
            const next = completed + 1;
            setCompleted(next);
            localStorage.setItem(STORAGE_KEY, String(next));
            setPhase("break");
            setRemaining(preset.brk * 60);
          } else {
            setPhase("focus");
            setRemaining(preset.focus * 60);
            setRunning(false);
          }
          try {
            new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=").play().catch(() => {});
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification(phase === "focus" ? "Focus session complete" : "Break complete", {
                body: phase === "focus" ? "Time for a short break." : "Back to focus!",
              });
            }
          } catch {}
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
  }, [running, phase, preset, completed]);

  const start = () => {
    if (!running && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }
    setRunning(r => !r);
  };

  const reset = () => {
    setRunning(false);
    setPhase("focus");
    setRemaining(preset.focus * 60);
  };

  const choosePreset = (i: number) => {
    setPresetIdx(i);
    setRunning(false);
    setPhase("focus");
    setRemaining(PRESETS[i].focus * 60);
  };

  return (
    <>
      <FloatingHowItWorks title="How IQFocus Timer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
      <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-primary" /> Focus Timer
          <Badge variant="outline" className="ml-auto text-xs">
            {completed} sessions today
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          {PRESETS.map((p, i) => (
            <Button
              key={p.label}
              size="sm"
              variant={i === presetIdx ? "default" : "outline"}
              onClick={() => choosePreset(i)}
              className="flex-1"
            >
              {p.label} <span className="ml-1 text-xs opacity-70">{p.focus}/{p.brk}</span>
            </Button>
          ))}
        </div>

        <div className="relative flex flex-col items-center justify-center py-6">
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              background: `conic-gradient(hsl(var(--primary)) ${pct}%, transparent ${pct}%)`,
              opacity: 0.12,
            }}
          />
          <div className="relative">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              {phase === "focus" ? <Brain className="w-4 h-4 text-primary" /> : <Coffee className="w-4 h-4 text-accent" />}
              <span className="uppercase tracking-wider">{phase}</span>
            </div>
            <div className="text-6xl font-bold font-mono tabular-nums text-center">
              {fmt(remaining)}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={start} className="flex-1">
            {running ? <><Pause className="w-4 h-4 mr-2" /> Pause</> : <><Play className="w-4 h-4 mr-2" /> Start</>}
          </Button>
          <Button onClick={reset} variant="outline" size="icon">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Train in focused intervals to maximize cognitive performance.
        </p>
      </CardContent>
    </Card>
    </>
    );
};

export default IQFocusTimer;
