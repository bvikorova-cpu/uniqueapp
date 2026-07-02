import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Timer, Loader2, Sparkles, Play, Pause, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAICredits } from "@/hooks/useAICredits";
import { toast } from "@/hooks/use-toast";
import { useEffect, useRef } from "react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface TimerItem {
  label: string;
  seconds: number;
  remaining: number;
  running: boolean;
}

interface Props { onBack: () => void; }

export default function AICookingTimer({ onBack }: Props) {
  const { credits, spendCredit } = useAICredits();
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [timers, setTimers] = useState<TimerItem[]>([]);
  const intervalsRef = useRef<Record<number, NodeJS.Timeout>>({});

  const analyze = async () => {
    if (!input.trim()) return;
    if (credits.credits_remaining < 3) { toast({ title: "Not enough credits", description: "You need 3 credits.", variant: "destructive" }); return; }
    setLoading(true);
    try {
      const ok = await spendCredit("custom_generation", "AI Cooking Timer");
      if (!ok) throw new Error("Failed to use credit");
      const { data, error } = await supabase.functions.invoke("generate-gift-message", {
        body: { prompt: `You are a professional chef timer assistant. Based on the recipe or dish the user describes, create a detailed multi-step cooking timeline with precise timers. For each step provide: 1) Step name, 2) Duration in minutes, 3) What to do during this time, 4) Temperature settings, 5) Visual/sensory cues for doneness. Also provide tips on parallel tasks to save time. Format each timer step clearly. User recipe: ${input}` },
      });
      if (error) throw error;
      const msg = data?.message || data?.text || "No result";
      setResult(msg);
      // Parse simple timers from the response
      const timerRegex = /(\d+)\s*(?:minutes?|mins?)/gi;
      const matches = [...msg.matchAll(timerRegex)];
      const parsed: TimerItem[] = matches.slice(0, 6).map((m, i) => ({
        label: `Step ${i + 1}`,
        seconds: parseInt(m[1]) * 60,
        remaining: parseInt(m[1]) * 60,
        running: false,
      }));
      if (parsed.length > 0) setTimers(parsed);
    } catch (e: any) { toast({ title: "Error", description: e.message, variant: "destructive" }); }
    finally { setLoading(false); }
  };

  const toggleTimer = (idx: number) => {
    setTimers(prev => prev.map((t, i) => {
      if (i !== idx) return t;
      if (t.running) {
        clearInterval(intervalsRef.current[idx]);
        delete intervalsRef.current[idx];
        return { ...t, running: false };
      } else {
        const id = setInterval(() => {
          setTimers(p => p.map((tt, ii) => {
            if (ii !== idx) return tt;
            if (tt.remaining <= 1) {
              clearInterval(intervalsRef.current[idx]);
              delete intervalsRef.current[idx];
              toast({ title: `⏰ ${tt.label} Complete!`, description: "Time's up for this step." });
              return { ...tt, remaining: 0, running: false };
            }
            return { ...tt, remaining: tt.remaining - 1 };
          }));
        }, 1000);
        intervalsRef.current[idx] = id;
        return { ...t, running: true };
      }
    }));
  };

  const resetTimer = (idx: number) => {
    if (intervalsRef.current[idx]) {
      clearInterval(intervalsRef.current[idx]);
      delete intervalsRef.current[idx];
    }
    setTimers(prev => prev.map((t, i) => i === idx ? { ...t, remaining: t.seconds, running: false } : t));
  };

  useEffect(() => {
    return () => { Object.values(intervalsRef.current).forEach(clearInterval); };
  }, []);

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <>
      <FloatingHowItWorks title="How AICooking Timer works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Tap buttons, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Check output and save or share.' },
          { title: 'Iterate', desc: 'Repeat or refine anytime — progress is saved.' },
        ]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Back</Button>
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-500/30">
          <Timer className="h-5 w-5 text-blue-400" />
          <span className="font-bold text-blue-400">AI Cooking Timer</span>
          <span className="text-xs bg-blue-500/20 px-2 py-0.5 rounded-full text-blue-300">3 Credits</span>
        </div>
        <p className="text-muted-foreground text-sm">Describe your recipe and get intelligent multi-step timers</p>
      </div>
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/60">
        <Textarea placeholder="E.g. I'm making a roast chicken with roasted vegetables and gravy. Help me time everything perfectly..." value={input} onChange={(e) => setInput(e.target.value)} rows={4} className="mb-4" />
        <Button onClick={analyze} disabled={loading || !input.trim()} className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
          {loading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Creating Timers...</> : <><Sparkles className="h-4 w-4 mr-2" /> Generate Smart Timers</>}
        </Button>
      </Card>

      {timers.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {timers.map((t, i) => (
            <Card key={i} className={`p-4 text-center border-2 transition-colors ${t.running ? 'border-blue-500 bg-blue-500/5' : t.remaining === 0 ? 'border-green-500 bg-green-500/5' : 'border-border/60 bg-card/80'}`}>
              <p className="text-xs font-semibold text-muted-foreground mb-1">{t.label}</p>
              <p className={`text-3xl font-mono font-black ${t.running ? 'text-blue-400' : t.remaining === 0 ? 'text-green-400' : 'text-foreground'}`}>{fmt(t.remaining)}</p>
              <div className="flex gap-2 mt-3 justify-center">
                <Button size="sm" variant="outline" onClick={() => toggleTimer(i)} disabled={t.remaining === 0}>
                  {t.running ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </Button>
                <Button size="sm" variant="outline" onClick={() => resetTimer(i)}>
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {result && (
        <Card className="p-6 bg-card/80 backdrop-blur-xl border-blue-500/30">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2"><Timer className="h-5 w-5 text-blue-400" /> Cooking Timeline</h3>
          <div className="whitespace-pre-line text-sm text-muted-foreground leading-relaxed">{result}</div>
        </Card>
      )}
    </div>
    </>
    );
}
