import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Timer, Play, Pause, RotateCcw, Bell, Plus, Trash2, History } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface TimerItem {
  id: string;
  label: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  loggedDone?: boolean;
}

type Session = { id: string; dish_name: string; duration_seconds: number; completed: boolean; created_at: string };

export default function MasterChefCookingTimer() {
  const [timers, setTimers] = useState<TimerItem[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newMinutes, setNewMinutes] = useState("5");
  const [userId, setUserId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    audioRef.current = new Audio(
      "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbsGczFjl+tN/RczwhOX241NF7PCBBY7C8sXo/PVFzmMrPs2UhJVh7psnUqFcoI1eArM7SmUMYNU6Crs7IoUwZM02ErsrJpVEcMEaKsMbHqFgfLUGOs8HEqVshKjqTtrzBq14jJzSZuLi+rGEmJC+fvLS7rWQoIimlwLC5rGgpHyasxK23q2sqHCOvy6y0q28tGyCz0Km0rHIuFx640qezq3YwFRq+1aSwq3kzExbB2KKvrHw1EBPGzqKurH43DhHKzaCvrYA4CxDO0J6wrYI6CQ/R0p2wrYQ7CA7U1JywrYY9Bg3X1puvr4g+BAvb2Jmvr4pAAwnd2pevsIxBAgfh3Javsoxl"
    );
    return () => { audioRef.current = null; };
  }, []);

  const logSession = async (label: string, seconds: number) => {
    if (!userId) return;
    const { error } = await supabase.from("masterchef_cooking_sessions" as any).insert({
      user_id: userId,
      dish_name: label,
      duration_seconds: seconds,
      completed: true,
    });
    if (!error) qc.invalidateQueries({ queryKey: ["masterchef-cooking-sessions"] });
  };

  useEffect(() => {
    const id = setInterval(() => {
      setTimers((prev) =>
        prev.map((t) => {
          if (!t.isRunning || t.remainingSeconds <= 0) return t;
          const next = t.remainingSeconds - 1;
          if (next === 0) {
            audioRef.current?.play().catch(() => {});
            if (!t.loggedDone) {
              logSession(t.label, t.totalSeconds);
              return { ...t, remainingSeconds: 0, isRunning: false, loggedDone: true };
            }
          }
          return { ...t, remainingSeconds: next };
        })
      );
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const { data: sessions } = useQuery({
    queryKey: ["masterchef-cooking-sessions", userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("masterchef_cooking_sessions" as any)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return (data ?? []) as unknown as Session[];
    },
  });

  const addTimer = () => {
    const mins = parseInt(newMinutes) || 5;
    const secs = mins * 60;
    setTimers((prev) => [
      ...prev,
      { id: crypto.randomUUID(), label: newLabel || `Timer ${prev.length + 1}`, totalSeconds: secs, remainingSeconds: secs, isRunning: false },
    ]);
    setNewLabel("");
    setNewMinutes("5");
  };

  const toggleTimer = (id: string) => setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, isRunning: !t.isRunning } : t)));
  const resetTimer = (id: string) => setTimers((prev) => prev.map((t) => (t.id === id ? { ...t, remainingSeconds: t.totalSeconds, isRunning: false, loggedDone: false } : t)));
  const removeTimer = (id: string) => setTimers((prev) => prev.filter((t) => t.id !== id));
  const deleteSession = async (id: string) => {
    await supabase.from("masterchef_cooking_sessions" as any).delete().eq("id", id);
    qc.invalidateQueries({ queryKey: ["masterchef-cooking-sessions"] });
    toast.success("Session removed");
  };

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const presets = useMemo(
    () => [
      { label: "Soft Boiled Egg", mins: 6 },
      { label: "Pasta Al Dente", mins: 8 },
      { label: "Rice", mins: 18 },
      { label: "Steak (Medium)", mins: 4 },
      { label: "Bread Proofing", mins: 45 },
      { label: "Cake Baking", mins: 35 },
    ],
    []
  );

  return (
    <>
      <FloatingHowItWorks
        title="How Master Chef Cooking Timer works"
        intro="Run multiple kitchen timers with audio alerts — completed cooks are saved to your history."
        steps={[
          { title: "Add or pick preset", desc: "Name a timer and set minutes, or tap a preset." },
          { title: "Start / pause / reset", desc: "Manage each timer independently." },
          { title: "Get an audio ping", desc: "You'll hear an alert when a timer hits zero." },
          { title: "Review history", desc: "Signed-in users see the last 10 completed cooks." },
        ]}
      />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate("/masterchef-subscription")}>← Back</Button>

          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
              Live Cooking Timer
            </h1>
            <p className="text-muted-foreground text-lg">Multiple timers with audio alerts for perfect cooking</p>
          </div>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Timer className="h-5 w-5 text-primary" /> Add New Timer</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input placeholder="Timer name..." value={newLabel} onChange={(e) => setNewLabel(e.target.value)} className="flex-1" />
                <Input type="number" min="1" max="999" value={newMinutes} onChange={(e) => setNewMinutes(e.target.value)} className="w-24" placeholder="Min" />
                <Button onClick={addTimer}><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Quick Presets:</p>
                <div className="flex flex-wrap gap-2">
                  {presets.map((p) => (
                    <Button key={p.label} size="sm" variant="outline" onClick={() => {
                      setTimers((prev) => [...prev, { id: crypto.randomUUID(), label: p.label, totalSeconds: p.mins * 60, remainingSeconds: p.mins * 60, isRunning: false }]);
                    }}>{p.label} ({p.mins}m)</Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {timers.map((timer) => {
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

          {userId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><History className="h-5 w-5 text-primary" /> Recent cooks</CardTitle>
              </CardHeader>
              <CardContent>
                {!sessions?.length ? (
                  <p className="text-sm text-muted-foreground">Completed timers appear here.</p>
                ) : (
                  <ul className="divide-y divide-border/40">
                    {sessions.map((s) => (
                      <li key={s.id} className="flex items-center justify-between py-2 text-sm">
                        <div>
                          <span className="font-semibold">{s.dish_name}</span>
                          <span className="text-muted-foreground ml-2">{Math.round(s.duration_seconds / 60)} min</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{new Date(s.created_at).toLocaleString()}</span>
                          <Button size="icon" variant="ghost" onClick={() => deleteSession(s.id)} className="h-7 w-7">
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
