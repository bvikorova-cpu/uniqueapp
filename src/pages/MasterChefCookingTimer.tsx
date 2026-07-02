import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Play, Pause, RotateCcw, Bell, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

export default function MasterChefCookingTimer() {
  const [timers, setTimers] = useState<TimerItem[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newMinutes, setNewMinutes] = useState("5");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczFjl+tN/RczwhOX241NF7PCBBY7C8sXo/PVFzmMrPs2UhJVh7psnUqFcoI1eArM7SmUMYNU6Crs7IoUwZM02ErsrJpVEcMEaKsMbHqFgfLUGOs8HEqVshKjqTtrzBq14jJzSZuLi+rGEmJC+fvLS7rWQoIimlwLC5rGgpHyasxK23q2sqHCOvy6y0q28tGyCz0Km0rHIuFx640qezq3YwFRq+1aSwq3kzExbB2KKvrHw1EBPGzqKurH43DhHKzaCvrYA4CxDO0J6wrYI6CQ/R0p2wrYQ7CA7U1JywrYY9Bg3X1puvr4g+BAvb2Jmvr4pAAwnd2pevsIxBAgfh3Javsoxl");
    return () => { audioRef.current = null; };
  }, []);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setTimers(prev => prev.map(t => {
        if (!t.isRunning || t.remainingSeconds <= 0) return t;
        const next = t.remainingSeconds - 1;
        if (next === 0) {
          audioRef.current?.play().catch(() => {});
        }
        return { ...t, remainingSeconds: next, isRunning: next > 0 ? t.isRunning : false };
      }));
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const addTimer = () => {
    const mins = parseInt(newMinutes) || 5;
    const secs = mins * 60;
    setTimers(prev => [...prev, {
      id: crypto.randomUUID(),
      label: newLabel || `Timer ${prev.length + 1}`,
      totalSeconds: secs,
      remainingSeconds: secs,
      isRunning: false,
    }]);
    setNewLabel("");
    setNewMinutes("5");
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, isRunning: !t.isRunning } : t));
  };

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(t => t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false } : t));
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const presets = [
    { label: "Soft Boiled Egg", mins: 6 },
    { label: "Pasta Al Dente", mins: 8 },
    { label: "Rice", mins: 18 },
    { label: "Steak (Medium)", mins: 4 },
    { label: "Bread Proofing", mins: 45 },
    { label: "Cake Baking", mins: 35 },
  ];

  return (
    <>
      <FloatingHowItWorks title="How Master Chef Cooking Timer works" steps={[
          { title: 'Explore the feature', desc: 'Browse the options and pick what interests you.' },
          { title: 'Interact', desc: 'Tap actions, generate content, or make a selection. AI actions cost 2-5 credits.' },
          { title: 'Review results', desc: 'Check the output, share, save or purchase where available.' },
          { title: 'Come back', desc: 'Progress and history are saved to your account.' },
        ]} />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
            Live Cooking Timer
          </h1>
          <p className="text-muted-foreground text-lg">Multiple timers with audio alerts for perfect cooking</p>
        </div>

        {/* Add Timer */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5 text-primary" /> Add New Timer</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input placeholder="Timer name..." value={newLabel} onChange={e => setNewLabel(e.target.value)} className="flex-1" />
              <Input type="number" min="1" max="999" value={newMinutes} onChange={e => setNewMinutes(e.target.value)} className="w-24" placeholder="Min" />
              <Button onClick={addTimer}><Plus className="h-4 w-4 mr-1" /> Add</Button>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Quick Presets:</p>
              <div className="flex flex-wrap gap-2">
                {presets.map(p => (
                  <Button key={p.label} size="sm" variant="outline" onClick={() => {
                    setTimers(prev => [...prev, { id: crypto.randomUUID(), label: p.label, totalSeconds: p.mins * 60, remainingSeconds: p.mins * 60, isRunning: false }]);
                  }}>{p.label} ({p.mins}m)</Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Timers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {timers.map(timer => {
            const progress = timer.totalSeconds > 0 ? ((timer.totalSeconds - timer.remainingSeconds) / timer.totalSeconds) * 100 : 0;
            const isDone = timer.remainingSeconds === 0;
            return (
              <motion.div key={timer.id} layout initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                <Card className={`${isDone ? "border-red-500 bg-red-500/10 animate-pulse" : timer.isRunning ? "border-primary/50" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold">{timer.label}</h3>
                      <Button size="icon" variant="ghost" onClick={() => removeTimer(timer.id)} className="h-7 w-7">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div className={`text-5xl font-mono font-black text-center my-4 ${isDone ? "text-red-500" : "text-foreground"}`}>
                      {isDone ? "DONE!" : formatTime(timer.remainingSeconds)}
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2 mb-4">
                      <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex gap-2 justify-center">
                      <Button size="sm" onClick={() => toggleTimer(timer.id)} disabled={isDone}>
                        {timer.isRunning ? <><Pause className="h-4 w-4 mr-1" /> Pause</> : <><Play className="h-4 w-4 mr-1" /> Start</>}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => resetTimer(timer.id)}>
                        <RotateCcw className="h-4 w-4 mr-1" /> Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {timers.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Bell className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">No timers yet. Add one above or use a preset!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
    </>
    );
}
