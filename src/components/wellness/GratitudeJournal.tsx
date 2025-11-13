import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWellnessProgress } from "@/hooks/useWellnessProgress";

export function GratitudeJournal() {
  const [entry, setEntry] = useState("");
  const [analysis, setAnalysis] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [moodRating, setMoodRating] = useState<number>(3);
  const { toast } = useToast();
  const { saveJournalEntry, updateStats, isSavingJournal } = useWellnessProgress();

  const analyzeEntry = async () => {
    if (!entry.trim()) {
      toast({
        title: "Empty entry",
        description: "Please write something first",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysis("");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/wellness-mindfulness-chat`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: `Analyze this gratitude journal entry and provide encouraging insights in 2-3 sentences: "${entry}"`,
              },
            ],
          }),
        }
      );

      if (!response.ok || !response.body) {
        throw new Error("Failed to analyze");
      }

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
            if (content) {
              result += content;
              setAnalysis(result);
            }
          } catch (e) {
            buffer = line + "\n" + buffer;
            break;
          }
        }
      }

      toast({
        title: "Analysis complete",
        description: "Your entry has been analyzed",
      });

      // Save journal entry with AI insights
      await saveJournalEntry({
        entryText: entry,
        moodRating,
        aiInsights: result,
        tags: ["gratitude"],
      });

      // Update statistics
      await updateStats({ activityType: "journal" });
      
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Error",
        description: "Failed to analyze entry",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Gratitude Journal</CardTitle>
        <CardDescription>
          Write what you're grateful for today, and get AI-powered insights
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">How are you feeling today?</label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <Button
                key={rating}
                variant={moodRating === rating ? "default" : "outline"}
                size="sm"
                onClick={() => setMoodRating(rating)}
                className="text-lg"
              >
                {"😊".repeat(rating)}
              </Button>
            ))}
          </div>
        </div>

        <Textarea
          value={entry}
          onChange={(e) => setEntry(e.target.value)}
          placeholder="Today I'm grateful for..."
          className="min-h-[150px]"
        />

        <Button onClick={analyzeEntry} disabled={isAnalyzing || isSavingJournal || !entry.trim()}>
          {isAnalyzing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Get AI Insights & Save
            </>
          )}
        </Button>

        {analysis && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <p className="text-sm">{analysis}</p>
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}
