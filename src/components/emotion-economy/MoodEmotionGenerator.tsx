import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, Loader2, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { safeInvoke } from "@/utils/safeInvoke";
import { useToast } from "@/hooks/use-toast";

const EMOTION_META: Record<string, { label: string; emoji: string }> = {
  joy: { label: "Joy", emoji: "😄" },
  love: { label: "Love", emoji: "❤️" },
  motivation: { label: "Motivation", emoji: "⚡" },
  peace: { label: "Peace", emoji: "☮️" },
  excitement: { label: "Excitement", emoji: "🎉" },
  sadness: { label: "Sadness", emoji: "💧" },
  anger: { label: "Anger", emoji: "🔥" },
  fear: { label: "Fear", emoji: "🌫️" },
};

const COST = 2;

interface Props { onBack: () => void; }

interface GenResult {
  dominant_emotion: string;
  breakdown: Record<string, number>;
  insight: string;
  total_units: number;
}

export function MoodEmotionGenerator({ onBack }: Props) {
  const { toast } = useToast();
  const [moodText, setMoodText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GenResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    void fetchHistory();
  }, []);

  const fetchHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any)
      .from("emotion_mood_generations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (data) setHistory(data);
  };

  const handleGenerate = async () => {
    if (moodText.trim().length < 3 || loading) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResult(null);
    const { data, error } = await safeInvoke<GenResult & { error?: string }>("verify-emotion-insurance", {
      body: { action: "mood_generate", mood_text: moodText.trim() },
    });
    setLoading(false);

    if (error || !data || (data as any).error) {
      const msg = error || (data as any)?.error || "Try again";
      toast({
        title: msg.toLowerCase().includes("credit") ? "Insufficient credits" : "Generation failed",
        description: msg.toLowerCase().includes("credit")
          ? `You need ${COST} AI credits for a mood reading. Top up your credits first.`
          : msg,
        variant: "destructive",
      });
      return;
    }

    setResult(data);
    setMoodText("");
    window.dispatchEvent(new Event("ai-credits-updated"));
    void fetchHistory();
    toast({
      title: "Emotions generated!",
      description: `${data.total_units} emotion units added to your wallet.`,
    });
  };

  const maxValue = result ? Math.max(1, ...Object.values(result.breakdown)) : 1;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <Card className="border-violet-500/20 bg-gradient-to-br from-violet-500/5 via-pink-500/5 to-cyan-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-6 w-6 text-violet-400" />
            Mood Emotion Generator
          </CardTitle>
          <CardDescription>
            Describe how you feel right now — AI converts your mood into emotion units credited to your wallet.
            Costs {COST} credits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={moodText}
            onChange={(e) => setMoodText(e.target.value)}
            placeholder="e.g. Tired after a long day but proud of what I finished..."
            rows={4}
            maxLength={800}
          />
          <Button onClick={handleGenerate} disabled={loading || moodText.trim().length < 3} className="w-full gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? "Reading your mood..." : `Generate emotions (${COST} credits)`}
          </Button>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 rounded-xl border border-violet-500/20 bg-background/40 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                  Dominant: {EMOTION_META[result.dominant_emotion]?.emoji}{" "}
                  {EMOTION_META[result.dominant_emotion]?.label ?? result.dominant_emotion}
                </p>
                <Badge variant="outline">+{result.total_units} units</Badge>
              </div>

              <div className="space-y-2">
                {Object.entries(result.breakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>
                          {EMOTION_META[key]?.emoji} {EMOTION_META[key]?.label ?? key}
                        </span>
                        <span className="font-mono text-muted-foreground">+{value}</span>
                      </div>
                      <Progress value={(value / maxValue) * 100} className="h-1.5" />
                    </div>
                  ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">{result.insight}</p>
            </motion.div>
          )}

          {history.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Recent readings</p>
              {history.map((h) => (
                <div key={h.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2.5">
                  <span className="truncate text-xs text-muted-foreground pr-2">{h.mood_text}</span>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {EMOTION_META[h.dominant_emotion]?.emoji} {EMOTION_META[h.dominant_emotion]?.label ?? h.dominant_emotion}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default MoodEmotionGenerator;
