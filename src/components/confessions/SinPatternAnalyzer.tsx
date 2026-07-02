import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, Brain, AlertTriangle, CheckCircle, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface PatternAnalysis {
  input: string;
  analysis: string;
  timestamp: string;
}

export const SinPatternAnalyzer = () => {
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyses, setAnalyses] = useState<PatternAnalysis[]>([]);

  const analyzePatterns = async () => {
    if (!input.trim()) {
      toast({ title: "Please describe your recurring patterns", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Sign in required", variant: "destructive" });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-reincarnation-plan", {
        body: {
          planName: "Sin Pattern Analysis",
          goalDescription: `You are an AI behavioral pattern analyst on a confession platform. A user describes recurring behaviors or patterns they want to understand. Analyze:

1. **Root Causes**: What underlying emotions or needs drive this pattern
2. **Triggers**: Common situations that activate this behavior
3. **Impact Assessment**: How this pattern affects their life and relationships
4. **Breaking the Cycle**: 3-5 practical steps to change this pattern
5. **Growth Potential**: What positive qualities this pattern reveals when redirected

User's description: ${input}

Provide a compassionate, insightful analysis in markdown format. Be specific and actionable.`,
        },
      });

      if (error) throw error;

      const analysis = data?.plan?.next_life_goal ||
        data?.plan?.soul_missions?.map((m: any) => m.mission).join("\n\n") ||
        "Analysis could not be generated. Please try again.";

      setAnalyses(prev => [{
        input: input.trim(),
        analysis,
        timestamp: new Date().toISOString(),
      }, ...prev]);

      setInput("");
      toast({ title: "Pattern Analysis Complete!" });
    } catch (error: any) {
      toast({ title: "Analysis Failed", description: error.message, variant: "destructive" });
    } finally {
      setAnalyzing(false);
    }
  };

  const examplePatterns = [
    "I keep procrastinating on important decisions",
    "I find myself being dishonest to avoid conflict",
    "I struggle with anger when things don't go my way",
    "I tend to isolate myself when I'm stressed",
  ];

  return (
    <>
      <FloatingHowItWorks
        title='Sin Pattern Analyzer'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Sin Pattern Analyzer panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-6 bg-card/80 backdrop-blur-xl border-border/50">
        <h3 className="text-lg font-black mb-2">Sin Pattern Analyzer</h3>
        <p className="text-sm text-muted-foreground">
          Describe your recurring behaviors or patterns, and the AI will analyze root causes,
          triggers, and provide actionable steps for breaking negative cycles and fostering growth.
        </p>
      </Card>

      {/* Input Section */}
      <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Eye className="h-4 w-4 text-primary" />
          <h4 className="font-bold text-sm">Describe Your Pattern</h4>
        </div>
        <Textarea
          placeholder="Describe a recurring behavior, habit, or pattern you want to understand..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
        />

        {/* Example prompts */}
        <div className="flex flex-wrap gap-2">
          {examplePatterns.map((p, i) => (
            <Button key={i} variant="outline" size="sm" className="text-[10px] h-7" onClick={() => setInput(p)}>
              <Sparkles className="h-3 w-3 mr-1" />{p.substring(0, 35)}...
            </Button>
          ))}
        </div>

        <Button onClick={analyzePatterns} disabled={analyzing} className="w-full" size="lg">
          {analyzing ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing Patterns...</>
          ) : (
            <><Brain className="mr-2 h-4 w-4" /> Analyze Pattern</>
          )}
        </Button>
      </Card>

      {/* Results */}
      {analyses.length > 0 && (
        <div className="space-y-4">
          {analyses.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="p-5 bg-card/80 backdrop-blur-xl border-border/50">
                <div className="flex items-start gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Pattern Described:</p>
                    <p className="text-sm">{a.input}</p>
                  </div>
                </div>
                <div className="border-t border-border/30 pt-3 mt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <p className="text-xs font-bold text-primary">AI Analysis:</p>
                  </div>
                  <div className="prose prose-sm dark:prose-invert max-w-none text-xs">
                    <ReactMarkdown>{a.analysis}</ReactMarkdown>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-3">
                  {new Date(a.timestamp).toLocaleString()}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {analyses.length === 0 && (
        <Card className="p-8 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <TrendingUp className="h-12 w-12 mx-auto text-primary/30 mb-3" />
          <p className="text-muted-foreground mb-1">No patterns analyzed yet</p>
          <p className="text-xs text-muted-foreground">Describe a recurring behavior to receive AI-powered insights</p>
        </Card>
      )}
    </div>
    </>
  );
};
