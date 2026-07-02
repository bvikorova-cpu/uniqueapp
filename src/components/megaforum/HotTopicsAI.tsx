import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Sparkles, TrendingUp, Zap, Loader2, MessageSquare, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface HotTopicsAIProps {
  onBack: () => void;
}

export const HotTopicsAI = ({ onBack }: HotTopicsAIProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [topics, setTopics] = useState<any[]>([]);
  const [summary, setSummary] = useState("");
  const [summaryInput, setSummaryInput] = useState("");
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [mode, setMode] = useState<"topics" | "summary">("topics");

  const generateTopics = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("megaforum-ai", {
        body: { action: "trending_topics" },
      });
      if (error) throw error;
      setTopics(data.topics || []);
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const summarizeThread = async () => {
    if (!summaryInput.trim()) return;
    setIsSummarizing(true);
    try {
      const { data, error } = await supabase.functions.invoke("megaforum-ai", {
        body: { action: "summarize", content: summaryInput },
      });
      if (error) throw error;
      setSummary(data.summary || "");
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setIsSummarizing(false);
    }
  };

  return (
    <div className="space-y-6">
      <FloatingHowItWorks
        title={"Hot Topics A I"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
        🤖 Hot Topics AI
      </h2>

      <Card className="bg-card/80 backdrop-blur-xl border-amber-500/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-bold text-amber-400">Premium AI Feature</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Get AI-powered trending topic suggestions and thread summaries. Costs 5 AI credits per use.
          </p>
        </CardContent>
      </Card>

      {/* Mode Tabs */}
      <div className="flex gap-2">
        <Button
          variant={mode === "topics" ? "default" : "outline"}
          onClick={() => setMode("topics")}
          className="gap-2"
        >
          <TrendingUp className="h-4 w-4" /> Trending Topics
        </Button>
        <Button
          variant={mode === "summary" ? "default" : "outline"}
          onClick={() => setMode("summary")}
          className="gap-2"
        >
          <MessageSquare className="h-4 w-4" /> Thread Summary
        </Button>
      </div>

      {mode === "topics" && (
        <div className="space-y-4">
          <Button
            onClick={generateTopics}
            disabled={isGenerating}
            className="w-full gap-2"
            variant="hero"
          >
            {isGenerating ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Generate Trending Topics (5 credits)</>
            )}
          </Button>

          {topics.length > 0 && (
            <div className="grid gap-3">
              {topics.map((topic: any, i: number) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="bg-card/80 backdrop-blur-xl hover:shadow-lg transition-all border-primary/10">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{topic.emoji || "💡"}</div>
                        <div className="flex-1">
                          <h4 className="font-bold">{topic.title}</h4>
                          <p className="text-sm text-muted-foreground mt-1">{topic.description}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {(topic.tags || []).map((tag: string, j: number) => (
                              <Badge key={j} variant="secondary" className="text-[10px]">{tag}</Badge>
                            ))}
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            🔥 Predicted engagement: <span className="font-bold text-amber-400">{topic.engagement || "High"}</span>
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {mode === "summary" && (
        <div className="space-y-4">
          <Textarea
            placeholder="Paste a discussion thread here to get an AI summary..."
            value={summaryInput}
            onChange={(e) => setSummaryInput(e.target.value)}
            className="min-h-[150px]"
          />
          <Button
            onClick={summarizeThread}
            disabled={isSummarizing || !summaryInput.trim()}
            className="w-full gap-2"
            variant="hero"
          >
            {isSummarizing ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Summarizing...</>
            ) : (
              <><Lightbulb className="h-4 w-4" /> Summarize Thread (5 credits)</>
            )}
          </Button>

          {summary && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" /> AI Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm whitespace-pre-wrap">{summary}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};
