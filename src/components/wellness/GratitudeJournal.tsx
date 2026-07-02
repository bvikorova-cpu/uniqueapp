import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Heart, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWellnessProgress } from "@/hooks/useWellnessProgress";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const MOOD_EMOJIS = [
  { value: 1, emoji: "😔", label: "Down" },
  { value: 2, emoji: "😐", label: "Meh" },
  { value: 3, emoji: "🙂", label: "OK" },
  { value: 4, emoji: "😊", label: "Good" },
  { value: 5, emoji: "🤩", label: "Amazing" },
];

const PROMPTS = [
  "What made you smile today?",
  "Name something you're thankful for that you usually take for granted.",
  "Who is someone that made your day better recently?",
  "What's a small win you had today?",
];

export function GratitudeJournal() {
  const [entry, setEntry] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodRating, setMoodRating] = useState<number>(3);
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const { toast } = useToast();
  const { saveJournalEntry, updateStats, isSavingJournal } = useWellnessProgress();

  const analyzeEntry = async () => {
    if (!entry.trim()) {
      toast({ title: "Empty entry", description: "Please write something first", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setAnalysis("");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wellness-mindfulness-chat`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` },
          body: JSON.stringify({ messages: [{ role: "user", content: `Analyze this gratitude journal entry and provide encouraging insights in 2-3 sentences: "${entry}"` }] }),
        }
      );
      if (!response.ok || !response.body) throw new Error("Failed to analyze");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let result = "";
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        let newlineIndex: number;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          let line = buffer.slice(0, newlineIndex);
          buffer = buffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) { result += content; setAnalysis(result); }
          } catch { buffer = line + "\n" + buffer; break; }
        }
      }
      toast({ title: "Analysis complete", description: "Your entry has been analyzed" });
      await saveJournalEntry({ entryText: entry, moodRating, aiInsights: result, tags: ["gratitude"] });
      await updateStats({ activityType: "journal" });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({ title: "Error", description: "Failed to analyze entry", variant: "destructive" });
    } finally { setIsAnalyzing(false); }
  };

  return (
    <Card className="mt-4 relative overflow-hidden border-primary/20 backdrop-blur-xl bg-card/80">
      <FloatingHowItWorks title="GratitudeJournal — How it works" steps={[{title:"Open this tool",desc:"Access GratitudeJournal within the Health & Wellness section."},{title:"Configure",desc:"Adjust preferences, choose duration or select goals."},{title:"Start & interact",desc:"Begin the session, log data or run an AI analysis (some cost 3–5 credits)."},{title:"Review results",desc:"Check outcomes, save to history and track progress over time."}]} />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-primary/5 to-green-500/5" />
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-amber-500/10">
            <BookOpen className="w-5 h-5 text-amber-400" />
          </div>
          Gratitude Journal
        </CardTitle>
        <CardDescription>Write what you're grateful for today and receive AI-powered insights</CardDescription>
      </CardHeader>
      <CardContent className="relative space-y-4">
        {/* Mood Rating */}
        <div>
          <label className="text-sm font-medium mb-2 block">How are you feeling today?</label>
          <div className="flex gap-2">
            {MOOD_EMOJIS.map((m) => (
              <motion.button
                key={m.value}
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setMoodRating(m.value)}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all ${
                  moodRating === m.value
                    ? "border-primary/40 bg-primary/10 ring-1 ring-primary/20"
                    : "border-border/50 bg-card/60 hover:border-primary/20"
                }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] font-semibold text-muted-foreground">{m.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Quick prompts */}
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-2 block">Need inspiration?</label>
          <div className="flex flex-wrap gap-2">
            {PROMPTS.map((prompt) => (
              <Button
                key={prompt}
                variant="outline"
                size="sm"
                className={`text-xs h-auto py-1.5 border-border/50 ${activePrompt === prompt ? 'bg-primary/10 border-primary/30' : ''}`}
                onClick={() => { setActivePrompt(prompt); setEntry(prompt + "\n\n"); }}
              >
                <Sparkles className="h-3 w-3 mr-1 text-primary" />
                {prompt.substring(0, 35)}...
              </Button>
            ))}
          </div>
        </div>

        <Textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Today I'm grateful for..."
          className="min-h-[150px] backdrop-blur-sm"
        />

        <Button onClick={analyzeEntry} disabled={isAnalyzing || isSavingJournal || !entry.trim()} className="w-full active:scale-[0.97] transition-transform">
          {isAnalyzing ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Get AI Insights & Save</>
          )}
        </Button>

        {analysis && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start gap-2">
                  <Heart className="w-5 h-5 text-pink-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">AI Insights</p>
                    <p className="text-sm text-muted-foreground">{analysis}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
