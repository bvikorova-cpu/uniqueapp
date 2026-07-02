import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Brain, Sparkles, Zap, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props { onBack: () => void; }

export const AIEmotionAnalysis = ({ onBack }: Props) => {
  const [text, setText] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => { loadHistory(); }, []);

  const loadHistory = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any).from("psychology_emotion_analyses")
      .select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10);
    if (data) setHistory(data);
  };

  const analyze = async () => {
    if (!text.trim() || text.length < 20) {
      toast.error("Please enter at least 20 characters for accurate analysis.");
      return;
    }
    setAnalyzing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in"); return; }

      const { data, error } = await supabase.functions.invoke("psychology-ai", {
        body: { action: "emotion-analysis", text: text.trim() },
      });
      if (error) throw error;
      setResult(data);
      loadHistory();
      toast.success("Analysis complete! 5 credits used.");
    } catch (e: any) {
      if (e.message?.includes("credits") || e.message?.includes("Insufficient")) {
        toast.error("Insufficient credits. Please purchase more.");
      } else {
        toast.error("Analysis failed: " + (e.message || "Unknown error"));
      }
    } finally { setAnalyzing(false); }
  };

  const getEmotionColor = (emotion: string) => {
    const map: Record<string, string> = {
      joy: "bg-yellow-500/20 text-yellow-600", sadness: "bg-blue-500/20 text-blue-600",
      anger: "bg-red-500/20 text-red-600", fear: "bg-purple-500/20 text-purple-600",
      surprise: "bg-orange-500/20 text-orange-600", disgust: "bg-green-500/20 text-green-600",
      trust: "bg-emerald-500/20 text-emerald-600", anticipation: "bg-pink-500/20 text-pink-600",
    };
    return map[emotion.toLowerCase()] || "bg-muted text-muted-foreground";
  };

  return (
    <>
      <FloatingHowItWorks title={"A I Emotion Analysis - How it works"} steps={[{ title: 'Open', desc: 'Access the A I Emotion Analysis section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in A I Emotion Analysis.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-2">
          AI Emotion Analysis
        </h2>
        <p className="text-muted-foreground">Analyze text for emotional patterns, sentiment, and psychological insights.</p>
        <Badge variant="outline" className="mt-2 gap-1">
          <Zap className="h-3 w-3" /> 5 Credits per Analysis
        </Badge>
      </motion.div>

      {/* Input */}
      <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Enter Text to Analyze
        </h3>
        <Textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Paste a conversation, journal entry, message, or any text you'd like to analyze for emotional content..."
          rows={6}
          className="mb-4"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{text.length} characters (min 20)</span>
          <Button onClick={analyze} disabled={analyzing || text.length < 20} className="gap-2">
            {analyzing ? (
              <><Sparkles className="h-4 w-4 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Analyze Emotions (5 credits)</>
            )}
          </Button>
        </div>
      </Card>

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Analysis Result
            </h3>

            {result.emotions && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-2">Detected Emotions:</p>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(result.emotions) ? result.emotions : []).map((e: any, i: number) => (
                    <Badge key={i} className={getEmotionColor(e.emotion || e)}>
                      {e.emotion || e} {e.score ? `(${Math.round(e.score * 100)}%)` : ""}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {result.sentiment && (
              <div className="mb-4">
                <p className="text-sm font-medium mb-1">Overall Sentiment:</p>
                <Badge variant={result.sentiment === "positive" ? "default" : result.sentiment === "negative" ? "destructive" : "secondary"}>
                  {result.sentiment}
                </Badge>
              </div>
            )}

            {result.analysis && (
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{result.analysis}</ReactMarkdown>
              </div>
            )}

            {result.suggestions && (
              <div className="mt-4 p-4 bg-primary/5 rounded-lg">
                <p className="text-sm font-medium mb-2">💡 Suggestions:</p>
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{result.suggestions}</ReactMarkdown>
                </div>
              </div>
            )}
          </Card>
        </motion.div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-bold text-lg">Previous Analyses</h3>
          {history.map((h, i) => (
            <motion.div key={h.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="p-4 bg-card/50 backdrop-blur-sm border-border/50 cursor-pointer hover:bg-card/80"
                onClick={() => setResult(h.analysis_result)}>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm truncate">{h.input_text}</p>
                    <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="outline" className="ml-2 shrink-0">{h.credits_used} credits</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
