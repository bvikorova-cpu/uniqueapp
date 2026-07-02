import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Zap, Brain, TrendingUp, Loader2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface MoodEntry {
  id: string;
  mood_score: number;
  energy_score: number;
  stress_score: number;
  notes: string | null;
  created_at: string;
  mentor_area: string;
}

export function MoodTracker() {
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [stress, setStress] = useState(5);
  const [notes, setNotes] = useState("");
  const [area, setArea] = useState("career");
  const [history, setHistory] = useState<MoodEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("mentor_moods")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(14);
    setHistory((data as MoodEntry[]) || []);
  };

  const saveMood = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase.from("mentor_moods").insert({
        user_id: user.id,
        mentor_area: area as any,
        mood_score: mood,
        energy_score: energy,
        stress_score: stress,
        notes: notes || null,
      });
      if (error) throw error;
      toast({ title: "Mood Logged ✅", description: "+10 XP earned!" });
      setNotes("");
      await loadHistory();
    } catch {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const getAIInsight = async () => {
    if (history.length < 3) {
      toast({ title: "Need More Data", description: "Log at least 3 mood entries first" });
      return;
    }
    setLoadingInsight(true);
    try {
      const { data, error } = await supabase.functions.invoke("mentor-ai-tools", {
        body: { action: "mood-insight" },
      });
      if (error) throw error;
      setInsight(data.insight);
    } catch {
      toast({ title: "Error", description: "Could not get insight", variant: "destructive" });
    } finally {
      setLoadingInsight(false);
    }
  };

  const getMoodEmoji = (score: number) => {
    if (score <= 2) return "😢";
    if (score <= 4) return "😐";
    if (score <= 6) return "🙂";
    if (score <= 8) return "😊";
    return "🤩";
  };

  const getColor = (score: number, type: "mood" | "energy" | "stress") => {
    if (type === "stress") return score <= 3 ? "text-green-400" : score <= 6 ? "text-yellow-400" : "text-red-400";
    return score <= 3 ? "text-red-400" : score <= 6 ? "text-yellow-400" : "text-green-400";
  };

  // Simple sparkline
  const renderSparkline = (key: "mood_score" | "energy_score" | "stress_score") => {
    const data = [...history].reverse().slice(-7);
    if (data.length < 2) return null;
    const max = 10;
    const w = 120;
    const h = 32;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * w},${h - (d[key] / max) * h}`).join(" ");
    return (
      <>
        <FloatingHowItWorks title="How Mood Tracker works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Learn, quiz, generate or configure. AI actions cost credits.' },
          { title: 'Review results', desc: 'Progress and history are saved.' },
          { title: 'Iterate', desc: 'Repeat or level up anytime.' },
        ]} />
        <svg width={w} height={h} className="opacity-60">
        <polyline fill="none" stroke="currentColor" strokeWidth="1.5" points={points} />
      </svg>
      </>
      );
  };

  return (
    <Card className="backdrop-blur-xl bg-card/80 border-primary/20 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Smile className="h-4 w-4 text-primary" /> Mood & Energy Tracker
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)} className="h-7 w-7 p-0">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Area selector */}
        <Select value={area} onValueChange={setArea}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="career">🎯 Career</SelectItem>
            <SelectItem value="fitness">💪 Fitness</SelectItem>
            <SelectItem value="mindset">🧠 Mindset</SelectItem>
            <SelectItem value="relationships">❤️ Relationships</SelectItem>
          </SelectContent>
        </Select>

        {/* Quick log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><Smile className="h-3.5 w-3.5" /> Mood</div>
            <span className="text-lg">{getMoodEmoji(mood)} <span className={`font-bold ${getColor(mood, "mood")}`}>{mood}</span></span>
          </div>
          <Slider value={[mood]} onValueChange={([v]) => setMood(v)} min={1} max={10} step={1} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><Zap className="h-3.5 w-3.5" /> Energy</div>
            <span className={`font-bold ${getColor(energy, "energy")}`}>{energy}/10</span>
          </div>
          <Slider value={[energy]} onValueChange={([v]) => setEnergy(v)} min={1} max={10} step={1} />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm"><Brain className="h-3.5 w-3.5" /> Stress</div>
            <span className={`font-bold ${getColor(stress, "stress")}`}>{stress}/10</span>
          </div>
          <Slider value={[stress]} onValueChange={([v]) => setStress(v)} min={1} max={10} step={1} />

          <Textarea
            placeholder="How are you feeling today? (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[50px] resize-none text-sm"
          />

          <Button onClick={saveMood} disabled={saving} className="w-full" size="sm">
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Log Today's Mood
          </Button>
        </div>

        {/* Sparkline charts */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className="space-y-3 pt-2 border-t border-border/30">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "Mood", key: "mood_score" as const, icon: "😊" },
                    { label: "Energy", key: "energy_score" as const, icon: "⚡" },
                    { label: "Stress", key: "stress_score" as const, icon: "🧠" },
                  ].map((item) => (
                    <div key={item.key} className="text-center p-2 rounded-lg bg-muted/30">
                      <p className="text-xs text-muted-foreground mb-1">{item.icon} {item.label}</p>
                      <div className="flex justify-center text-primary">{renderSparkline(item.key)}</div>
                      {history.length > 0 && (
                        <p className="text-xs font-bold mt-1">
                          Avg: {(history.reduce((s, h) => s + h[item.key], 0) / history.length).toFixed(1)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* Recent entries */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">Recent Entries</p>
                  {history.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between text-xs p-1.5 rounded bg-muted/20">
                      <span className="text-muted-foreground">{new Date(entry.created_at).toLocaleDateString()}</span>
                      <div className="flex gap-2">
                        <span>{getMoodEmoji(entry.mood_score)} {entry.mood_score}</span>
                        <span>⚡{entry.energy_score}</span>
                        <span>🧠{entry.stress_score}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* AI Insight */}
                <Button onClick={getAIInsight} disabled={loadingInsight} variant="outline" className="w-full text-xs" size="sm">
                  {loadingInsight ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                  AI Mood Analysis — 3 Credits
                </Button>

                {insight && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                    <p className="font-semibold mb-1 flex items-center gap-1"><TrendingUp className="h-3 w-3" /> AI Insight</p>
                    <p className="text-muted-foreground whitespace-pre-wrap">{insight}</p>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
