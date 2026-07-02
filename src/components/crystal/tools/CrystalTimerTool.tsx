import { useState, useEffect, useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, RotateCcw, Timer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CHAKRAS } from "../crystalData";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const DURATIONS = [{ label: "5 min", value: 300 }, { label: "10 min", value: 600 }, { label: "15 min", value: 900 }, { label: "20 min", value: 1200 }, { label: "30 min", value: 1800 }];

export const CrystalTimerTool = () => {
  const [duration, setDuration] = useState(600);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedChakra, setSelectedChakra] = useState("Heart");
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);

  const chakra = CHAKRAS.find(c => c.name === selectedChakra) || CHAKRAS[3];

  const startAudio = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = chakra.frequency;
      gain.gain.value = 0.08;
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      audioCtxRef.current = ctx;
      oscRef.current = osc;
    } catch {}
  }, [chakra.frequency]);

  const stopAudio = useCallback(() => {
    try { oscRef.current?.stop(); audioCtxRef.current?.close(); } catch {}
    oscRef.current = null;
    audioCtxRef.current = null;
  }, []);

  const saveSession = async (elapsed: number) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    await (supabase as any).from("crystal_meditation_sessions").insert({
      user_id: session.user.id,
      duration_seconds: elapsed,
      frequency_type: `${chakra.name} (${chakra.frequency} Hz)`,
      chakra_focus: chakra.name,
    });
    await (supabase as any).rpc("increment_crystal_stat", { p_user_id: session.user.id, p_stat: "meditations", p_value: 1 });
  };

  const start = () => { setTimeLeft(duration); setIsRunning(true); startAudio(); };
  const pause = () => { setIsRunning(false); stopAudio(); };
  const reset = () => { setIsRunning(false); setTimeLeft(0); stopAudio(); };

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft <= 0 && isRunning) {
        setIsRunning(false);
        stopAudio();
        saveSession(duration);
        toast.success("Meditation complete! 🧘 Session saved.");
      }
      return;
    }
    const t = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(t);
  }, [isRunning, timeLeft]);

  useEffect(() => () => stopAudio(), []);

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const progress = timeLeft > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return (
    <Card className="bg-card/80 backdrop-blur-xl border-border/50">
      <CardHeader>
        <CardTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <Timer className="w-5 h-5" /> Meditation Timer
        </CardTitle>
        <p className="text-sm text-muted-foreground">Crystal frequency meditation with chakra-tuned tones</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Duration</label>
            <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))} disabled={isRunning}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{DURATIONS.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground">Chakra Focus</label>
            <Select value={selectedChakra} onValueChange={setSelectedChakra} disabled={isRunning}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{CHAKRAS.map(c => <SelectItem key={c.name} value={c.name}>{c.name} ({c.frequency} Hz)</SelectItem>)}</SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative flex flex-col items-center py-8">
          <div className="w-48 h-48 rounded-full border-4 flex items-center justify-center relative" style={{ borderColor: chakra.color }}>
            <div className="absolute inset-0 rounded-full" style={{ background: `conic-gradient(${chakra.color} ${progress}%, transparent ${progress}%)`, opacity: 0.15 }} />
            <div className="text-center z-10">
              <div className="text-4xl font-black font-mono">{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}</div>
              <div className="text-xs text-muted-foreground mt-1">{chakra.name} • {chakra.frequency} Hz</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {!isRunning && timeLeft === 0 && <Button onClick={start} className="gap-2"><Play className="w-4 h-4" /> Start</Button>}
          {isRunning && <Button onClick={pause} variant="secondary" className="gap-2"><Pause className="w-4 h-4" /> Pause</Button>}
          {!isRunning && timeLeft > 0 && (
            <>
              <Button onClick={() => { setIsRunning(true); startAudio(); }} className="gap-2"><Play className="w-4 h-4" /> Resume</Button>
              <Button onClick={reset} variant="outline" className="gap-2"><RotateCcw className="w-4 h-4" /> Reset</Button>
            </>
          )}
        </div>

        <div className="grid grid-cols-7 gap-1.5 pt-4 border-t border-border/30">
          {CHAKRAS.map(c => (
            <div key={c.name} className="text-center">
              <div className="w-6 h-6 rounded-full mx-auto mb-1" style={{ backgroundColor: c.color, opacity: c.name === selectedChakra ? 1 : 0.3 }} />
              <span className="text-[9px] text-muted-foreground">{c.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
